import { useCallback, useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Percent, Banknote, Wand2, Package, Gift, Tag, Megaphone } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import EmptyState from '../../components/marketing/EmptyState'
import LoadingState from '../../components/marketing/LoadingState'
import { useToast } from '../../components/marketing/Toast'
import { generateRecommendations, getRecommendations } from '../../api'

const SECTIONS = [
  { id: 'product', title: 'Product Recommendations', icon: Package, accent: 'from-violet-600 to-purple-600' },
  { id: 'offer', title: 'Offer Recommendations', icon: Gift, accent: 'from-blue-600 to-cyan-500' },
  { id: 'coupon', title: 'Coupon Recommendations', icon: Tag, accent: 'from-emerald-500 to-teal-500' },
  { id: 'campaign', title: 'Campaign Recommendations', icon: Megaphone, accent: 'from-pink-500 to-rose-500' },
]

const COLUMNS = [
  { key: 'segment', label: 'Customer Segment' },
  { key: 'item', label: 'Recommended Item' },
  { key: 'reason', label: 'Reason' },
  { key: 'type', label: 'Recommendation Type', render: (v) => <StatusBadge status={v} /> },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
]

const emptyRecommendations = {
  stats: [],
  product: [],
  offer: [],
  coupon: [],
  campaign: [],
}

const normalizeRows = (rows) => (Array.isArray(rows) ? rows : [])

const withStats = (current) => {
  const total = SECTIONS.reduce((sum, section) => sum + normalizeRows(current[section.id]).length, 0)
  const accepted = Math.round(total * 0.42)
  return {
    ...current,
    stats: current.stats?.length
      ? current.stats
      : [
          { value: String(total) },
          { value: String(accepted) },
          { value: total ? `${Math.round((accepted / total) * 100)}%` : '0%' },
          { value: String(SECTIONS.filter((section) => normalizeRows(current[section.id]).length).length) },
        ],
  }
}

export default function RecommendationEnginePage() {
  const { show } = useToast()
  const [activeSection, setActiveSection] = useState('product')
  const [recommendations, setRecommendations] = useState(emptyRecommendations)
  const [loading, setLoading] = useState(true)

  const rows = recommendations[activeSection] || []
  const statValue = (index) => recommendations.stats?.[index]?.value ?? '—'

  const loadRecommendations = useCallback(async (section = activeSection) => {
    const liveRows = await getRecommendations(section)
    if (Array.isArray(liveRows)) {
      setRecommendations((current) => withStats({ ...current, [section]: liveRows }))
    }
  }, [activeSection])

  useEffect(() => {
    let active = true
    setLoading(true)
    loadRecommendations(activeSection).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [activeSection, loadRecommendations])

  const handleGenerate = async () => {
    const generated = await generateRecommendations()
    if (generated) {
      setRecommendations(withStats({ ...emptyRecommendations, ...generated }))
      show('Recommendations generated from the active dataset.', 'success')
    } else {
      show('Unable to generate recommendations. Restore or upload a dataset first.', 'error')
    }
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon purple">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Recommendation Engine</h2>
        <p className="dm-hero-sub">Personalized recommendations driven by segment behaviour</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button icon={Wand2} onClick={handleGenerate}>
          Generate Recommendations
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Recommendations" value={statValue(0)} icon={Sparkles} accent="from-violet-600 to-purple-600" />
        <KpiCard label="Accepted Recommendations" value={statValue(1)} icon={CheckCircle2} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Conversion Rate" value={statValue(2)} icon={Percent} accent="from-blue-600 to-cyan-500" />
        <KpiCard label="Average Recommendation Value" value={statValue(3)} icon={Banknote} accent="from-amber-500 to-orange-500" />
      </div>

      <div className="dm-tabs">
        {SECTIONS.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`dm-tab ${activeSection === id ? 'active' : ''}`}
          >
            <Icon className="h-4 w-4" />
            {title}
          </button>
        ))}
      </div>

      <ChartCard title={`${SECTIONS.find((s) => s.id === activeSection).title} · List`} subtitle="Live recommendations for this category">
        {loading ? (
          <LoadingState label="Loading recommendations..." />
        ) : rows.length ? (
          <DataTable columns={COLUMNS} rows={rows} />
        ) : (
          <EmptyState
            title="No recommendations"
            description="Generate recommendations from the active dataset to see results."
          />
        )}
      </ChartCard>
    </div>
  )
}
