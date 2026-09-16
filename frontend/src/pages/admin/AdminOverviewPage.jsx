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
import { getAdminOverview, getAdminOrders } from '../../api'
import {
  ADMIN_KPI as MOCK_ADMIN_KPI,
  SEGMENTATION as MOCK_SEGMENTATION,
  RECENT_ACTIVITIES as MOCK_RECENT_ACTIVITIES,
  BUSINESS_SUMMARY as MOCK_BUSINESS_SUMMARY,
  ORDERS as MOCK_ORDERS,
} from '../../data/adminMockData'

function SegmentDonut({ data, totalCustomers }) {
  const segmentColors = data.segments.map((s) => s.color)
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.segments}
            dataKey="percentage"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.segments.map((s, i) => (
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
        <p className="text-2xl font-black text-slate-900">{totalCustomers.toLocaleString()}</p>
        <p className="text-xs font-medium text-slate-400">Customers</p>
      </div>
    </div>
  )
}

function RevenueBar() {
  const data = [
    { name: 'Electronics', value: 18900 },
    { name: 'Fashion', value: 6780 },
    { name: 'Home', value: 4560 },
    { name: 'Beauty', value: 2340 },
    { name: 'Grocery', value: 1987 },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(v) => [`₹${v.toLocaleString()}K`, 'Revenue']}
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6366f1">
          <LabelList dataKey="value" position="top" formatter={(v) => `₹${v.toLocaleString()}K`} className="fill-slate-700" fontSize={11} fontWeight={700} />
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
  const [liveOrders, setLiveOrders] = useState(null)

  useEffect(() => {
    getAdminOverview().then((res) => res && setOverview(res))
    getAdminOrders().then((res) => res && setLiveOrders(res))
  }, [])

  const kpi = overview?.kpi ?? MOCK_ADMIN_KPI
  const businessSummary = overview?.businessSummary ?? MOCK_BUSINESS_SUMMARY
  const recentActivities = overview?.recentActivities ?? MOCK_RECENT_ACTIVITIES
  const segmentation = overview?.segmentation ?? MOCK_SEGMENTATION
  const orders = (liveOrders ?? MOCK_ORDERS).map((o) => ({ ...o, id: o.orderId ?? o.id }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Customers" value={kpi.totalCustomers.toLocaleString()} icon={Users} accent="from-red-500 to-orange-500" change="+4.2% vs last month" />
        <KpiCard label="Total Products" value={kpi.totalProducts.toLocaleString()} icon={Package} accent="from-blue-500 to-cyan-500" change="+128 new products" />
        <KpiCard label="Total Orders" value={kpi.totalOrders.toLocaleString()} icon={ShoppingCart} accent="from-emerald-500 to-teal-500" change="+6.4% this month" />
        <KpiCard label="Total Revenue" value="₹3.46Cr" icon={Banknote} accent="from-violet-500 to-purple-500" change="+12.4% growth" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Customer Segments" value={kpi.customerSegments} icon={Layers} accent="from-pink-500 to-rose-500" />
        <KpiCard label="Active Campaigns" value={kpi.activeCampaigns} icon={Megaphone} accent="from-amber-500 to-orange-500" />
        <KpiCard label="Recommendation Accuracy" value={`${kpi.recommendationAccuracy}%`} icon={Sparkles} accent="from-indigo-500 to-blue-500" />
        <KpiCard label="Conversion Rate" value={businessSummary.conversionRate} icon={TrendingUp} accent="from-teal-500 to-green-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Customer Segments" subtitle="Distribution across segments">
          <SegmentDonut data={segmentation} totalCustomers={kpi.totalCustomers} />
        </ChartCard>

        <ChartCard title="Revenue by Category" subtitle="Category-wise revenue (₹K)" className="xl:col-span-2">
          <RevenueBar />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Recent Activities" subtitle="Latest system events" className="xl:col-span-2">
          <div className="space-y-3">
            {recentActivities.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || Clock
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{a.action}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>

        <ChartCard title="Business Summary" subtitle="Key metrics overview">
          <div className="space-y-4">
            {Object.entries(businessSummary).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Recent Orders" subtitle="Latest 5 orders">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Order ID</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Customer</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Total</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Status</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{o.id}</td>
                  <td className="px-5 py-4 text-slate-600">{o.customer}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">₹{o.total.toLocaleString()}</td>
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-4 text-slate-500">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
