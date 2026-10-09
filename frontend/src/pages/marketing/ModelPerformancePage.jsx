import { useCallback, useEffect, useState } from 'react'
import { Cpu, RefreshCw, GitCompareArrows, Layers, Award } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import ChartCard from '../../components/marketing/ChartCard'
import { useToast } from '../../components/marketing/Toast'
import { getModels, trainModel } from '../../api'

const ALGORITHM_DETAILS = {
  kmeans: {
    strength: 'Spherical clustering, high scalability',
    idealUse: 'E-commerce customer RFM segmentation',
    metric: 'Silhouette Score & Inertia (WCSS)',
  },
  dbscan: {
    strength: 'Arbitrary cluster shapes & outlier noise detection',
    idealUse: 'Fraud patterns & shopping anomaly detection',
    metric: 'Density reachability & core distance',
  },
  hierarchical: {
    strength: 'Tree-based dendrogram hierarchy',
    idealUse: 'Multi-tier loyalty and VIP segment nesting',
    metric: 'Cophenetic correlation distance',
  },
  pca: {
    strength: 'Dimensionality reduction & variance preservation',
    idealUse: 'High-dimensional feature compression & 2D mapping',
    metric: 'Explained variance ratio',
  },
}

export default function ModelPerformancePage() {
  const { show } = useToast()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(true)

  const loadModels = useCallback(async () => {
    const live = await getModels()
    setModels(Array.isArray(live) ? live : [])
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    loadModels().finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [loadModels])

  const handleRetrain = async (name) => {
    const key = name.toLowerCase().includes('dbscan')
      ? 'dbscan'
      : name.toLowerCase().includes('hierarchical')
        ? 'hierarchical'
        : name.toLowerCase().includes('pca')
          ? 'pca'
          : 'kmeans'
    const trained = await trainModel(key)
    await loadModels()
    show(
      trained ? `${name} retrained successfully from current dataset.` : 'Unable to train model. Restore or upload a dataset first.',
      trained ? 'success' : 'error',
    )
  }

  const handleCompare = () => {
    setShowComparison((prev) => !prev)
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue">
          <Cpu className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Model Performance</h2>
        <p className="dm-hero-sub">Machine learning models powering segmentation & recommendations</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="secondary" icon={GitCompareArrows} onClick={handleCompare}>
          Compare Models
        </Button>
        <Button icon={RefreshCw} onClick={() => handleRetrain('Active model')}>
          Retrain Model
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading models..." />
      ) : models.length === 0 ? (
        <EmptyState
          title="No models available"
          description="No ML models are available from the service."
        />
      ) : (
        <>
          {showComparison && (
            <div className="mb-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ChartCard
                  title="Algorithm Benchmark Comparison"
                  subtitle="Comparative accuracy & evaluation score (%) across clustering methods"
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={models.map((m) => ({
                        name: m.name.split(' ')[0],
                        score: Number(String(m.evaluation ?? m.accuracy ?? 0).replace('%', '')) || 0,
                        status: m.status,
                      }))}
                      margin={{ top: 20, right: 10, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        formatter={(v) => [`${v}%`, 'Model Evaluation']}
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#6366f1">
                        <LabelList dataKey="score" position="top" formatter={(v) => `${v}%`} className="fill-slate-700" fontSize={11} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Thesis Algorithm Matrix</h3>
                      <p className="text-xs text-slate-500">Evaluated on e-commerce customer behavior dataset</p>
                    </div>
                  </div>

                  <div className="mt-4 divide-y divide-slate-100">
                    {models.map((m) => {
                      const key = m.name.toLowerCase().includes('dbscan')
                        ? 'dbscan'
                        : m.name.toLowerCase().includes('hierarchical')
                        ? 'hierarchical'
                        : m.name.toLowerCase().includes('pca')
                        ? 'pca'
                        : 'kmeans'
                      const details = ALGORITHM_DETAILS[key] || ALGORITHM_DETAILS.kmeans
                      return (
                        <div key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm">{m.name}</span>
                            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                              {m.evaluation}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">Ideal Use:</span> {details.idealUse}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            {models.map((model) => {
              const isActive = model.status === 'Active'
              return (
                <div
                  key={model.name}
                  className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                    isActive ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isActive ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Cpu className="h-6 w-6" />
                    </div>
                    <StatusBadge status={model.status} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">{model.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{model.description}</p>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Last Trained</span>
                      <span className="font-semibold text-slate-800">{model.lastTrained}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Evaluation</span>
                      <span className="font-semibold text-slate-800">{model.evaluation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Clusters</span>
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        {model.clusters}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="mt-5 w-full"
                    variant={isActive ? 'primary' : 'secondary'}
                    icon={RefreshCw}
                    onClick={() => handleRetrain(model.name)}
                  >
                    Retrain {model.name.split(' ')[0]}
                  </Button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
