import { CalendarDays, TrendingUp, Eye, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import Button from './Button'

const COLUMNS = [
  { key: 'name', label: 'Campaign Name' },
  { key: 'segment', label: 'Target Segment' },
  { key: 'channel', label: 'Channel' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'performance', label: 'Performance' },
]

export default function CampaignTable({ campaigns, onView, onDelete }) {
  return (
    <div className="dashboard-table-wrap overflow-x-auto">
      <table className="dashboard-table w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {COLUMNS.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-5 py-3.5 font-semibold">
                {col.label}
              </th>
            ))}
            <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-5 py-10 text-center text-sm text-slate-400">
                No campaigns found
              </td>
            </tr>
          )}
          {campaigns.map((c) => (
            <tr key={c.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-900">{c.name}</td>
              <td className="px-5 py-4 text-slate-600">{c.segment}</td>
              <td className="px-5 py-4 text-slate-600">{c.channel}</td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  {c.startDate}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  {c.endDate}
                </span>
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-5 py-4">
                {c.performance ? (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    {c.performance}%
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" icon={Eye} onClick={() => onView?.(c)}>
                    View
                  </Button>
                  <button
                    onClick={() => onDelete?.(c)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
