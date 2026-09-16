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
import { useToast } from '../../components/marketing/Toast'
import {
  KPI,
  SEGMENT_DISTRIBUTION,
  SEGMENT_CLUSTERS,
  CAMPAIGN_PERFORMANCE,
  AI_INSIGHTS,
  RECENT_CAMPAIGNS,
  MODEL_INFO,
  AI_ASSISTANT_MESSAGE,
} from '../../data/marketingMockData'

const SEGMENT_COLORS = SEGMENT_DISTRIBUTION.map((s) => s.color)

function SegmentDonut() {
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={SEGMENT_DISTRIBUTION}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {SEGMENT_DISTRIBUTION.map((s, i) => (
              <Cell key={s.name} fill={SEGMENT_COLORS[i]} />
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
        <p className="text-2xl font-black text-slate-900">{KPI.totalCustomers.toLocaleString()}</p>
        <p className="text-xs font-medium text-slate-400">Total</p>
      </div>
    </div>
  )
}

function ClusterScatter() {
  const legend = [...new Set(SEGMENT_CLUSTERS.map((c) => c.name))]

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
            const color = SEGMENT_CLUSTERS.find((c) => c.name === name).color
            return (
              <Scatter
                key={name}
                name={name}
                data={SEGMENT_CLUSTERS.filter((c) => c.name === name)}
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

function CampaignBar() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={CAMPAIGN_PERFORMANCE} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Performance']}
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {CAMPAIGN_PERFORMANCE.map((entry, i) => (
            <Cell key={entry.name} fill={i === 2 ? '#7c3aed' : '#6366f1'} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} className="fill-slate-700" fontSize={12} fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function OverviewPage() {
  const { show } = useToast()

  const handleRetrain = () => {
    show('Model training has been queued (frontend demo only).', 'success')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Customers Analyzed" value={KPI.totalCustomers.toLocaleString()} icon={Users} accent="from-violet-600 to-purple-600" change="+4.2% vs last month" />
        <KpiCard label="Active Segments" value={KPI.activeSegments} icon={Layers} accent="from-blue-600 to-cyan-500" change="+1 new segment" />
        <KpiCard label="AI Model Evaluation" value={`${KPI.modelEvaluation}%`} icon={Cpu} accent="from-emerald-500 to-teal-500" change="Silhouette score (mock)" />
        <KpiCard label="Active Campaigns" value={KPI.activeCampaigns} icon={Megaphone} accent="from-pink-500 to-rose-500" change="6 live right now" />
        <KpiCard label="Revenue from Campaigns" value="₹8,75,230" icon={Banknote} accent="from-amber-500 to-orange-500" change="+18.7% this period" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Customer Segments" subtitle="Distribution across the 5 active segments">
          <SegmentDonut />
        </ChartCard>

        <ChartCard
          title="Customer Segmentation"
          subtitle="Cluster visualization (UI only)"
          className="xl:col-span-2"
        >
          <ClusterScatter />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Campaign Performance" subtitle="Completion rate by campaign" className="xl:col-span-2">
          <CampaignBar />
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
                  <p className="mt-1 text-xl font-bold text-slate-900">{AI_INSIGHTS.totalRecommendations.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Accepted
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{AI_INSIGHTS.acceptedRecommendations.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Conversion Rate</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{AI_INSIGHTS.conversionRate}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Average Order Value</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">₹{AI_INSIGHTS.averageOrderValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 p-4 text-sm text-white">
                <p className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </p>
                <p className="mt-1 text-xs leading-relaxed text-violet-100">{AI_ASSISTANT_MESSAGE}</p>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Model Performance">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{MODEL_INFO.kmeans.name}</p>
                <p className="text-xs text-slate-500">
                  Last Trained: {MODEL_INFO.kmeans.lastTrained}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600">{MODEL_INFO.kmeans.evaluation}%</span>
                  <StatusBadge status="Active" />
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
        <CampaignTable campaigns={RECENT_CAMPAIGNS.slice(0, 5)} />
      </ChartCard>
    </div>
  )
}
