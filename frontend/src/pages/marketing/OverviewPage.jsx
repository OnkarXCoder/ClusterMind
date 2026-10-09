import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LabelList,
  Legend,
} from 'recharts'
import { Users, Layers, Cpu, Megaphone, Banknote, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import CampaignTable from '../../components/marketing/CampaignTable'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getMarketingOverview, getSegments, getModels } from '../../api'

function SegmentDonut({ distribution, totalCustomers }) {
  const colors = distribution.map((s) => s.color)
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distribution}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {distribution.map((s, i) => (
              <Cell key={s.name} fill={colors[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${v}%`, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-black text-slate-900">{totalCustomers.toLocaleString()}</p>
        <p className="text-xs font-medium text-slate-400">Total</p>
      </div>
    </div>
  )
}

function ClusterScatter({ clusters }) {
  const legend = [...new Set(clusters.map((c) => c.name))]

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" dataKey="x" name="Spending" domain={[0, 13]} tick={false} />
          <YAxis type="number" dataKey="y" name="Frequency" domain={[0, 12]} tick={false} width={1} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          {legend.map((name) => {
            const color = clusters.find((c) => c.name === name).color
            return (
              <Scatter
                key={name}
                name={name}
                data={clusters.filter((c) => c.name === name)}
                fill={color}
              />
            )
          })}
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

function CampaignBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Performance']}
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={i === 2 ? '#7c3aed' : '#6366f1'} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} className="fill-slate-700" fontSize={12} fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const normalizeCampaign = (c) => ({
  id: c._id || c.id,
  name: c.name,
  segment: c.segment || '—',
  channel: c.channel || '—',
  startDate: c.startDate || '—',
  endDate: c.endDate || '—',
  status: c.status || 'Draft',
  performance: c.performance ?? 0,
})

const EMPTY_KPI = {
  totalCustomers: 0,
  activeSegments: 0,
  modelEvaluation: null,
  activeCampaigns: 0,
}

export default function OverviewPage() {
  const { show } = useToast()
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState(EMPTY_KPI)
  const [distribution, setDistribution] = useState([])
  const [clusters, setClusters] = useState([])
  const [campaignPerformance, setCampaignPerformance] = useState([])
  const [recentCampaigns, setRecentCampaigns] = useState([])
  const [modelInfo, setModelInfo] = useState(null)

  useEffect(() => {
    let active = true

    const loadOverview = async () => {
      try {
        const res = await getMarketingOverview()
        if (!active || !res) return
        if (res.stats) {
          setKpi((k) => ({
            ...k,
            activeSegments: res.stats.totalSegments ?? 0,
            activeCampaigns: res.stats.totalCampaigns ?? 0,
          }))
        }
        const campaigns = res.recentCampaigns ?? []
        setRecentCampaigns(campaigns.map(normalizeCampaign))
        setCampaignPerformance(campaigns.map((c) => ({ name: c.name, value: c.performance ?? 0 })))
      } catch {
        // leave empty placeholders
      }
    }

    const loadSegments = async () => {
      try {
        const live = await getSegments({ clusters: 5 })
        if (!active || !live) return
        if (live.totalCustomers) setKpi((k) => ({ ...k, totalCustomers: live.totalCustomers }))
        if (live.modelEvaluation != null) setKpi((k) => ({ ...k, modelEvaluation: live.modelEvaluation }))
        if (live.segments?.length) {
          setDistribution(live.segments.map((s) => ({ name: s.name, value: s.percentage, color: s.color })))
        }
        if (live.clusters?.length) setClusters(live.clusters)
      } catch {
        // leave empty placeholders
      }
    }

    const loadModels = async () => {
      try {
        const models = await getModels()
        if (!active || !Array.isArray(models) || !models.length) return
        const activeModel = models.find((m) => m.status === 'Active') || models[0]
        setModelInfo({
          name: activeModel.name,
          lastTrained: activeModel.lastTrained,
          evaluation: activeModel.evaluation,
        })
      } catch {
        // leave no model
      }
    }

    Promise.allSettled([loadOverview(), loadSegments(), loadModels()]).finally(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleRetrain = () => {
    show('Model training has been queued through the ML service.', 'success')
  }

  if (loading) {
    return (
      <div className="dm-page">
        <LoadingState label="Loading overview..." />
      </div>
    )
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue">
          <Megaphone className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Overview</h2>
        <p className="dm-hero-sub">Customer segmentation and campaign performance at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Customers Analyzed" value={kpi.totalCustomers.toLocaleString()} icon={Users} accent="from-violet-600 to-purple-600" />
        <KpiCard label="Active Segments" value={kpi.activeSegments} icon={Layers} accent="from-blue-600 to-cyan-500" />
        <KpiCard label="AI Model Evaluation" value={kpi.modelEvaluation != null ? `${kpi.modelEvaluation}%` : '—'} icon={Cpu} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Active Campaigns" value={kpi.activeCampaigns} icon={Megaphone} accent="from-pink-500 to-rose-500" />
        <KpiCard label="Revenue from Campaigns" value="—" icon={Banknote} accent="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Customer Segments" subtitle="Distribution across the active segments">
          {distribution.length ? (
            <SegmentDonut distribution={distribution} totalCustomers={kpi.totalCustomers} />
          ) : (
            <EmptyState title="No segment data" description="Segmentation data is not available yet." />
          )}
        </ChartCard>

        <ChartCard
          title="Customer Segmentation"
          subtitle="Cluster visualization"
          className="xl:col-span-2"
        >
          {clusters.length ? (
            <ClusterScatter clusters={clusters} />
          ) : (
            <EmptyState title="No cluster data" description="Train a segmentation model to visualize clusters." />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Campaign Performance" subtitle="Completion rate by campaign" className="xl:col-span-2">
          {campaignPerformance.length ? (
            <CampaignBar data={campaignPerformance} />
          ) : (
            <EmptyState title="No campaign data" description="Campaign performance will appear here." />
          )}
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="AI Recommendation Insights">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    Total Recommendations
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">—</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Accepted
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">—</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Conversion Rate</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">—</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Average Order Value</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">—</p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 p-4 text-sm text-white">
                <p className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </p>
                <p className="mt-1 text-xs leading-relaxed text-violet-100">
                  AI insights are generated from live segmentation data.
                </p>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Model Performance">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{modelInfo?.name || 'No model trained'}</p>
                <p className="text-xs text-slate-500">
                  Last Trained: {modelInfo?.lastTrained || '—'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600">
                    {modelInfo?.evaluation != null ? `${modelInfo.evaluation}%` : '—'}
                  </span>
                  {modelInfo && <StatusBadge status="Active" />}
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" icon={RefreshCw} onClick={handleRetrain}>
              Retrain Model
            </Button>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Recent Campaigns" subtitle="Latest activity across all active campaigns">
        <CampaignTable campaigns={recentCampaigns.slice(0, 5)} />
      </ChartCard>
    </div>
  )
}
