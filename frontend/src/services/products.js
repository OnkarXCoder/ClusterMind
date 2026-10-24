import { MAIN_CATEGORY_NAMES, categoryMatches, getCategoryAliases } from '../data/categoryCatalog'
import { resolveProductImage } from '../utils/productImages'

const API_BASE = '/api/products'

function getToken() {
  return localStorage.getItem('clustermind_token')
}

function headers() {
  const h = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

const IMAGE_KEY = 'clustermind_product_images'

const readImageOverrides = () => {
  try { return JSON.parse(localStorage.getItem(IMAGE_KEY) || '{}') } catch { return {} }
}
const saveImageOverrides = (map) => localStorage.setItem(IMAGE_KEY, JSON.stringify(map))

export const getUploadedImage = (id) => readImageOverrides()[String(id)] || ''
export const setProductImage = (id, dataUrl) => {
  const map = readImageOverrides(); map[String(id)] = dataUrl; saveImageOverrides(map)
}
export const resetProductImage = (id) => {
  const map = readImageOverrides(); delete map[String(id)]; saveImageOverrides(map)
}

const withOverride = (p) => {
  if (!p) return p
  const uploaded = getUploadedImage(p.id || p._id)
  return uploaded ? { ...p, image: uploaded } : p
}

const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const normaliseProduct = (p) => {
  if (!p) return null
  const id = p._id || p.id
  const price = toNumber(p.price)
  const oldPrice = toNumber(p.oldPrice, price)
  const discount = p.discount ?? (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0)

  return withOverride({
    ...p,
    id,
    name: p.name || 'Unnamed Product',
    brand: p.brand || 'Generic',
    category: p.category || 'General',
    image: resolveProductImage(p),
    price,
    oldPrice,
    discount: toNumber(discount),
    rating: toNumber(p.rating),
    reviews: toNumber(p.reviews),
    stock: toNumber(p.stock),
    inStock: p.inStock ?? toNumber(p.stock) > 0,
    aiRecommended: Boolean(p.aiRecommended),
    freeDelivery: p.freeDelivery ?? true,
  })
}

async function fetchProducts(params = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.category && params.category !== 'All') qs.set('category', params.category)
  if (params.brand) qs.set('brand', params.brand)
  if (params.minPrice) qs.set('minPrice', params.minPrice)
  if (params.maxPrice) qs.set('maxPrice', params.maxPrice)
  if (params.minRating) qs.set('minRating', params.minRating)
  if (params.inStock) qs.set('inStock', 'true')
  if (params.sort) qs.set('sort', params.sort)
  if (params.limit) qs.set('limit', params.limit)
  if (params.giftRecipient) qs.set('giftRecipient', params.giftRecipient)

  const url = `${API_BASE}?${qs.toString()}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch products')
  const data = await res.json()
  return data.products || data || []
}

export const getCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/categories`, { headers: headers() })
    if (!res.ok) throw new Error()
    const data = await res.json()
    const dbCategories = data.categories || []
    return [...new Set([...MAIN_CATEGORY_NAMES, ...dbCategories])]
  } catch {
    return MAIN_CATEGORY_NAMES
  }
}

export const getBrands = async () => {
  try {
    const products = await fetchProducts()
    return [...new Set(products.map(p => p.brand).filter(Boolean))]
  } catch {
    return []
  }
}

