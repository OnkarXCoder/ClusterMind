import { useEffect, useState } from 'react'
import { Database, Cpu, Play, BarChart3, Eye, RefreshCw, Users } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminMlModels, getDataset, getModels, syncCustomerDataset, trainModel } from '../../api'

const fallbackDetails = {
  kmeans: {
    bestFor: 'Primary customer segmentation',
    output: 'Segment labels, cluster centers, customer scatter plot',
    features: ['Age', 'Spend', 'Rating', 'Previous purchases', 'Subscription', 'Discount usage', 'Frequency'],
  },
  dbscan: {
    bestFor: 'Outlier detection',
    output: 'Dense groups plus outlier users',
    features: ['Normalized customer behaviour', 'Neighbour distance', 'Minimum cluster size'],
  },
  hierarchical: {
    bestFor: 'Explainable segment hierarchy',
    output: 'Nested customer groups',
    features: ['Customer distance', 'Average linkage', 'Requested cluster count'],
  },
  pca: {
    bestFor: 'Visualizing customer clusters',
    output: '2D customer map and variance score',
    features: ['Principal components', 'Feature compression', 'Projected users'],
  },
}

const keyForModel = (model) => {
  const text = `${model.key || ''} ${model.name || ''}`.toLowerCase()
  if (text.includes('dbscan')) return 'dbscan'
  if (text.includes('hierarchical')) return 'hierarchical'
  if (text.includes('pca')) return 'pca'
  return 'kmeans'
}

const numericScore = (model) => {
  const value = model.accuracy ?? model.evaluation
  const numeric = Number(String(value ?? '').replace('%', ''))
  return Number.isFinite(numeric) ? numeric : 0
}

const formatScore = (model) => {
  const value = model.accuracy ?? model.evaluation
  if (value === undefined || value === null || value === '' || value === '-') return '-'
  return String(value).includes('%') ? String(value) : `${value}%`
}

