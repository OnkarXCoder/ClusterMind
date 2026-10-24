import { useEffect, useState } from 'react'
import { Eye, Ban, CheckCircle, ShoppingCart, Search as SearchIcon, Heart, MessageSquare, Users } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminCustomer, getAdminCustomers, updateAdminCustomerStatus } from '../../api'

export default function AdminCustomerManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerDetails, setCustomerDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailTab, setDetailTab] = useState('purchase')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAdminCustomers()
      .then((res) => {
        if (Array.isArray(res)) setCustomers(res.map((c) => ({ ...c, id: c.customerId ?? c.id })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = customers.filter(
    (c) =>
      String(c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      String(c.city || '').toLowerCase().includes(search.toLowerCase()),
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

  const handleView = async (customer) => {
    setSelectedCustomer(customer)
    setDetailTab('purchase')
    setDetailsLoading(true)
    setCustomerDetails(null)
    try {
      const details = await getAdminCustomer(customer.id)
      setCustomerDetails(details || null)
      if (!details) show('Unable to load customer details.', 'error')
    } catch (err) {
      show(err.message || 'Unable to load customer details.', 'error')
    } finally {
      setDetailsLoading(false)
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

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon"><Users size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Customer Management</h2>
          <p className="dm-hero-sub">{customers.length} total customers</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." className="w-64" />
      </div>

      {loading ? (
        <LoadingState label="Loading customers..." />
      ) : (
        <ChartCard title="All Customers" subtitle="Manage customer accounts">
          {customers.length === 0 ? (
            <EmptyState
              title="No customers"
              description="No customer records are available yet."
            />
          ) : (
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Segment</th>
                    <th>Orders</th>
                    <th>Spent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.city}</td>
                      <td><StatusBadge status={c.segment === 'Premium' ? 'Active' : c.segment === 'Loyal' ? 'Completed' : c.segment === 'Inactive' ? 'Expired' : 'Draft'} /></td>
                      <td>{c.totalOrders}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(c.totalSpent || 0).toLocaleString()}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <Button variant="ghost" size="sm" icon={Eye} onClick={() => handleView(c)}>View</Button>
                          <button
                            onClick={() => handleBlock(c)}
                            style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: c.status === 'Blocked' ? '#10B981' : '#F87171' }}
                            aria-label={c.status === 'Blocked' ? 'Unblock' : 'Block'}
                          >
                            {c.status === 'Blocked' ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      )}

      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Customer Details'}
        subtitle={selectedCustomer?.email}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="dm-tabs" style={{ flexWrap: 'wrap' }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDetailTab(t.key)}
                  className={`dm-tab ${detailTab === t.key ? 'active' : ''}`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {detailsLoading ? (
              <LoadingState label="Loading customer activity..." />
            ) : detailTab === 'purchase' && customerDetails?.purchaseHistory?.length ? (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.purchaseHistory.map((order) => (
                      <tr key={order.orderId}>
                        <td style={{ fontWeight: 700 }}>{order.orderId}</td>
                        <td>{order.date}</td>
                        <td>{order.items}</td>
                        <td style={{ fontWeight: 700 }}>Rs {Number(order.total || 0).toLocaleString()}</td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : detailTab === 'purchase' ? (
              <EmptyState title="No purchase history" description="Purchase history for this customer is not available yet." />
            ) : null}

            {detailTab === 'browsing' && customerDetails?.browsingHistory?.length ? (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Source</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.browsingHistory.map((item) => (
                      <tr key={item.id}>
                        <td><StatusBadge status={item.action === 'view' ? 'Active' : 'Draft'} /></td>
                        <td style={{ fontWeight: 700 }}>{item.productName || 'Product'}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{item.source || 'N/A'}</td>
                        <td>{formatDate(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : detailTab === 'browsing' ? (
              <EmptyState
                title="No browsing history"
                description="Browsing activity for this customer is not available yet."
              />
            ) : null}

            {detailTab === 'search' && customerDetails?.searchHistory?.length ? (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Search Term</th>
                      <th>Category</th>
                      <th>Source</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.searchHistory.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.searchTerm}</td>
                        <td>{item.category || 'All'}</td>
                        <td>{item.source || 'N/A'}</td>
                        <td>{formatDate(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : detailTab === 'search' ? (
              <EmptyState
                title="No search history"
                description="Search activity for this customer is not available yet."
              />
            ) : null}

            {detailTab === 'wishlist' && customerDetails?.wishlist?.length ? (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.wishlist.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.productName}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{formatDate(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : detailTab === 'wishlist' ? (
              <EmptyState
                title="No wishlist items"
                description="This customer's wishlist is not available yet."
              />
            ) : null}

            {detailTab === 'cart' && customerDetails?.cartActivity?.length ? (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Source</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.cartActivity.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.productName || 'Product'}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{item.source || 'N/A'}</td>
                        <td>{formatDate(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : detailTab === 'cart' ? (
              <EmptyState
                title="No cart activity"
                description="Cart activity for this customer is not available yet."
              />
            ) : null}

            {detailTab === 'feedback' && customerDetails?.feedback?.length ? (
              <div className="space-y-3">
                {customerDetails.feedback.map((item) => (
                  <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.product || item.type}</span>
                      <span className="text-xs font-semibold text-slate-500">{item.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.content}</p>
                    <p className="mt-2 text-xs font-bold text-amber-600">Rating: {item.rating || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : detailTab === 'feedback' ? (
              <EmptyState title="No feedback" description="Feedback and reviews for this customer are not available yet." />
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  )
}