export const getProducts = async ({
  search = '',
  category = 'All',
  brands = [],
  price = '',
  ratings = [],
  availability = '',
  subcategory = '',
} = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    const aliases = getCategoryAliases(category)
    const useServerCategory = aliases.length === 1 && category && category !== 'All' && category !== 'All Products'
    if (useServerCategory) params.category = category
    if (brands.length) params.brand = brands[0]
    if (availability === 'instock') params.inStock = true

    if (price) {
      if (price === 'under500') params.maxPrice = 500
      else if (price === '500-5000') { params.minPrice = 500; params.maxPrice = 5000 }
      else if (price === '5000-20000') { params.minPrice = 5000; params.maxPrice = 20000 }
      else if (price === 'above20000') params.minPrice = 20000
    }

    if (ratings.length) params.minRating = Math.max(...ratings)

    let products = await fetchProducts(params)

    if (!useServerCategory && category && category !== 'All' && category !== 'All Products') {
      products = products.filter((p) => categoryMatches(p.category, category))
    }

    if (subcategory) {
      const q = subcategory.toLowerCase()
      products = products.filter((p) =>
        `${p.name || ''} ${p.category || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase().includes(q)
      )
    }

    if (brands.length > 1) {
      products = products.filter(p => brands.includes(p.brand))
    }

    return products.map(normaliseProduct).filter(Boolean)
  } catch {
    return []
  }
}

export const getProductById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { headers: headers() })
    if (!res.ok) throw new Error()
    const data = await res.json()
    const p = data.product || data
    return normaliseProduct(p)
  } catch {
    return null
  }
}

export const searchProducts = (q) => getProducts({ search: q })

export const getGallery = (product) => {
  if (!product) return []
  const img = product.image || product.thumbnail || ''
  return img ? [img, img, img] : []
}

export const getSpecifications = (product) => {
  if (!product) return []
  return [
    ['Brand', product.brand || 'N/A'],
    ['Model', product.name || 'N/A'],
    ['Category', product.category || 'N/A'],
    ['Color', 'Black / Blue / White'],
    ['In The Box', '1 Product, Charging Cable, Documentation'],
    ['Warranty', '1 Year Manufacturer Warranty'],
    ['Country of Origin', 'India'],
    ['Item Weight', '280 g'],
  ]
}

const REVIEWS_BASE = '/api/reviews'

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function normaliseReview(r) {
  return {
    ...r,
    id: r.id || r._id,
    name: r.name || r.customerName || 'Customer',
    date: formatDate(r.createdAt),
    verified: Boolean(r.verifiedPurchase),
    title: r.title || '',
    comment: r.comment || '',
    helpful: Number(r.helpful) || 0,
  }
}

export const getProductReviews = async (productId, { sort = 'newest', limit = 20 } = {}) => {
  if (!productId) return { reviews: [], summary: { average: 0, count: 0, distribution: {} }, viewerHasReviewed: false }
  try {
    const qs = new URLSearchParams({ sort, limit: String(limit) }).toString()
    const res = await fetch(`${REVIEWS_BASE}/product/${productId}?${qs}`, { headers: headers() })
    if (!res.ok) throw new Error(`reviews ${res.status}`)
    const data = await res.json()
    return {
      reviews: (data.reviews || []).map(normaliseReview),
      summary: data.summary || { average: 0, count: 0, distribution: {} },
      viewerHasReviewed: Boolean(data.viewerHasReviewed),
    }
  } catch {
    // Reviews are optional content - never let them break the product page.
    return { reviews: [], summary: { average: 0, count: 0, distribution: {} }, viewerHasReviewed: false }
  }
}

export const createProductReview = async (productId, { rating, title, comment }) => {
  const res = await fetch(`${REVIEWS_BASE}/product/${productId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ rating, title, comment }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Could not post your review.')
  return { ...data, review: data.review ? normaliseReview(data.review) : null }
}

export const markReviewHelpful = async (reviewId) => {
  const res = await fetch(`${REVIEWS_BASE}/${reviewId}/helpful`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Could not record your vote.')
  return data
}

export const deleteProductReview = async (reviewId) => {
  const res = await fetch(`${REVIEWS_BASE}/${reviewId}`, { method: 'DELETE', headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Could not delete the review.')
  return data
}

export const getSimilarProducts = async (product) => {
  if (!product) return []
  try {
    const products = await fetchProducts({ category: product.category })
    return products
      .filter(p => (p._id || p.id) !== (product._id || product.id))
      .slice(0, 4)
      .map(normaliseProduct)
      .filter(Boolean)
  } catch {
    return []
  }
}

export const getBoughtTogether = async (product) => {
  if (!product) return []
  try {
    const products = await fetchProducts({ limit: 4 })
    return products
      .filter(p => (p._id || p.id) !== (product._id || product.id))
      .slice(0, 3)
      .map(normaliseProduct)
      .filter(Boolean)
  } catch {
    return []
  }
}
