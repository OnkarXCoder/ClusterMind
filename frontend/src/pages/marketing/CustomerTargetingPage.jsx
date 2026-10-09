import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, Megaphone } from 'lucide-react'
import SegmentCard from '../../components/marketing/SegmentCard'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getSegments } from '../../api'

const normalizeSegment = (s) => ({
  id: s.id || s._id,
  name: s.name || s.segmentName,
  customers: s.customers ?? s.size ?? 0,
  avgSpending: s.avgSpending || '—',
  favouriteCategory:
    s.dominantCategory && s.dominantCategory !== 'undefined' ? s.dominantCategory : '—',
  frequency: s.frequency || '—',
})

export default function CustomerTargetingPage() {
  const { show } = useToast()
  const [segments, setSegments] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getSegments({ clusters: 5 })
      .then((live) => {
        if (!active) return
        const mapped = (live?.segments ?? []).map(normalizeSegment)
        setSegments(mapped)
        setSelected(mapped[0] ?? null)
      })
      .catch(() => {
        if (!active) return
        setSegments([])
        setSelected(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const navigate = useNavigate()

  const handleSelect = () => {
    show(`Segment "${selected.name}" selected for targeting.`, 'success')
  }

  const handleCreate = () => {
    if (!selected) {
      show('Please select a segment first.', 'error')
      return
    }
    navigate('/marketing/campaigns', { state: { targetSegment: selected.name } })
  }

  if (loading) {
    return (
      <div className="dm-page">
        <LoadingState label="Loading segments..." />
      </div>
    )
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon red">
          <Crosshair className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Customer Targeting</h2>
        <p className="dm-hero-sub">Choose a customer segment to receive your next campaign</p>
      </div>

      {segments.length === 0 || !selected ? (
        <EmptyState
          title="No segments available"
          description="Run customer segmentation to generate targeting segments."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {segments.map((segment) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                selected={selected.id === segment.id}
                onSelect={() => setSelected(segment)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Selected Segment" subtitle={`${selected.name} ΓÇö ${selected.customers.toLocaleString()} customers`} className="xl:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-xs text-slate-500">Number of Customers</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{selected.customers.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs text-slate-500">Average Spending</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{selected.avgSpending}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs text-slate-500">Favourite Category</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{selected.favouriteCategory}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-slate-500">Purchase Frequency</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{selected.frequency}</p>
            </div>
          </div>
        </ChartCard>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Crosshair className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Ready to target?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Launch a campaign to the <span className="font-semibold text-slate-800">{selected.name}</span> segment and let the AI
              personalize the messaging.
            </p>
          </div>
          <div className="space-y-2.5">
            <Button className="w-full" icon={Crosshair} onClick={handleSelect}>
              Select Segment
            </Button>
            <Button className="w-full" variant="secondary" icon={Megaphone} onClick={handleCreate}>
              Create Campaign
            </Button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
