import { useEffect, useState } from 'react'
import { Cpu, RefreshCw, GitCompareArrows, Layers } from 'lucide-react'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import { useToast } from '../../components/marketing/Toast'
import { MODELS } from '../../data/marketingMockData'
import { getModels, trainModel } from '../../api'

export default function ModelPerformancePage() {
  const { show } = useToast()
  const [models, setModels] = useState(MODELS)

  const loadModels = async () => {
    const live = await getModels()
    if (live) setModels(live)
  }

  useEffect(() => {
    loadModels()
  }, [])

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
      trained ? `${name} trained from the active dataset.` : 'Unable to train model. Restore or upload a dataset first.',
      trained ? 'success' : 'error',
    )
  }

  const handleCompare = () => {
    show('Model comparison chart is coming soon.', 'info')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Model Performance</h2>
          <p className="text-sm text-slate-500">Machine learning models powering segmentation & recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={GitCompareArrows} onClick={handleCompare}>
            Compare Models
          </Button>
          <Button icon={RefreshCw} onClick={() => handleRetrain('Active model')}>
            Retrain Model
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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
                  <span className="text-slate-500">Last Training Date</span>
                  <span className="font-semibold text-slate-800">{model.lastTrained}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Evaluation Metric</span>
                  <span className="font-semibold text-slate-800">{model.evaluation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Number of Clusters</span>
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
    </div>
  )
}
