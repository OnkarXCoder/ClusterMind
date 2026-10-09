import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, UploadCloud, FileSpreadsheet, Trash2, Eye, Upload } from 'lucide-react'
import Button from '../../components/marketing/Button'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import StatusBadge from '../../components/marketing/StatusBadge'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { deleteDataset, ensureDataset, getDataset, uploadDataset } from '../../api'

export default function DatasetManagementPage() {
  const { show } = useToast()
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDataset = useCallback(async () => {
    setLoading(true)
    const liveDataset = await getDataset()
    setDataset(liveDataset)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDataset()
  }, [loadDataset])

  const handleUpload = useCallback(async (file) => {
    if (!file) return
    setDragging(false)
    const uploaded = await uploadDataset(file)
    if (uploaded) {
      setDataset(uploaded)
      show(`Dataset "${uploaded.name}" uploaded.`, 'success')
    } else {
      show('Unable to upload dataset. Make sure the backend is running.', 'error')
    }
  }, [show])

  const handleDelete = async () => {
    const res = await deleteDataset()
    if (res) {
      setDataset(null)
      show('Dataset removed.', 'success')
    } else {
      show('Unable to remove dataset. Make sure the backend is running.', 'error')
    }
  }

  const handleRestore = async () => {
    const restored = await ensureDataset(true)
    if (restored) {
      setDataset(restored)
      show('Sample dataset restored.', 'success')
    } else {
      show('Unable to restore dataset.', 'error')
    }
  }

  const columns = (dataset?.columnNames || Object.keys(dataset?.preview?.[0] || {})).map((key) => ({
    key,
    label: key.replace(/_/g, ' '),
  }))

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Dataset Management</h2>
        <p className="dm-hero-sub">Upload and manage customer behaviour datasets</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          handleUpload(e.dataTransfer.files?.[0])
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
          dragging ? 'border-violet-500 bg-violet-50' : 'border-slate-300 bg-white'
        }`}
      >
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl transition ${
            dragging ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-600'
          }`}
        >
          <UploadCloud className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Drag & drop your dataset</h3>
        <p className="mt-1 text-sm text-slate-500">CSV files with customer behaviour columns and an optional segment column</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" icon={Upload} onClick={() => fileInputRef.current?.click()}>
            Upload CSV
          </Button>
          <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleRestore}>
            Restore Sample
          </Button>
        </div>
      </div>

      <ChartCard title="Datasets" subtitle="Uploaded customer behaviour datasets">
        <div className="space-y-3">
          {!loading && !dataset && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No dataset available. Upload a CSV or restore the sample dataset.
            </div>
          )}
          {dataset && (
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-violet-300 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">{dataset.name}</p>
                  <StatusBadge status={dataset.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {dataset.records.toLocaleString()} records - {dataset.columns} columns - Uploaded {dataset.uploadDate}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Button variant="secondary" size="sm" icon={Eye} onClick={() => setPreviewOpen(true)}>
                  View Dataset
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </ChartCard>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Dataset Preview"
        subtitle={dataset ? `${dataset.name} - first ${dataset.preview.length} rows of ${dataset.records.toLocaleString()} records` : 'No dataset loaded'}
        size="lg"
      >
        <DataTable columns={columns} rows={dataset?.preview || []} />
      </Modal>
    </div>
  )
}
