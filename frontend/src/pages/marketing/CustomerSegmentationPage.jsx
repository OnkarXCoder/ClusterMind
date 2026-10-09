import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useCallback, useEffect, useState } from 'react'
import { Users, Layers, Cpu, Play } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getSegments, trainModel } from '../../api'

const CLUSTERING_MODELS = [
  { key: 'kmeans', name: 'K-Means Clustering' },
  { key: 'dbscan', name: 'DBSCAN' },
  { key: 'hierarchical', name: 'Hierarchical Clustering' },
  { key: 'pca', name: 'PCA-Based Clustering' },
]

const COLUMNS = [
  { key: 'name', label: 'Segment' },
  { key: 'customers', label: 'Customers', render: (v) => v.toLocaleString() },
  { key: 'percentage', label: 'Percentage', render: (v) => `${v}%` },
  { key: 'avgSpending', label: 'Average Spending' },
  { key: 'frequency', label: 'Purchase Frequency' },
  { key: 'type', label: 'Customer Type', render: (v) => <StatusBadge status={v} /> },
]

export default function CustomerSegmentationPage() {
  const { show } = useToast()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(() => localStorage.getItem('clustermind_marketing_clustering_model') || 'kmeans')
  const [clusterCount, setClusterCount] = useState(5)

  const loadSegments = useCallback(async () => {
    setLoading(true)
    try {
      const live = await getSegments({ algorithm: selectedAlgorithm, clusters: clusterCount })
      setAnalysis(live ?? null)
    } catch {
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [selectedAlgorithm, clusterCount])

  useEffect(() => {
    localStorage.setItem('clustermind_marketing_clustering_model', selectedAlgorithm)
    loadSegments()
  }, [selectedAlgorithm, clusterCount, loadSegments])

  const handleRun = async () => {
    const trained = await trainModel(selectedAlgorithm, clusterCount)
    await loadSegments()
    show(
      trained ? `${trained.name} segmentation completed from the active dataset.` : 'Unable to run segmentation. Restore or upload a dataset first.',
      trained ? 'success' : 'error',
    )
  }

  const segments = analysis?.segments ?? []
  const distribution = analysis?.distribution ?? []
  const clusters = analysis?.clusters ?? []
  const legend = [...new Set(clusters.map((c) => c.name))]
  const colors = distribution.map((s) => s.color)
  const hasData = Boolean(analysis) && segments.length > 0

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon purple">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Customer Segmentation</h2>
        <p className="dm-hero-sub">Clusters produced from behaviour analysis</p>
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
        <Button icon={Play} onClick={handleRun}>
          Run Segmentation
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading segmentation..." />
      ) : !hasData ? (
        <EmptyState
          title="No segmentation data"
          description="Run segmentation on an active dataset to view customer segments."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="Total Customers" value={(analysis.totalCustomers ?? 0).toLocaleString()} icon={Users} accent="from-violet-600 to-purple-600" />
            <KpiCard label="Number of Segments" value={segments.length} icon={Layers} accent="from-blue-600 to-cyan-500" />
            <KpiCard label="Model Evaluation" value={analysis.modelEvaluation != null ? `${analysis.modelEvaluation}%` : '—'} icon={Cpu} accent="from-emerald-500 to-teal-500" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard title="Segment Distribution" subtitle="Percentage of customers per segment">
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
                  <p className="text-2xl font-black text-slate-900">{(analysis.totalCustomers ?? 0).toLocaleString()}</p>
                  <p className="text-xs font-medium text-slate-400">Total</p>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Cluster Visualization" subtitle={`${analysis.model?.name || CLUSTERING_MODELS.find((m) => m.key === selectedAlgorithm)?.name} segment clusters`}>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="x" domain={[0, 13]} tick={false} />
                  <YAxis type="number" dataKey="y" domain={[0, 12]} tick={false} width={1} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  {legend.map((name) => {
                    const color = clusters.find((c) => c.name === name)?.color
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
            </ChartCard>
          </div>

          <ChartCard title="Segment Details" subtitle="Characteristics of each customer segment">
            <DataTable columns={COLUMNS} rows={segments} />
          </ChartCard>
        </>
      )}
    </div>
  )
}
