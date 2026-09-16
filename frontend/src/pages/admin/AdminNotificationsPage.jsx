import { useEffect, useState } from 'react'
import { Plus, Send } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { getAdminNotifications, createAdminNotification } from '../../api'
import { NOTIFICATIONS_DATA as MOCK_NOTIFICATIONS_DATA } from '../../data/adminMockData'

export default function AdminNotificationsPage() {
  const { show } = useToast()
  const [showSend, setShowSend] = useState(false)
  const [form, setForm] = useState({ type: 'Email', title: '', audience: '', message: '' })
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS_DATA)

  const load = () => {
    getAdminNotifications().then((res) => {
      if (res) setNotifications(res.map((n) => ({ ...n, id: n._id ?? n.id })))
    })
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notification Management</h2>
          <p className="text-sm text-slate-500">{notifications.length} notifications sent</p>
        </div>
        <Button icon={Plus} onClick={() => setShowSend(true)}>Send Notification</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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

      <ChartCard title="Notifications" subtitle="All sent and scheduled notifications">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Title</th>
                <th className="px-5 py-3.5 font-semibold">Audience</th>
                <th className="px-5 py-3.5 font-semibold">Scheduled</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <tr key={n.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      n.type === 'Email' ? 'bg-blue-100 text-blue-700' : n.type === 'Push' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{n.title}</td>
                  <td className="px-5 py-4 text-slate-600">{n.audience}</td>
                  <td className="px-5 py-4 text-slate-500">{n.scheduled}</td>
                  <td className="px-5 py-4"><StatusBadge status={n.status === 'Sent' ? 'Completed' : 'Scheduled'} /></td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{n.opened}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

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
