import { useCallback, useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Percent, Banknote, Wand2, Package, Gift, Tag, Megaphone } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { RECOMMENDATIONS } from '../../data/marketingMockData'
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

export default function RecommendationEnginePage() {
  const { show } = useToast()
  const [activeSection, setActiveSection] = useState('product')
  const [recommendations, setRecommendations] = useState(RECOMMENDATIONS)

  const rows = recommendations[activeSection] || []

  const loadRecommendations = useCallback(async (section = activeSection) => {
    const liveRows = await getRecommendations(section)
    if (liveRows) {
      setRecommendations((current) => ({ ...current, [section]: liveRows }))
    }
  }, [activeSection])

  useEffect(() => {
    loadRecommendations(activeSection)
  }, [activeSection, loadRecommendations])

  const handleGenerate = async () => {
    const generated = await generateRecommendations()
    if (generated) {
      setRecommendations(generated)
      show('Recommendations generated from the active dataset.', 'success')
    } else {
      show('Unable to generate recommendations. Restore or upload a dataset first.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Recommendation Engine</h2>
          <p className="text-sm text-slate-500">Personalized recommendations driven by segment behaviour</p>
        </div>
        <Button icon={Wand2} onClick={handleGenerate}>
          Generate Recommendations
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Recommendations" value={recommendations.stats[0].value} icon={Sparkles} accent="from-violet-600 to-purple-600" />
        <KpiCard label="Accepted Recommendations" value={recommendations.stats[1].value} icon={CheckCircle2} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Conversion Rate" value={recommendations.stats[2].value} icon={Percent} accent="from-blue-600 to-cyan-500" />
        <KpiCard label="Average Recommendation Value" value={recommendations.stats[3].value} icon={Banknote} accent="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SECTIONS.map(({ id, title, icon: Icon, accent }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
              activeSection === id
                ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10'
                : 'border-slate-200 bg-white hover:border-violet-300'
            }`}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{(recommendations[id] || []).length} active</p>
            </div>
          </button>
        ))}
      </div>

      <ChartCard title={`${SECTIONS.find((s) => s.id === activeSection).title} · List`} subtitle="Live recommendations for this category">
        {rows.length ? <DataTable columns={COLUMNS} rows={rows} /> : <EmptyState />}
      </ChartCard>
    </div>
  )
}
