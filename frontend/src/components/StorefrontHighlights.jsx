import { BadgePercent, BrainCircuit, Truck, ShieldCheck } from 'lucide-react'

const highlights = [
  {
    icon: BrainCircuit,
    title: 'AI recommendations',
    text: 'Products ranked from shopping behaviour and segment insights.',
  },
  {
    icon: BadgePercent,
    title: 'Targeted offers',
    text: 'Discounts aligned with customer interests and categories.',
  },
  {
    icon: Truck,
    title: 'Fast delivery',
    text: 'Free delivery indicators shown before checkout.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted checkout',
    text: 'Clear cart totals and smooth order flow.',
  },
]

export default function StorefrontHighlights() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-sm shadow-slate-200/70 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-xl px-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
