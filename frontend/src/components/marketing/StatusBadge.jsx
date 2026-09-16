const STYLES = {
  Active: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-sky-100 text-sky-700',
  Scheduled: 'bg-violet-100 text-violet-700',
  Draft: 'bg-slate-100 text-slate-600',
  Paused: 'bg-amber-100 text-amber-700',
  Expired: 'bg-red-100 text-red-600',
  Available: 'bg-slate-100 text-slate-600',
  'Ready for Analysis': 'bg-emerald-100 text-emerald-700',
  Processing: 'bg-amber-100 text-amber-700',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`status-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        STYLES[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
