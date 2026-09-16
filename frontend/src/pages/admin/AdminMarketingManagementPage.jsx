import { useEffect, useState } from 'react'
import { Plus, Eye, Trash2, CalendarDays, TrendingUp } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { getAdminCampaigns, createAdminCampaign } from '../../api'
import { MARKETING_CAMPAIGNS as MOCK_MARKETING_CAMPAIGNS } from '../../data/adminMockData'

export default function AdminMarketingManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)
  const [viewCampaign, setViewCampaign] = useState(null)
  const [form, setForm] = useState({ name: '', segment: '', channel: '', type: '', startDate: '', endDate: '', budget: '' })
  const [campaigns, setCampaigns] = useState(MOCK_MARKETING_CAMPAIGNS)

  const load = () => {
    getAdminCampaigns().then((res) => {
      if (res) setCampaigns(res.map((c) => ({ ...c, id: c.campaignId ?? c.id })))
    })
  }

  useEffect(load, [])

  const statuses = ['All', 'Active', 'Completed', 'Scheduled', 'Paused', 'Draft']

  const filtered = campaigns.filter(
    (c) =>
      (statusFilter === 'All' || c.status === statusFilter) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.segment.toLowerCase().includes(search.toLowerCase())),
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Marketing Management</h2>
          <p className="text-sm text-slate-500">{campaigns.length} campaigns total</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search campaigns..." className="w-64" />
          <Button icon={Plus} onClick={() => setShowCreate(true)}>Create Campaign</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === s
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <ChartCard title="Campaigns" subtitle={`Showing ${filtered.length} campaigns`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Campaign</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Segment</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Channel</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Type</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Duration</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Budget</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Performance</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Status</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-5 py-4 text-slate-600">{c.segment}</td>
                  <td className="px-5 py-4 text-slate-600">{c.channel}</td>
                  <td className="px-5 py-4 text-slate-600">{c.type}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {c.startDate} - {c.endDate}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">₹{c.budget.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    {c.performance ? (
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        {c.performance}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewCampaign(c)}>View</Button>
                      <button onClick={() => show(`Deleted "${c.name}" (demo)`, 'success')} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
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
