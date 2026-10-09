import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { useEffect, useState } from 'react'
import { ShoppingCart, Wallet, Repeat, Search, Heart, TrendingUp } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { getAdminBehaviour } from '../../api'

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6']

function SpendingChart({ data }) {
  const spending = data.spendingDistribution ?? []
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={spending} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Customers']}
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {spending.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function CategoryPie({ data }) {
  const categories = data.favouriteCategories ?? []
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={categories}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          strokeWidth={0}
        >
          {categories.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, name) => [`${v}%`, name]}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ActivityTimeline({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data.customerActivity ?? []} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cartsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Area type="monotone" dataKey="views" stroke="#ef4444" fill="url(#viewsGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="carts" stroke="#f97316" fill="url(#cartsGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="purchases" stroke="#10b981" fill="url(#purchasesGrad)" strokeWidth={2} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function AdminBehaviourAnalysisPage() {
  const [behaviour, setBehaviour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAdminBehaviour()
      .then((res) => { if (active && res) setBehaviour(res) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <LoadingState label="Loading behaviour analytics..." />

  if (!behaviour) {
    return (
      <EmptyState
        title="No behaviour data"
        description="Customer behaviour analytics are not available yet."
      />
    )
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon purple"><TrendingUp size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Customer Behaviour Analysis</h2>
          <p className="dm-hero-sub">Deep insights into customer purchasing and browsing patterns</p>
        </div>
      </div>

      <div className="dm-grid-4">
        {(behaviour.stats ?? []).slice(0, 4).map((s, i) => {
          const icons = [ShoppingCart, Wallet, Repeat, TrendingUp]
          const accents = ['from-red-500 to-orange-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-violet-500 to-purple-500']
          return <KpiCard key={i} label={s.label} value={s.value} icon={icons[i]} accent={accents[i]} change={s.change} />
        })}
      </div>

      <div className="dm-grid-3">
        {(behaviour.stats ?? []).slice(4).map((s, i) => {
          const icons = [Heart, ShoppingCart, Search]
          const accents = ['from-pink-500 to-rose-500', 'from-amber-500 to-orange-500', 'from-indigo-500 to-blue-500']
          return <KpiCard key={i} label={s.label} value={s.value} icon={icons[i]} accent={accents[i]} change={s.change} />
        })}
      </div>

      <div className="dm-grid-2">
        <ChartCard title="Spending Distribution" subtitle="Customer spending ranges">
          <SpendingChart data={behaviour} />
        </ChartCard>
        <ChartCard title="Favourite Categories" subtitle="Top product categories">
          <CategoryPie data={behaviour} />
        </ChartCard>
      </div>

      <ChartCard title="Customer Activity Timeline" subtitle="Views, cart additions, and purchases over time">
        <ActivityTimeline data={behaviour} />
      </ChartCard>

      <ChartCard title="Purchase Frequency" subtitle="Orders per customer distribution">
        <div className="grid grid-cols-5 gap-3">
          {(behaviour.purchaseFrequency ?? []).map((b, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ background: COLORS[i % COLORS.length] }}>
                <span className="text-lg font-bold">{b.value}%</span>
              </div>
              <p className="text-xs font-semibold text-slate-700">{b.name} orders</p>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Key Insights" subtitle="AI-generated customer behaviour insights">
        <div className="space-y-3">
          {(behaviour.insights ?? []).map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                {i + 1}
              </span>
              <p className="text-sm text-slate-700">{insight}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
