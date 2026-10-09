import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { currentMonthRange } from '../../utils/dateRange'

export default function DateRangePicker({ value, onChange }) {
  const initial = currentMonthRange()
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)
  const ref = useRef(null)

  const label =
    value?.label ||
    `${new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(
      end,
    ).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const apply = () => {
    onChange({
      start,
      end,
      label: `${new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(
        end,
      ).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    })
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300"
      >
        <CalendarDays className="h-4 w-4 text-slate-400" />
        <span className="hidden xl:inline">{label}</span>
        <span className="xl:hidden">Range</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-3 text-sm font-bold text-slate-900">Select Date Range</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Start Date</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">End Date</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
            </div>
            <button
              onClick={apply}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
