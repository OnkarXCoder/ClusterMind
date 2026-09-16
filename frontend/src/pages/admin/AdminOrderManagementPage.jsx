import { useEffect, useState } from 'react'
import { Eye, Download, RotateCcw } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { getAdminOrders, getAdminRefunds, updateAdminRefundStatus } from '../../api'
import { ORDERS as MOCK_ORDERS, REFUND_REQUESTS as MOCK_REFUND_REQUESTS } from '../../data/adminMockData'

export default function AdminOrderManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewOrder, setViewOrder] = useState(null)
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [refunds, setRefunds] = useState(MOCK_REFUND_REQUESTS)

  const load = () => {
    getAdminOrders().then((res) => {
      if (res) setOrders(res.map((o) => ({ ...o, id: o.orderId ?? o.id })))
    })
    getAdminRefunds().then((res) => {
      if (res) setRefunds(res.map((r) => ({ ...r, id: r._id ?? r.id })))
    })
  }

  useEffect(load, [])

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded']

  const filtered = orders.filter(
    (o) =>
      (statusFilter === 'All' || o.status === statusFilter) &&
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase())),
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
          <p className="text-sm text-slate-500">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search orders..." className="w-64" />
          <Button variant="secondary" icon={Download} onClick={() => show('Export coming soon', 'info')}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {statuses.map((s) => {
          const count = s === 'All' ? orderStats.total : orderStats[s.toLowerCase()] || 0
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl border-2 px-4 py-3 text-center transition ${
                statusFilter === s
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs font-medium">{s}</p>
            </button>
          )
        })}
      </div>

      <ChartCard title={`${statusFilter} Orders`} subtitle={`Showing ${filtered.length} orders`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Order ID</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Customer</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Items</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Total</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Payment</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Status</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Date</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                <tr key={o.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{o.id}</td>
                  <td className="px-5 py-4 text-slate-700">{o.customer}</td>
                  <td className="px-5 py-4 text-slate-600">{o.items} items</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">₹{o.total.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{o.payment}</td>
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-4 text-slate-500">{o.date}</td>
                  <td className="px-5 py-4">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewOrder(o)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title="Refund Requests" subtitle="Pending and processed refunds">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3.5 font-semibold">Order ID</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
                <th className="px-5 py-3.5 font-semibold">Reason</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refunds.map((r, i) => (
                <tr key={i} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{r.orderId}</td>
                  <td className="px-5 py-4 text-slate-700">{r.customer}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">₹{r.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{r.reason}</td>
                  <td className="px-5 py-4"><StatusBadge status={r.status === 'Refunded' ? 'Completed' : r.status === 'Approved' ? 'Active' : 'Pending'} /></td>
                  <td className="px-5 py-4">
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
      </ChartCard>

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
                <span className="text-sm font-semibold text-slate-900">{typeof val === 'number' && key === 'total' ? `₹${val.toLocaleString()}` : val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
