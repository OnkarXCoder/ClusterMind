import { useEffect, useState } from 'react'
import { Database, Cpu, Play, BarChart3, Eye, RefreshCw } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import { useToast } from '../../components/marketing/Toast'
import { getAdminMlModels } from '../../api'
import { MODELS as MOCK_ML_MODELS, DATASET } from '../../data/marketingMockData'
import { PREDICTION_LOGS as MOCK_PREDICTION_LOGS } from '../../data/adminMockData'

export default function AdminModelManagementPage() {
  const { show } = useToast()
  const [activeTab, setActiveTab] = useState('models')
  const [models, setModels] = useState(MOCK_ML_MODELS)
  const [predictionLogs, setPredictionLogs] = useState(MOCK_PREDICTION_LOGS)

  useEffect(() => {
    getAdminMlModels().then((res) => {
      if (res) {
        setModels(res.models)
        if (res.predictionLogs) setPredictionLogs(res.predictionLogs)
      }
    })
  }, [])

  const tabs = [
    { key: 'models', label: 'Models', icon: Cpu },
    { key: 'dataset', label: 'Dataset', icon: Database },
    { key: 'predictions', label: 'Prediction Logs', icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI/ML Model Management</h2>
          <p className="text-sm text-slate-500">Train, evaluate, and manage machine learning models</p>
        </div>
        <Button icon={Play} onClick={() => show('Model training queued (demo)', 'success')}>Train Model</Button>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === t.key
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'models' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {models.map((m, i) => (
            <ChartCard key={i} title={m.name} subtitle={m.type} action={<StatusBadge status={m.status} />}>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{m.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Last Trained</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{m.lastTrained}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Accuracy</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{m.accuracy ? `${m.accuracy}%` : '—'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Clusters</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{m.clusters || '—'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{m.type}</p>
                  </div>
                </div>
                {m.status === 'Active' && (
                  <div className="flex gap-2">
                    <Button size="sm" icon={RefreshCw} onClick={() => show(`${m.name} retraining (demo)`, 'success')}>Retrain</Button>
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => show('Compare view (demo)', 'info')}>Compare</Button>
                  </div>
                )}
                {m.status === 'Available' && (
                  <Button size="sm" icon={Play} onClick={() => show(`${m.name} training started (demo)`, 'success')}>Train Now</Button>
                )}
              </div>
            </ChartCard>
          ))}
        </div>
      )}

      {activeTab === 'dataset' && (
        <ChartCard title="Dataset Management" subtitle="Current training dataset">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Dataset Name</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{DATASET.name}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Records</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{DATASET.records.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Columns</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{DATASET.columns}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Upload Date</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{DATASET.uploadDate}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Status</p>
              <div className="mt-1"><StatusBadge status={DATASET.status} /></div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-bold text-slate-900">Data Preview</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500">
                    {DATASET.preview.length > 0 && Object.keys(DATASET.preview[0]).map((k) => (
                      <th key={k} className="px-3 py-2.5 font-semibold">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DATASET.preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-3 py-2 text-slate-600">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ChartCard>
      )}

      {activeTab === 'predictions' && (
        <ChartCard title="Prediction Logs" subtitle="Recent model predictions">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Model</th>
                  <th className="px-5 py-3.5 font-semibold">Input</th>
                  <th className="px-5 py-3.5 font-semibold">Prediction</th>
                  <th className="px-5 py-3.5 font-semibold">Confidence</th>
                  <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictionLogs.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{p.model}</td>
                    <td className="px-5 py-4 text-slate-600">{p.input}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{p.prediction}</td>
                    <td className="px-5 py-4 text-slate-700">{p.confidence}</td>
                    <td className="px-5 py-4 text-slate-500">{p.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  )
}
