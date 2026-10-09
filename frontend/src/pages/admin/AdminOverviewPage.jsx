import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts'
import {
  Users,
  Package,
  ShoppingCart,
  Banknote,
  Layers,
  Megaphone,
  Sparkles,
  TrendingUp,
  Clock,
  RotateCcw,
} from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import StatusBadge from '../../components/marketing/StatusBadge'
import EmptyState from '../../components/marketing/EmptyState'
import { getAdminOverview, getAdminOrders } from '../../api'

function SegmentDonut({ data, totalCustomers }) {
  const segments = data?.segments || []
  const segmentColors = segments.map((s) => s.color)
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="percentage"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {segments.map((s, i) => (
              <Cell key={s.name} fill={segmentColors[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${v}%`, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-black text-slate-900">{Number(totalCustomers || 0).toLocaleString()}</p>
        <p className="text-xs font-medium text-slate-400">Customers</p>
      </div>
    </div>
  )
}

function RevenueBar({ data = [] }) {
  if (!data.length) {
    return <EmptyState title="No revenue data" description="Category revenue will appear once orders are recorded." />
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6366f1">
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v) => `₹${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v}`}
            className="fill-slate-700"
            fontSize={11}
            fontWeight={700}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const ACTIVITY_ICONS = {
  order: ShoppingCart,
  review: Sparkles,
  product: Package,
  campaign: Megaphone,
  refund: RotateCcw,
  customer: Users,
  model: TrendingUp,
  loyalty: Banknote,
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null)
  const [liveOrders, setLiveOrders] = useState([])

  useEffect(() => {
    getAdminOverview().then((res) => res && setOverview(res))
    getAdminOrders().then((res) => res && setLiveOrders(res))
  }, [])

  const kpi = overview?.kpi ?? {
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    customerSegments: 0,
    activeCampaigns: 0,
    recommendationAccuracy: 0,
  }
  const businessSummary = overview?.businessSummary ?? {}
  const recentActivities = overview?.recentActivities ?? []
  const segmentation = overview?.segmentation ?? { segments: [], clusters: [] }
  const orders = liveOrders.map((o) => ({ ...o, id: o.orderId ?? o.id }))

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon red"><Users size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Admin Overview</h2>
          <p className="dm-hero-sub">Real-time platform metrics and analytics</p>
        </div>
      </div>

      <div className="dm-stat-grid">
        <KpiCard label="Total Customers" value={kpi.totalCustomers.toLocaleString()} icon={Users} accent="from-red-500 to-orange-500" />
        <KpiCard label="Total Products" value={kpi.totalProducts.toLocaleString()} icon={Package} accent="from-blue-500 to-cyan-500" />
        <KpiCard label="Total Orders" value={kpi.totalOrders.toLocaleString()} icon={ShoppingCart} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Total Revenue" value={`₹${Number(kpi.totalRevenue || 0).toLocaleString()}`} icon={Banknote} accent="from-violet-500 to-purple-500" />
      </div>

      <div className="dm-stat-grid">
        <KpiCard label="Customer Segments" value={kpi.customerSegments} icon={Layers} accent="from-pink-500 to-rose-500" />
        <KpiCard label="Active Campaigns" value={kpi.activeCampaigns} icon={Megaphone} accent="from-amber-500 to-orange-500" />
        <KpiCard label="Recommendation Accuracy" value={`${kpi.recommendationAccuracy}%`} icon={Sparkles} accent="from-indigo-500 to-blue-500" />
        <KpiCard label="Conversion Rate" value={businessSummary.conversionRate} icon={TrendingUp} accent="from-teal-500 to-green-500" />
      </div>

      <div className="dm-grid-3">
        <ChartCard title="Customer Segments" subtitle="Distribution across segments">
          <SegmentDonut data={segmentation} totalCustomers={kpi.totalCustomers} />
        </ChartCard>

        <ChartCard title="Revenue by Category" subtitle="Category-wise revenue distribution" style={{ gridColumn: 'span 2' }}>
          <RevenueBar data={overview?.revenueByCategory} />
        </ChartCard>
      </div>

      <div className="dm-grid-3">
        <ChartCard title="Recent Activities" subtitle="Latest system events" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentActivities.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || Clock
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 11, transition: 'background 0.15s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#64748B' }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>{a.action}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94A3B8' }}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>

        <ChartCard title="Business Summary" subtitle="Key metrics overview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(businessSummary).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 11, background: '#F8FAFC' }}>
                <span style={{ fontSize: 13, color: '#64748B', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{val}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Recent Orders" subtitle="Latest 5 orders">
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: '#2563EB' }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{ fontWeight: 700 }}>₹{o.total.toLocaleString()}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
