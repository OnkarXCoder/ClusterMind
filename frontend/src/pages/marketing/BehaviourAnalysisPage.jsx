import {
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts'
import { useEffect, useState } from 'react'
import { ShoppingCart, Wallet, Repeat, Package, Heart, ShoppingBag, Search } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { getBehaviour } from '../../api'

const CATEGORY_COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']

const ICONS = [
  { Icon: ShoppingCart, accent: 'from-violet-600 to-purple-600' },
  { Icon: Wallet, accent: 'from-blue-600 to-cyan-500' },
  { Icon: Repeat, accent: 'from-emerald-500 to-teal-500' },
  { Icon: Package, accent: 'from-pink-500 to-rose-500' },
  { Icon: Heart, accent: 'from-amber-500 to-orange-500' },
  { Icon: ShoppingBag, accent: 'from-indigo-500 to-blue-500' },
  { Icon: Search, accent: 'from-slate-600 to-slate-800' },
]

const NO_DATA_TITLE = 'No data available'
const NO_DATA_DESCRIPTION = 'No data available from the ML service.'

export default function BehaviourAnalysisPage() {
  const [behaviour, setBehaviour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getBehaviour()
      .then((live) => {
        if (!active) return
        const cats = (live?.categoryDistribution || live?.favouriteCategories || []).filter(
          (c) => c.name && c.name !== 'undefined',
        )
        setBehaviour({
          stats: live?.stats?.length
            ? live.stats.map((s) => ({ ...s, change: s.change || '' }))
            : [],
          favouriteCategories: cats,
          purchaseFrequency: live?.purchaseFrequency || cats,
          spendingDistribution: live?.spendingDistribution || live?.ageDistribution || [],
          paymentDistribution: live?.paymentDistribution || [],
          topLocations: live?.topLocations || [],
        })
      })
      .catch(() => {
        if (active) setBehaviour({ stats: [], favouriteCategories: [] })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="dm-page">
        <LoadingState label="Loading behaviour analysis..." />
      </div>
    )
  }

  const stats = behaviour?.stats ?? []
  const favouriteCategories = behaviour?.favouriteCategories ?? []
  const purchaseFrequency = behaviour?.purchaseFrequency ?? []
  const spendingDistribution = behaviour?.spendingDistribution ?? []
  const paymentDistribution = behaviour?.paymentDistribution ?? []

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Behaviour Analysis</h2>
        <p className="dm-hero-sub">Customer purchase patterns and spending distribution</p>
      </div>

      {stats.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => {
            const icon = ICONS[i % ICONS.length]
            return (
              <KpiCard
                key={s.label}
                label={s.label}
                value={s.value}
                change={s.change}
                icon={icon.Icon}
                accent={icon.accent}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState title={NO_DATA_TITLE} description={NO_DATA_DESCRIPTION} />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Purchase Frequency" subtitle="Order distribution across customer categories">
          {purchaseFrequency.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={purchaseFrequency} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Customer Share']}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#7c3aed">
                  <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} className="fill-slate-700" fontSize={11} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={NO_DATA_TITLE} description={NO_DATA_DESCRIPTION} />
          )}
        </ChartCard>

        <ChartCard title="Spending Demographics" subtitle="Customer share across age & spend bands">
          {spendingDistribution.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={spendingDistribution} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Share']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fill="url(#spendAreaGrad)">
                  <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} className="fill-slate-700" fontSize={11} fontWeight={700} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={NO_DATA_TITLE} description={NO_DATA_DESCRIPTION} />
          )}
        </ChartCard>

        <ChartCard title="Favourite Categories" subtitle="Most purchased product categories">
          {favouriteCategories.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={favouriteCategories}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {favouriteCategories.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [`${v}%`, name]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={NO_DATA_TITLE} description={NO_DATA_DESCRIPTION} />
          )}
        </ChartCard>

        <ChartCard title="Payment Methods" subtitle="Preferred customer transaction channels">
          {paymentDistribution.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentDistribution} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Adoption']}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#10b981">
                  <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} className="fill-slate-700" fontSize={11} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={NO_DATA_TITLE} description={NO_DATA_DESCRIPTION} />
          )}
        </ChartCard>
      </div>
    </div>
  )
}
