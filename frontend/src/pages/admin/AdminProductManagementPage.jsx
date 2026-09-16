import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { createAdminProduct, deleteAdminProduct, getAdminProducts } from '../../api'

const emptyForm = {
  name: '',
  category: '',
  brand: '',
  price: '',
  oldPrice: '',
  discount: '',
  stock: '',
  image: '/products/books.jpg',
  giftTags: '',
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
  const [viewProduct, setViewProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleAdd = async () => {
    if (!form.name || !form.category || !form.price) {
      show('Please fill product name, category and price', 'error')
      return
    }

    try {
      const created = await createAdminProduct({
        ...form,
        giftTags: form.giftTags,
        aiRecommended: true,
        freeDelivery: true,
      })
      if (created) {
        setProducts((prev) => [created, ...prev])
      } else {
        await loadProducts()
      }
      show(`Product "${form.name}" added successfully`, 'success')
      setShowAdd(false)
      setForm(emptyForm)
    } catch (err) {
      show(err.message || 'Unable to add product', 'error')
    }
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Management</h2>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading live catalog...' : `${products.length} live DB products across ${categories.length} categories`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="w-64" />
          <Button icon={Plus} onClick={() => setShowAdd(true)}>Add Product</Button>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === t.key
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <ChartCard title="Products" subtitle="Live products from MongoDB">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">ID</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Name</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Category</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Brand</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Price</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Stock</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Rating</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Status</th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{String(p.id).slice(-6)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-5 py-4 text-slate-600">{p.category}</td>
                    <td className="px-5 py-4 text-slate-600">{p.brand}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{formatPrice(p.price)}</td>
                    <td className="px-5 py-4 text-slate-700">{p.stock}</td>
                    <td className="px-5 py-4 text-slate-700">★ {p.rating}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewProduct(p)}>View</Button>
                        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => show('Edit support can be added next', 'info')}>Edit</Button>
                        <button onClick={() => handleDelete(p)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-500">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Products</th>
                  <th className="px-5 py-3.5 font-semibold">Catalog Value</th>
                  <th className="px-5 py-3.5 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.name} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="px-5 py-4 text-slate-700">{c.productCount.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{formatPrice(c.revenue)}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">{c.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {activeTab === 'brands' && (
        <ChartCard title="Brands" subtitle="Generated from live products">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Brand</th>
                  <th className="px-5 py-3.5 font-semibold">Products</th>
                  <th className="px-5 py-3.5 font-semibold">Catalog Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map((b) => (
                  <tr key={b.name} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{b.name}</td>
                    <td className="px-5 py-4 text-slate-700">{b.products}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${b.marketShare}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{b.marketShare}%</span>
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
        onClose={() => setShowAdd(false)}
        title="Add New Product"
        subtitle="Saved directly to MongoDB"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Product</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Product Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Enter product name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Category *</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Brand</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Apple" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Price *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Old Price</label>
              <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Optional" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Discount %</label>
              <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Image Path</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="/products/books.jpg" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Gift Tags</label>
            <input value={form.giftTags} onChange={(e) => setForm({ ...form, giftTags: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="girlfriend, mom, dad, brother" />
            <p className="mt-1 text-xs text-slate-400">Used by the Gift Finder feature.</p>
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
