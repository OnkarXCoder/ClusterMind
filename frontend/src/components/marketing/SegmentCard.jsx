import { Users, Wallet, ShoppingBag, Repeat } from 'lucide-react'

export default function SegmentCard({ segment, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`dashboard-segment-card relative w-full rounded-2xl border-2 p-5 text-left transition ${
        selected
          ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10'
          : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-md'
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
      <h3 className="text-base font-bold text-slate-900">{segment.name}</h3>
      <div className="mt-4 space-y-2.5 text-sm">
        <p className="flex items-center gap-2 text-slate-600">
          <Users className="h-4 w-4 text-violet-500" />
          {segment.customers.toLocaleString()} customers
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <Wallet className="h-4 w-4 text-violet-500" />
          Average Spending: <span className="font-semibold text-slate-900">{segment.avgSpending}</span>
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <ShoppingBag className="h-4 w-4 text-violet-500" />
          Favourite Category: <span className="font-semibold text-slate-900">{segment.favouriteCategory}</span>
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <Repeat className="h-4 w-4 text-violet-500" />
          Purchase Frequency: <span className="font-semibold text-slate-900">{segment.frequency}</span>
        </p>
      </div>
    </button>
  )
}
