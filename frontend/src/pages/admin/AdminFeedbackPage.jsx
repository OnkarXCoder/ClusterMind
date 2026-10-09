import { useEffect, useState } from 'react'
import { MessageSquare, ThumbsUp, AlertTriangle, Lightbulb, Headphones, Star, CheckCircle2 } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminFeedback, updateAdminFeedbackStatus } from '../../api'

export default function AdminFeedbackPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAdminFeedback()
      .then((res) => {
        if (Array.isArray(res)) setFeedbacks(res.map((f) => ({ ...f, id: f._id ?? f.id })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const types = ['All', 'Review', 'Complaint', 'Suggestion', 'Feedback', 'Ticket']

  const filtered = feedbacks.filter(
    (f) =>
      (typeFilter === 'All' || f.type === typeFilter) &&
      (String(f.customer || '').toLowerCase().includes(search.toLowerCase()) ||
        String(f.content || '').toLowerCase().includes(search.toLowerCase())),
  )

  const resolve = async (f) => {
    const res = await updateAdminFeedbackStatus(f.id, 'Resolved')
    if (res) {
      show(`Feedback marked as resolved`, 'success')
      load()
    } else {
      show('Unable to update feedback (backend unavailable)', 'error')
    }
  }

  const typeIcons = {
    Review: Star,
    Complaint: AlertTriangle,
    Suggestion: Lightbulb,
    Feedback: ThumbsUp,
    Ticket: Headphones,
  }

  const typeColors = {
    Review: 'bg-yellow-100 text-yellow-700',
    Complaint: 'bg-red-100 text-red-700',
    Suggestion: 'bg-blue-100 text-blue-700',
    Feedback: 'bg-green-100 text-green-700',
    Ticket: 'bg-purple-100 text-purple-700',
  }

  const stats = {
    total: feedbacks.length,
    reviews: feedbacks.filter((f) => f.type === 'Review').length,
    complaints: feedbacks.filter((f) => f.type === 'Complaint').length,
    open: feedbacks.filter((f) => f.status === 'Open' || f.status === 'In Progress').length,
    avgRating: feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0,
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon green"><MessageSquare size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Feedback Management</h2>
          <p className="dm-hero-sub">Reviews, complaints, suggestions, and support tickets</p>
        </div>
      </div>

      <div className="dm-grid-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Feedback</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reviews</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.reviews}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Complaints</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.complaints}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Issues</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.open}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search feedback..." className="w-64" />
      </div>

      <div className="dm-tabs" style={{ flexWrap: 'wrap' }}>
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`dm-tab ${typeFilter === t ? 'active' : ''}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading feedback..." />
      ) : (
      <ChartCard title="Feedback & Support" subtitle={`Showing ${filtered.length} items`}>
        {feedbacks.length === 0 ? (
          <EmptyState
            title="No feedback"
            description="No feedback, reviews, or support tickets are available yet."
          />
        ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const Icon = typeIcons[f.type] || MessageSquare
            return (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4 transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[f.type] || 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{f.customer}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeColors[f.type]}`}>{f.type}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{f.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span>{f.product}</span>
                        <span>⭐ {f.rating}/5</span>
                        <span>{f.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={f.status} />
                    {f.status !== 'Resolved' && (
                      <Button variant="ghost" size="sm" icon={CheckCircle2} onClick={() => resolve(f)}>Resolve</Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </ChartCard>
      )}
    </div>
  )
}