export default function AdminModelManagementPage() {
  const { show } = useToast()
  const [activeTab, setActiveTab] = useState('models')
  const [models, setModels] = useState([])
  const [dataset, setDataset] = useState(null)
  const [predictionLogs, setPredictionLogs] = useState([])
  const [training, setTraining] = useState('')
  const [loading, setLoading] = useState(true)

  const loadModels = async () => {
    setLoading(true)
    const [liveModels, liveDataset, adminMl] = await Promise.all([
      getModels().catch(() => null),
      getDataset().catch(() => null),
      getAdminMlModels().catch(() => null),
    ])
    const modelsRes = Array.isArray(liveModels)
      ? liveModels
      : Array.isArray(adminMl?.models)
        ? adminMl.models
        : []
    setModels(modelsRes)
    setDataset(liveDataset || adminMl?.dataset || null)
    setPredictionLogs(adminMl?.predictionLogs || [])
    setLoading(false)
  }

  useEffect(() => {
    loadModels()
  }, [])

  const handleSyncCustomers = async () => {
    const synced = await syncCustomerDataset()
    if (!synced) {
      show('Could not sync MongoDB customers. Check backend data and login token.', 'error')
      return
    }
    setDataset(synced)
    await loadModels()
    show(`Synced ${synced.records} customers into the ML dataset.`, 'success')
  }

  const handleTrain = async (model = models[0]) => {
    if (!model) {
      show('No model is available to train. Sync customers or restore a dataset first.', 'error')
      return
    }
    const algorithm = keyForModel(model)
    setTraining(algorithm)
    try {
      const trained = await trainModel(algorithm, model.clusters || 5)
      await loadModels()
      show(
        trained ? `${trained.name} trained on ${trained.rows} customers.` : 'Training failed. Sync customers or restore a dataset first.',
        trained ? 'success' : 'error',
      )
    } finally {
      setTraining('')
    }
  }

  const tabs = [
    { key: 'models', label: 'Models', icon: Cpu },
    { key: 'dataset', label: 'Dataset', icon: Database },
    { key: 'predictions', label: 'Prediction Logs', icon: BarChart3 },
  ]
  const activeModels = models.filter((m) => m.status === 'Active').length
  const averageAccuracy = models
    .filter((m) => numericScore(m))
    .reduce((total, m, _, arr) => total + numericScore(m) / arr.length, 0)

  return (
    <div className="dm-page admin-model-page">
      <div className="dm-hero">
        <div className="dm-hero-icon purple"><Cpu size={24} /></div>
        <div>
          <h2 className="dm-hero-title">AI/ML Model Management</h2>
          <p className="dm-hero-sub">Train, evaluate, explain, and run clustering for all customers</p>
        </div>
      </div>

      <div className="model-toolbar">
        <Button variant="secondary" icon={Users} onClick={handleSyncCustomers}>Sync All Customers</Button>
        <Button icon={Play} onClick={() => models[0] && handleTrain(models[0])} disabled={Boolean(training)}>
          {training ? 'Training...' : 'Train Active Model'}
        </Button>
      </div>

      <div className="dm-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`dm-tab ${activeTab === t.key ? 'active' : ''}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'models' && (
        <>
          {loading && <LoadingState label="Loading models..." />}
          {!loading && models.length === 0 && (
            <EmptyState
              title="No models"
              description="ML models are not available yet."
            />
          )}
          {!loading && models.length > 0 && (
          <>
          <div className="model-health-strip">
            <div>
              <span>Active models</span>
              <strong>{activeModels}/{models.length}</strong>
            </div>
            <div>
              <span>Customers analyzed</span>
              <strong>{dataset?.records?.toLocaleString?.() || dataset?.records || '-'}</strong>
            </div>
            <div>
              <span>Avg score</span>
              <strong>{averageAccuracy ? `${averageAccuracy.toFixed(1)}%` : '-'}</strong>
            </div>
          </div>

          <div className="model-card-grid">
            {models.map((m, i) => {
              const key = keyForModel(m)
              const details = { ...fallbackDetails[key], ...m }
              return (
                <article key={m.key || m.name || i} className={`model-card ${m.status === 'Active' ? 'is-active' : ''}`}>
                  <div className="model-card-head">
                    <div>
                      <h3>{m.name}</h3>
                      <p>{m.type}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>

                  <p className="model-card-description">{m.description}</p>

                  <div className="model-info-panel">
                    <p><strong>Best for:</strong> {details.bestFor}</p>
                    <p><strong>Output:</strong> {details.output}</p>
                    <div>
                      <strong>Uses:</strong>
                      <div className="model-feature-list">
                        {(details.features || []).map((feature) => <span key={feature}>{feature}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="model-metric-grid">
                    <div>
                      <span>Last Trained</span>
                      <strong>{m.lastTrained || '-'}</strong>
                    </div>
                    <div>
                      <span>Score</span>
                      <strong>{formatScore(m)}</strong>
                    </div>
                    <div>
                      <span>Clusters</span>
                      <strong>{m.clusters || '-'}</strong>
                    </div>
                    <div>
                      <span>Algorithm</span>
                      <strong>{key.toUpperCase()}</strong>
                    </div>
                  </div>

                  <div className="model-card-actions">
                    <Button size="sm" icon={m.status === 'Active' ? RefreshCw : Play} onClick={() => handleTrain(m)} disabled={training === key}>
                      {training === key ? 'Training...' : m.status === 'Active' ? 'Retrain' : 'Train Now'}
                    </Button>
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => show(`${m.name} uses ${dataset?.records || 0} customer rows from ${dataset?.name || 'the active dataset'}.`, 'info')}>
                      Explain
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </>
          )}
        </>
      )}

      {activeTab === 'dataset' && (
        <ChartCard title="Dataset Management" subtitle="Current clustering dataset">
          {loading ? (
            <LoadingState label="Loading dataset..." />
          ) : !dataset ? (
            <EmptyState
              title="No dataset"
              description="No dataset is available yet. Try syncing customers or uploading a dataset."
            />
          ) : (
            <>
              <div className="dm-grid-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Dataset Name</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dataset.name}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Records</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{Number(dataset.records || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Columns</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dataset.columns}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Upload Date</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dataset.uploadDate}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Status</p>
                  <div className="mt-1"><StatusBadge status={dataset.status} /></div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-bold text-slate-900">Data Preview</h4>
                <div className="dm-table-wrap">
                  <table className="dm-table">
                    <thead>
                      <tr>
                        {dataset.preview?.length > 0 && Object.keys(dataset.preview[0]).map((k) => (
                          <th key={k}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(dataset.preview || []).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </ChartCard>
      )}

      {activeTab === 'predictions' && (
        <ChartCard title="Prediction Logs" subtitle="Recent model predictions">
          {loading ? (
            <LoadingState label="Loading prediction logs..." />
          ) : predictionLogs.length === 0 ? (
            <EmptyState
              title="No prediction logs"
              description="No prediction logs are available yet."
            />
          ) : (
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Input</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionLogs.map((p) => (
                    <tr key={p.id || p._id}>
                      <td style={{ fontWeight: 700 }}>{p.model}</td>
                      <td>{p.input}</td>
                      <td style={{ fontWeight: 700 }}>{p.prediction}</td>
                      <td>{p.confidence}</td>
                      <td>{p.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      )}
    </div>
  )
}
