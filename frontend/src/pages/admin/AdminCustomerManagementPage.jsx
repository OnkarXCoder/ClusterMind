import { useEffect, useState } from 'react'
import { Eye, Ban, CheckCircle, ShoppingCart, Search as SearchIcon, Heart, MessageSquare } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { getAdminCustomers, updateAdminCustomerStatus } from '../../api'
import {
  CUSTOMERS as MOCK_CUSTOMERS,
  CUSTOMER_PURCHASE_HISTORY,
  CUSTOMER_BROWSING_HISTORY,
  CUSTOMER_SEARCH_HISTORY,
  CUSTOMER_WISHLIST,
  CUSTOMER_CART_ACTIVITY,
  CUSTOMER_FEEDBACK,
} from '../../data/adminMockData'

export default function AdminCustomerManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [detailTab, setDetailTab] = useState('purchase')
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)

  const load = () => {
    getAdminCustomers().then((res) => {
      if (res) setCustomers(res.map((c) => ({ ...c, id: c.customerId ?? c.id })))
    })
  }

  useEffect(load, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()),
  )

  const handleBlock = async (c) => {
    const nextStatus = c.status === 'Blocked' ? 'Active' : 'Blocked'
    const res = await updateAdminCustomerStatus(c.id, nextStatus)
    if (res) {
      show(`${c.status === 'Blocked' ? 'Unblocked' : 'Blocked'} ${c.name}`, 'success')
      load()
    } else {
      show(`Unable to update ${c.name} (backend unavailable)`, 'error')
    }
  }

  const tabs = [
    { key: 'purchase', label: 'Purchase History', icon: ShoppingCart },
    { key: 'browsing', label: 'Browsing History', icon: Eye },
    { key: 'search', label: 'Search History', icon: SearchIcon },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
    { key: 'cart', label: 'Cart Activity', icon: ShoppingCart },
    { key: 'feedback', label: 'Feedback & Reviews', icon: MessageSquare },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Management</h2>
          <p className="text-sm text-slate-500">{customers.length} total customers</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." className="w-64" />
      </div>

      <ChartCard title="All Customers" subtitle="Manage customer accounts">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">ID</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Name</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Email</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">City</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Segment</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Orders</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Spent</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Status</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{c.id}</td>
                  <td className="px-5 py-4 text-slate-700">{c.name}</td>
                  <td className="px-5 py-4 text-slate-500">{c.email}</td>
                  <td className="px-5 py-4 text-slate-600">{c.city}</td>
                  <td className="px-5 py-4"><StatusBadge status={c.segment === 'Premium' ? 'Active' : c.segment === 'Loyal' ? 'Completed' : c.segment === 'Inactive' ? 'Expired' : 'Draft'} /></td>
                  <td className="px-5 py-4 text-slate-700">{c.totalOrders}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">₹{c.totalSpent.toLocaleString()}</td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => { setSelectedCustomer(c); setDetailTab('purchase') }}>View</Button>
                      <button
                        onClick={() => handleBlock(c)}
                        className={`rounded-lg p-2 transition ${c.status === 'Blocked' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50'}`}
                        aria-label={c.status === 'Blocked' ? 'Unblock' : 'Block'}
                      >
                        {c.status === 'Blocked' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Customer Details'}
        subtitle={selectedCustomer?.email}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDetailTab(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    detailTab === t.key
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {detailTab === 'purchase' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="px-3 py-2 font-semibold">Order ID</th>
                      <th className="px-3 py-2 font-semibold">Date</th>
                      <th className="px-3 py-2 font-semibold">Items</th>
                      <th className="px-3 py-2 font-semibold">Total</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CUSTOMER_PURCHASE_HISTORY.map((o) => (
                      <tr key={o.orderId} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-semibold">{o.orderId}</td>
                        <td className="px-3 py-2.5 text-slate-500">{o.date}</td>
                        <td className="px-3 py-2.5 text-slate-600">{o.items}</td>
                        <td className="px-3 py-2.5 font-semibold">₹{o.total.toLocaleString()}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'browsing' && (
              <div className="space-y-2">
                {CUSTOMER_BROWSING_HISTORY.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-700">{b.page}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{b.duration}</span>
                      <span>{b.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'search' && (
              <div className="space-y-2">
                {CUSTOMER_SEARCH_HISTORY.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">&quot;{s.query}&quot;</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{s.results} results</span>
                      <span>{s.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'wishlist' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="px-3 py-2 font-semibold">Product</th>
                      <th className="px-3 py-2 font-semibold">Price</th>
                      <th className="px-3 py-2 font-semibold">Category</th>
                      <th className="px-3 py-2 font-semibold">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CUSTOMER_WISHLIST.map((w, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-semibold">{w.name}</td>
                        <td className="px-3 py-2.5">₹{w.price.toLocaleString()}</td>
                        <td className="px-3 py-2.5">{w.category}</td>
                        <td className="px-3 py-2.5 text-slate-500">{w.addedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'cart' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="px-3 py-2 font-semibold">Items</th>
                      <th className="px-3 py-2 font-semibold">Total</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CUSTOMER_CART_ACTIVITY.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5">{c.items}</td>
                        <td className="px-3 py-2.5 font-semibold">₹{c.total.toLocaleString()}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                        <td className="px-3 py-2.5 text-slate-500">{c.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'feedback' && (
              <div className="space-y-3">
                {CUSTOMER_FEEDBACK.map((f) => (
                  <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-violet-600">{f.type}</span>
                      <span className="text-xs text-slate-400">{f.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{f.content}</p>
                    <p className="mt-1 text-xs text-slate-500">Product: {f.product} | Rating: {'⭐'.repeat(f.rating)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
