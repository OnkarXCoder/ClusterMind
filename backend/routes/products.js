import { Router } from 'express'
import Product from '../models/Product.js'
import { buildGiftFilter, getGiftRecipients, resolveGiftRecipient } from '../data/giftRecipients.js'

const router = Router()

router.get('/gift-recipients', (req, res) => {
  res.json({ recipients: getGiftRecipients() })
})

router.get('/', async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, minRating, inStock, sort, limit, giftRecipient } = req.query
    const filter = {}
    const or = []

    if (category && category !== 'All') filter.category = category
    if (search) {
      const q = String(search).trim()
      if (q) {
        or.push(
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        )
      }
    }
    if (brand) filter.brand = brand

    const applyRangeAndFacetFilters = (base) => {
      const next = { ...base }
      if (or.length) next.$or = or
      if (minPrice || maxPrice) {
        next.price = {}
        if (minPrice) next.price.$gte = Number(minPrice)
        if (maxPrice) next.price.$lte = Number(maxPrice)
      }
      if (minRating) next.rating = { $gte: Number(minRating) }
      if (inStock === 'true' || inStock === 'instock') next.stock = { $gt: 0 }
      return next
    }

    let finalFilter = applyRangeAndFacetFilters(filter)
    let giftFallbackUsed = false

    if (giftRecipient) {
      const key = resolveGiftRecipient(giftRecipient)
      if (key) {
        // Prefer explicit giftTags so tagged products are never diluted by
        // loose category matches. Only fall back when nothing is tagged.
        const tagged = applyRangeAndFacetFilters({ ...filter, giftTags: key })
        const taggedCount = await Product.countDocuments(tagged)
        if (taggedCount > 0) {
          finalFilter = tagged
        } else {
          const fallback = buildGiftFilter(key)
          if (fallback) {
            finalFilter = applyRangeAndFacetFilters({
              ...filter,
              $or: or.length ? [...or, ...fallback.$or] : fallback.$or,
            })
            giftFallbackUsed = true
          }
        }
      }
    }

    let query = Product.find(finalFilter)
    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      reviews: { reviews: -1 },
      featured: { createdAt: -1 },
    }
    if (sortMap[sort]) query = query.sort(sortMap[sort])
    if (limit) query = query.limit(Number(limit))

    const products = await query.lean()
    res.json({ products, count: products.length, giftFallbackUsed })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category')
    res.json({ categories: categories.sort() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    res.json({ product })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
