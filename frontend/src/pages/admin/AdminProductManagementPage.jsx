import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Eye, Plus, Trash2, Package, ImagePlus, Upload, Sparkles, Truck, Star, Tag } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { createAdminProduct, deleteAdminProduct, getAdminProducts, updateAdminProduct } from '../../api'
import { giftRecipients } from '../../components/giftRules'

const emptyForm = {
  name: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  oldPrice: '',
  discount: '',
  stock: '',
  rating: '',
  reviews: '',
  badge: '',
  image: '/products/books.jpg',
  giftTags: '',
  aiRecommended: true,
  freeDelivery: true,
}

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export default function AdminProductManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedGiftTags = useMemo(
    () =>
      form.giftTags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    [form.giftTags]
  )

  const toggleGiftTag = (key) => {
    const next = selectedGiftTags.includes(key)
      ? selectedGiftTags.filter((tag) => tag !== key)
      : [...selectedGiftTags, key]
    setForm({ ...form, giftTags: next.join(', ') })
  }

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const openAddForm = () => {
    setForm(emptyForm)
    setEditingProduct(null)
    setImageError('')
    setShowAdd(true)
  }

  const productToForm = (product) => ({
    name: product.name || '',
    description: product.description || '',
    category: product.category || '',
    brand: product.brand === 'â€”' ? '' : product.brand || '',
    price: product.price ?? '',
    oldPrice: product.oldPrice ?? '',
    discount: product.discount ?? '',
    stock: product.stock ?? '',
    rating: product.rating ?? '',
    reviews: product.reviews ?? '',
    badge: product.badge || '',
    image: product.image || '/products/books.jpg',
    giftTags: Array.isArray(product.giftTags) ? product.giftTags.join(', ') : product.giftTags || '',
    aiRecommended: product.aiRecommended ?? true,
    freeDelivery: product.freeDelivery ?? true,
  })

  const openEditForm = (product) => {
    setEditingProduct(product)
    setForm(productToForm(product))
    setImageError('')
    setShowAdd(true)
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminProducts()
      setProducts(Array.isArray(res) ? res : [])
    } catch (err) {
      show(err.message || 'Unable to load products', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    )
  })

  const categories = useMemo(
    () =>
      [...new Set(products.map((p) => p.category).filter(Boolean))].map((name) => {
        const list = products.filter((p) => p.category === name)
        return {
          name,
          productCount: list.length,
          revenue: list.reduce((sum, p) => sum + Number(p.price || 0), 0),
          growth: 'Live',
        }
      }),
    [products],
  )

  const brands = useMemo(
    () =>
      [...new Set(products.map((p) => p.brand).filter(Boolean))].map((name) => {
        const count = products.filter((p) => p.brand === name).length
        return {
          name,
          products: count,
          marketShare: products.length ? Math.round((count / products.length) * 100) : 0,
        }
      }),
    [products],
  )

  const normalizeProduct = (product) => ({
    ...product,
    id: product.id || product._id,
    status:
      product.status ||
      (Number(product.stock || 0) === 0
        ? 'Out of Stock'
        : Number(product.stock || 0) < 15
          ? 'Low Stock'
          : 'Active'),
  })

  const handleSaveProduct = async () => {
    if (!form.name.trim() || !form.category.trim() || !form.price || Number(form.price) <= 0) {
      show('Please fill product name, category and price', 'error')
      return
    }
    if (Number(form.rating || 0) < 0 || Number(form.rating || 0) > 5) {
      show('Rating must be between 0 and 5', 'error')
      return
    }
    if (form.oldPrice && Number(form.oldPrice) < Number(form.price)) {
      show('Old price should be higher than the selling price', 'error')
      return
    }
    if (Number(form.discount || 0) < 0 || Number(form.discount || 0) > 100) {
      show('Discount must be between 0 and 100', 'error')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...form,
        giftTags: form.giftTags,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : '',
        discount: Number(form.discount || 0),
        stock: Number(form.stock || 0),
        rating: Number(form.rating || 0),
        reviews: Number(form.reviews || 0),
      }
      if (editingProduct) {
        const updated = await updateAdminProduct(editingProduct.id, payload)
        if (updated) {
          setProducts((prev) => prev.map((item) => (item.id === editingProduct.id ? normalizeProduct(updated) : item)))
        } else {
          await loadProducts()
        }
        show(`Product "${form.name}" updated successfully`, 'success')
      } else {
        const created = await createAdminProduct(payload)
        if (created) {
          setProducts((prev) => [normalizeProduct(created), ...prev])
        } else {
          await loadProducts()
        }
        show(`Product "${form.name}" added successfully`, 'success')
      }
      setShowAdd(false)
      setEditingProduct(null)
      setForm(emptyForm)
      setImageError('')
    } catch (err) {
      show(err.message || `Unable to ${editingProduct ? 'update' : 'add'} product`, 'error')
    } finally {
      setSaving(false)
    }

  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be smaller than 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result) }))
      setImageError('')
    }
    reader.onerror = () => setImageError('Unable to read this image.')
    reader.readAsDataURL(file)
  }

  const handleDelete = async (product) => {
    try {
      await deleteAdminProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      show(`Product "${product.name}" deleted`, 'success')
    } catch (err) {
      show(err.message || 'Unable to delete product', 'error')
    }
  }

  const tabs = [
    { key: 'products', label: 'Products' },
    { key: 'categories', label: 'Categories' },
    { key: 'brands', label: 'Brands' },
  ]

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon green"><Package size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Product Management</h2>
          <p className="dm-hero-sub">{loading ? 'Loading live catalog...' : `${products.length} live DB products across ${categories.length} categories`}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div className="dm-tabs">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`dm-tab ${activeTab === t.key ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="w-64" />
          <Button icon={Plus} onClick={openAddForm}>Add Product</Button>
        </div>
      </div>

      {activeTab === 'products' && (
        <ChartCard title="Products" subtitle="Live products from MongoDB">
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{String(p.id).slice(-6)}</td>
                    <td style={{ fontWeight: 700, color: '#1E293B' }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.brand}</td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>★ {p.rating}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewProduct(p)}>View</Button>
                        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditForm(p)}>Edit</Button>
                        <button onClick={() => handleDelete(p)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B', fontSize: '0.875rem' }}>
                      No products found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {activeTab === 'categories' && (
        <ChartCard title="Categories" subtitle="Generated from live products">
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Catalog Value</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>{c.productCount.toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(c.revenue)}</td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>{c.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {activeTab === 'brands' && (
        <ChartCard title="Brands" subtitle="Generated from live products">
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Products</th>
                  <th>Catalog Share</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.name}>
                    <td style={{ fontWeight: 700 }}>{b.name}</td>
                    <td>{b.products}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ height: 8, width: 128, overflow: 'hidden', borderRadius: 9999, background: '#F1F5F9' }}>
                          <div style={{ height: '100%', borderRadius: 9999, background: 'linear-gradient(to right, #EF4444, #F97316)', width: `${b.marketShare}%` }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{b.marketShare}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditingProduct(null) }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        subtitle={editingProduct ? 'Update product details in MongoDB' : 'Saved directly to MongoDB'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowAdd(false); setEditingProduct(null) }} disabled={saving}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={saving}>{saving ? 'Saving product...' : editingProduct ? 'Update Product' : 'Add Product'}</Button>
          </>
        }
      >
        <div className="product-add-form">
          <div className="product-form-callout">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
              <Sparkles size={16} /> Build a complete product listing
            </div>
            <p className="mt-1 text-xs leading-5 text-indigo-700">Add rich product details to improve search, recommendations, and customer confidence.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Product Name *</label>
            <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Noise Cancelling Headphones" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
            <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={3} maxLength={500} className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Describe the product, key features, and ideal use..." />
            <p className="mt-1 text-right text-xs text-slate-400">{form.description.length}/500</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Category *</label>
              <input list="product-categories" value={form.category} onChange={(e) => updateForm('category', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Electronics" />
              <datalist id="product-categories">{categories.map((item) => <option key={item.name} value={item.name} />)}</datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Brand</label>
              <input value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Apple" />
            </div>
          </div>
          <div className="product-form-section">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Star size={16} className="text-amber-500" /> Customer-facing details
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Rating</label>
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0 to 5" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Review Count</label>
                <input type="number" min="0" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500"><Tag size={13} /> Badge</label>
                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Best Seller" />
              </div>
            </div>
          </div>
          <div className="product-toggle-grid">
            <label className="product-toggle-card">
              <input type="checkbox" checked={form.aiRecommended} onChange={(e) => setForm({ ...form, aiRecommended: e.target.checked })} className="h-4 w-4 accent-indigo-600" />
              <span>
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-700"><Sparkles size={14} className="text-indigo-500" /> Include in AI picks</span>
                <span className="block text-xs text-slate-400">Show in personalized recommendations.</span>
              </span>
            </label>
            <label className="product-toggle-card">
              <input type="checkbox" checked={form.freeDelivery} onChange={(e) => setForm({ ...form, freeDelivery: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
              <span>
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-700"><Truck size={14} className="text-emerald-500" /> Free delivery</span>
                <span className="block text-xs text-slate-400">Mark this product as delivery eligible.</span>
              </span>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Price *</label>
              <input type="number" min="1" value={form.price} onChange={(e) => updateForm('price', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Stock</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => updateForm('stock', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Old Price</label>
              <input type="number" min="0" value={form.oldPrice} onChange={(e) => {
                const oldPrice = e.target.value
                const discount = Number(oldPrice) > Number(form.price) ? Math.round(((Number(oldPrice) - Number(form.price)) / Number(oldPrice)) * 100) : 0
                setForm((current) => ({ ...current, oldPrice, discount: discount ? String(discount) : current.discount }))
              }} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Optional" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Discount %</label>
              <input type="number" min="0" max="100" value={form.discount} onChange={(e) => updateForm('discount', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Auto-calculated" />
            </div>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
              <ImagePlus size={14} /> Product Image
            </label>
            <div className="product-image-field">
              <div className="product-image-preview">
                {form.image ? (
                  <img src={form.image} alt="Product preview" className="h-full w-full object-contain p-2" />
                ) : (
                  <ImagePlus size={30} className="text-slate-300" />
                )}
              </div>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600">
                  <Upload size={16} />
                  Choose image
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="sr-only" />
                </label>
                <p className="text-xs text-slate-400">PNG, JPG or WEBP. Maximum 2 MB.</p>
                <input value={form.image.startsWith('data:') ? '' : form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="/products/books.jpg or image URL" />
              </div>
            </div>
            {imageError && <p className="mt-2 text-xs font-medium text-red-600">{imageError}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Gift Tags</label>
            <div className="product-tag-picker">
              {giftRecipients.map((item) => {
                const active = selectedGiftTags.includes(item.key)
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleGiftTag(item.key)}
                    className={`product-tag-chip ${
                      active
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-red-300'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
            <input value={form.giftTags} onChange={(e) => setForm({ ...form, giftTags: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="girlfriend, mom, dad, brother" />
            <p className="mt-1 text-xs text-slate-400">Pick relations above or type comma separated tags. Drives the Gift Finder and Smart Gift Assistant.</p>
          </div>
          <div className="product-listing-preview">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Listing preview</p>
                <p className="mt-1 text-sm text-slate-300">This is how the product will appear to customers.</p>
              </div>
              {form.discount && <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold text-emerald-300">{form.discount}% OFF</span>}
            </div>
            <div className="flex gap-3">
              <img src={form.image || '/products/books.jpg'} alt="" className="h-20 w-20 rounded-lg bg-white object-contain p-1" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{form.name || 'Your product name'}</p>
                <p className="mt-1 text-xs text-slate-400">{form.brand || 'Brand'} / {form.category || 'Category'}</p>
                <p className="mt-2 text-lg font-bold text-white">{formatPrice(form.price)} {form.oldPrice && <span className="ml-1 text-xs font-normal text-slate-500 line-through">{formatPrice(form.oldPrice)}</span>}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
        title={viewProduct?.name || 'Product Details'}
        subtitle={viewProduct?.brand}
      >
        {viewProduct && (
          <div className="space-y-3">
            {Object.entries(viewProduct).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {typeof val === 'number' && key === 'price' ? formatPrice(val) : Array.isArray(val) ? val.join(', ') : String(val ?? '')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
