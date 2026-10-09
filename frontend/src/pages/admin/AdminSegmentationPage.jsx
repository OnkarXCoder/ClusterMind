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
  Legend,
} from 'recharts'
import { useEffect, useState } from 'react'
import { Layers, Play } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import Button from '../../components/marketing/Button'
import { useToast } from '../../components/marketing/Toast'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { getSegments, syncCustomerDataset, trainModel } from '../../api'

const CLUSTERING_MODELS = [
  { key: 'kmeans', name: 'K-Means Clustering' },
  { key: 'dbscan', name: 'DBSCAN' },
  { key: 'hierarchical', name: 'Hierarchical Clustering' },
  { key: 'pca', name: 'PCA-Based Clustering' },
]

function SegmentDonut({ data }) {
  return (
    <div className="relative h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.segments}
            dataKey="percentage"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.segments.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${v}%`, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-black text-slate-900">12,456</p>
        <p className="text-xs font-medium text-slate-400">Total Customers</p>
      </div>
    </div>
  )
}

function ClusterScatter({ data }) {
  const legend = [...new Set(data.clusters.map((c) => c.name))]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" dataKey="x" name="Spending" domain={[0, 13]} tick={false} />
        <YAxis type="number" dataKey="y" name="Frequency" domain={[0, 12]} tick={false} width={1} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        {legend.map((name) => {
          const color = data.clusters.find((c) => c.name === name).color
          return (
            <Scatter key={name} name={name} data={data.clusters.filter((c) => c.name === name)} fill={color} />
          )
        })}
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default function AdminSegmentationPage() {
  const { show } = useToast()
  const [segmentation, setSegmentation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(() => localStorage.getItem('clustermind_admin_clustering_model') || 'kmeans')
  const [clusterCount, setClusterCount] = useState(5)

  useEffect(() => {
    localStorage.setItem('clustermind_admin_clustering_model', selectedAlgorithm)
    setLoading(true)
    getSegments({ algorithm: selectedAlgorithm, clusters: clusterCount })
      .then((res) => {
        if (res) setSegmentation(res)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedAlgorithm, clusterCount])

  const runSegmentation = async () => {
    await syncCustomerDataset()
    const trained = await trainModel(selectedAlgorithm, clusterCount)
    const live = await getSegments({ algorithm: selectedAlgorithm, clusters: clusterCount })
    if (live) setSegmentation(live)
    show(
      trained ? `${trained.name} segmentation completed for ${trained.rows} customers.` : 'Unable to run segmentation. Check customer data and backend auth.',
      trained ? 'success' : 'error',
    )
  }

  const columns = [
    { key: 'name', label: 'Segment' },
    { key: 'customers', label: 'Customers', render: (v) => v.toLocaleString() },
    { key: 'percentage', label: 'Share', render: (v) => `${v}%` },
    { key: 'avgSpending', label: 'Avg Spending' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'type', label: 'Type' },
  ]

  if (loading || !segmentation?.segments?.length) {
    return (
      <div className="dm-page">
        <div className="dm-hero">
          <div className="dm-hero-icon purple"><Layers size={24} /></div>
          <div>
            <h2 className="dm-hero-title">Customer Segmentation</h2>
            <p className="dm-hero-sub">AI-powered clustering analysis with configurable models</p>
          </div>
        </div>
        {loading ? (
          <LoadingState label="Running segmentation..." />
        ) : (
          <EmptyState title="No segmentation data" description="Run segmentation to generate customer clusters from live data." />
        )}
      </div>
    )
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon purple"><Layers size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Customer Segmentation</h2>
          <p className="dm-hero-sub">AI-powered clustering analysis with configurable models</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-end gap-3">
        <label className="min-w-56 text-xs font-bold uppercase text-slate-500">
          Model
          <select
            className="dm-select mt-1"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
          >
            {CLUSTERING_MODELS.map((model) => (
              <option key={model.key} value={model.key}>{model.name}</option>
            ))}
          </select>
        </label>
        <label className="w-36 text-xs font-bold uppercase text-slate-500">
          Clusters
          <input
            className="dm-input mt-1"
            type="number"
            min="2"
            max="12"
            value={clusterCount}
            disabled={selectedAlgorithm === 'dbscan'}
            onChange={(e) => setClusterCount(Number(e.target.value) || 2)}
          />
        </label>
        <Button icon={Play} onClick={runSegmentation}>
          Run Segmentation
        </Button>
      </div>

      <div className="dm-grid-4">
        {segmentation.segments.map((s) => {
          const accents = ['from-violet-600 to-purple-600', 'from-blue-600 to-cyan-500', 'from-cyan-500 to-teal-500', 'from-slate-400 to-slate-300', 'from-emerald-500 to-green-500']
          const accent = accents[segmentation.segments.indexOf(s) % accents.length]
          return (
            <KpiCard
              key={s.name}
              label={s.name}
              value={s.customers.toLocaleString()}
              icon={Layers}
              accent={accent}
              change={`${s.percentage}% of total`}
            />
          )
        })}
      </div>

      <div className="dm-grid-2">
        <ChartCard title="Segment Distribution" subtitle="Customer distribution across segments">
          <SegmentDonut data={segmentation} />
        </ChartCard>
        <ChartCard title="Cluster Visualization" subtitle={`${segmentation.model?.name || CLUSTERING_MODELS.find((m) => m.key === selectedAlgorithm)?.name} scatter plot`}>
          <ClusterScatter data={segmentation} />
        </ChartCard>
      </div>

      <ChartCard title="Segment Details" subtitle="Detailed breakdown of each segment">
        <DataTable columns={columns} rows={segmentation.segments} />
      </ChartCard>
    </div>
  )
}
