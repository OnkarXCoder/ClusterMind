import { useEffect, useState } from 'react'
import { Plus, Send, Bell } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import Modal from '../../components/marketing/Modal'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminNotifications, createAdminNotification } from '../../api'

export default function AdminNotificationsPage() {
  const { show } = useToast()
  const [showSend, setShowSend] = useState(false)
  const [form, setForm] = useState({ type: 'Email', title: '', audience: '', message: '' })
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAdminNotifications()
      .then((res) => {
        if (Array.isArray(res)) setNotifications(res.map((n) => ({ ...n, id: n._id ?? n.id })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSend = async () => {
    if (!form.title || !form.audience) {
      show('Please fill required fields', 'error')
      return
    }
    const res = await createAdminNotification(form)
    if (res) {
      show(`Notification "${form.title}" sent`, 'success')
      setShowSend(false)
      setForm({ type: 'Email', title: '', audience: '', message: '' })
      load()
    } else {
      show('Unable to send notification (backend unavailable)', 'error')
    }
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue"><Bell size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Notification Management</h2>
          <p className="dm-hero-sub">{notifications.length} notifications sent</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={Plus} onClick={() => setShowSend(true)}>Send Notification</Button>
      </div>

      <div className="dm-grid-4">
        {['Email', 'Push', 'SMS'].map((type) => {
          const count = notifications.filter((n) => n.type === type).length
          return (
            <div key={type} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{type} Notifications</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
            </div>
          )
        })}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Avg Open Rate</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">64.8%</p>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading notifications..." />
      ) : (
      <ChartCard title="Notifications" subtitle="All sent and scheduled notifications">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="No notifications have been sent or scheduled yet."
          />
        ) : (
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Audience</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      n.type === 'Email' ? 'bg-blue-100 text-blue-700' : n.type === 'Push' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {n.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{n.title}</td>
                  <td>{n.audience}</td>
                  <td>{n.scheduled}</td>
                  <td><StatusBadge status={n.status === 'Sent' ? 'Completed' : 'Scheduled'} /></td>
                  <td style={{ fontWeight: 700 }}>{n.opened}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </ChartCard>
      )}

      <Modal
        open={showSend}
        onClose={() => setShowSend(false)}
        title="Send Notification"
        subtitle="Create and send a new notification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSend(false)}>Cancel</Button>
            <Button icon={Send} onClick={handleSend}>Send</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option>Email</option>
              <option>Push</option>
              <option>SMS</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Notification title" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Audience *</label>
            <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. All Customers" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Notification message..." />
          </div>
        </div>
      </Modal>
    </div>
  )
}
