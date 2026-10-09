import { useEffect, useState } from 'react'
import { Eye, Download, RotateCcw, ShoppingCart } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminOrders, getAdminRefunds, updateAdminRefundStatus } from '../../api'

export default function AdminOrderManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewOrder, setViewOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      getAdminOrders(),
      getAdminRefunds(),
    ])
      .then(([ordersRes, refundsRes]) => {
        if (Array.isArray(ordersRes)) setOrders(ordersRes.map((o) => ({ ...o, id: o.orderId ?? o.id })))
        if (Array.isArray(refundsRes)) setRefunds(refundsRes.map((r) => ({ ...r, id: r._id ?? r.id })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded']

  const filtered = orders.filter(
    (o) =>
      (statusFilter === 'All' || o.status === statusFilter) &&
      (String(o.id || '').toLowerCase().includes(search.toLowerCase()) ||
        String(o.customer || '').toLowerCase().includes(search.toLowerCase())),
  )

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    returned: orders.filter((o) => o.status === 'Returned').length,
    refunded: orders.filter((o) => o.status === 'Refunded').length,
  }

  const approveRefund = async (r) => {
    const res = await updateAdminRefundStatus(r.id, 'Approved')
    if (res) {
      show(`Refund approved for ${r.orderId}`, 'success')
      load()
    } else {
      show(`Unable to approve refund for ${r.orderId} (backend unavailable)`, 'error')
    }
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon orange"><ShoppingCart size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Order Management</h2>
          <p className="dm-hero-sub">{orders.length} total orders</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div className="dm-tabs" style={{ flexWrap: 'wrap' }}>
          {statuses.map((s) => {
            const count = s === 'All' ? orderStats.total : orderStats[s.toLowerCase()] || 0
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className={`dm-tab ${statusFilter === s ? 'active' : ''}`}>
                {s} ({count})
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search orders..." className="w-64" />
          <Button variant="secondary" icon={Download} onClick={() => show('Export coming soon', 'info')}>Export</Button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading orders..." />
      ) : (
        <>
          <ChartCard title={`${statusFilter} Orders`} subtitle={`Showing ${filtered.length} orders`}>
            {orders.length === 0 ? (
              <EmptyState
                title="No orders"
                description="No orders are available yet."
              />
            ) : (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>{o.id}</td>
                        <td>{o.customer}</td>
                        <td>{o.items} items</td>
                        <td style={{ fontWeight: 700 }}>₹{Number(o.total || 0).toLocaleString()}</td>
                        <td>{o.payment}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>{o.date}</td>
                        <td>
                          <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewOrder(o)}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>

          <ChartCard title="Refund Requests" subtitle="Pending and processed refunds">
            {refunds.length === 0 ? (
              <EmptyState
                title="No refund requests"
                description="No refund requests are available yet."
              />
            ) : (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{r.orderId}</td>
                        <td>{r.customer}</td>
                        <td style={{ fontWeight: 700 }}>₹{Number(r.amount || 0).toLocaleString()}</td>
                        <td>{r.reason}</td>
                        <td><StatusBadge status={r.status === 'Refunded' ? 'Completed' : r.status === 'Approved' ? 'Active' : 'Pending'} /></td>
                        <td>
                          {r.status === 'Pending' && (
                            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => approveRefund(r)}>
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}

      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`Order ${viewOrder?.id}`}
        subtitle={`Placed by ${viewOrder?.customer}`}
      >
        {viewOrder && (
          <div className="space-y-3">
            {Object.entries(viewOrder).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-semibold text-slate-900">{typeof val === 'number' && key === 'total' ? `₹${val.toLocaleString()}` : String(val ?? '')}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
