import { useEffect, useState } from 'react'
import { Plus, Eye, Trash2, CalendarDays, TrendingUp, Megaphone } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminCampaigns, createAdminCampaign } from '../../api'

export default function AdminMarketingManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)
  const [viewCampaign, setViewCampaign] = useState(null)
  const [form, setForm] = useState({ name: '', segment: '', channel: '', type: '', startDate: '', endDate: '', budget: '' })
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAdminCampaigns()
      .then((res) => {
        if (Array.isArray(res)) setCampaigns(res.map((c) => ({ ...c, id: c.campaignId ?? c.id })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const statuses = ['All', 'Active', 'Completed', 'Scheduled', 'Paused', 'Draft']

  const filtered = campaigns.filter(
    (c) =>
      (statusFilter === 'All' || c.status === statusFilter) &&
      (String(c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(c.segment || '').toLowerCase().includes(search.toLowerCase())),
  )

  const handleCreate = async () => {
    if (!form.name || !form.segment) {
      show('Please fill required fields', 'error')
      return
    }
    const res = await createAdminCampaign(form)
    if (res) {
      show(`Campaign "${form.name}" created`, 'success')
      setShowCreate(false)
      setForm({ name: '', segment: '', channel: '', type: '', startDate: '', endDate: '', budget: '' })
      load()
    } else {
      show('Unable to create campaign (backend unavailable)', 'error')
    }
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon red"><Megaphone size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Marketing Management</h2>
          <p className="dm-hero-sub">{campaigns.length} campaigns total</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div className="dm-tabs" style={{ flexWrap: 'wrap' }}>
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`dm-tab ${statusFilter === s ? 'active' : ''}`}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search campaigns..." className="w-64" />
          <Button icon={Plus} onClick={() => setShowCreate(true)}>Create Campaign</Button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading campaigns..." />
      ) : (
        <ChartCard title="Campaigns" subtitle={`Showing ${filtered.length} campaigns`}>
          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns"
              description="No marketing campaigns are available yet."
            />
          ) : (
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Segment</th>
                    <th>Channel</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Budget</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td>{c.segment}</td>
                      <td>{c.channel}</td>
                      <td>{c.type}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarDays size={14} />
                          {c.startDate} - {c.endDate}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{Number(c.budget || 0).toLocaleString()}</td>
                      <td>
                        {c.performance ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            <TrendingUp size={14} style={{ color: '#10B981' }} />
                            {c.performance}%
                          </span>
                        ) : '—'}
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewCampaign(c)}>View</Button>
                          <button onClick={() => show(`Deleted "${c.name}" (demo)`, 'success')} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
                            <Trash2 size={14} />
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
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Campaign"
        subtitle="Set up a new marketing campaign"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Campaign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Campaign Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Summer Sale" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Target Segment *</label>
              <input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Premium Customers" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Channel</label>
              <input value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="e.g. Email, WhatsApp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Budget (₹)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="₹0" />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewCampaign}
        onClose={() => setViewCampaign(null)}
        title={viewCampaign?.name}
        subtitle={`${viewCampaign?.segment} • ${viewCampaign?.channel}`}
      >
        {viewCampaign && (
          <div className="space-y-3">
            {Object.entries(viewCampaign).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-semibold text-slate-900">{typeof val === 'number' && key === 'budget' ? `₹${val.toLocaleString()}` : val || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
