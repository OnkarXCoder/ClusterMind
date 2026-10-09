import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { useEffect, useState } from 'react'
import { Download, BarChart3, FileText } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getAdminReports } from '../../api'

export default function AdminReportsPage() {
  const { show } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAdminReports()
      .then((res) => {
        if (active && res) {
          setData({
            ...res,
            revenueReport: res.revenueHistory ?? res.revenueReport,
          })
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <LoadingState label="Loading reports..." />

  if (!data) {
    return (
      <EmptyState
        title="No reports"
        description="Reports and analytics are not available yet."
      />
    )
  }

  const sales = data.salesReport ?? {}
  const revenueData = data.revenueReport ?? data.revenueHistory ?? []

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue"><BarChart3 size={24} /></div>
        <div>
          <h2 className="dm-hero-title">Reports & Analytics</h2>
          <p className="dm-hero-sub">Comprehensive business intelligence reports</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="secondary" icon={FileText} onClick={() => show('PDF export coming soon', 'info')}>Export PDF</Button>
        <Button variant="secondary" icon={Download} onClick={() => show('Excel export coming soon', 'info')}>Export Excel</Button>
      </div>

      <div className="dm-grid-4">
        <KpiCard label="Total Sales" value={`₹${(Number(sales.totalSales) / 10000000).toFixed(2)}Cr`} icon={BarChart3} accent="from-red-500 to-orange-500" change={`${sales.monthlyGrowth ? '+' + sales.monthlyGrowth + '% growth' : ''}`} />
        <KpiCard label="Orders" value={Number(sales.totalOrders || 0).toLocaleString()} icon={FileText} accent="from-blue-500 to-cyan-500"  />
        <KpiCard label="Avg Order Value" value={`₹${Number(sales.averageOrderValue || 0).toLocaleString()}`} icon={BarChart3} accent="from-emerald-500 to-teal-500"  />
        <KpiCard label="Campaign ROI" value="287%" icon={BarChart3} accent="from-violet-500 to-purple-500" change="Overall return" />
      </div>

      <div className="dm-grid-2">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue (₹)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(Number(v) / 100000).toFixed(0)}L`} />
              <Tooltip
                formatter={(v) => [`₹${(Number(v) / 100000).toFixed(1)}L`, 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Growth" subtitle="Monthly customer count">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.customerGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [Number(v).toLocaleString(), 'Customers']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Campaign Performance" subtitle="Revenue and conversion by campaign">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.campaignPerformance ?? []} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(v, name) => [name === 'revenue' ? `₹${Number(v).toLocaleString()}` : `${v}%`, name === 'revenue' ? 'Revenue' : 'Conversion']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="revenue" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Bar dataKey="conversion" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="dm-grid-2">
        <ChartCard title="Customer Report" subtitle="Customer metrics">
          <div className="space-y-3">
            {Object.entries(data.customerReport ?? {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Product Report" subtitle="Product metrics">
          <div className="space-y-3">
            {Object.entries(data.productReport ?? {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="dm-grid-3">
        <ChartCard title="Behaviour Report" subtitle="User activity metrics">
          <div className="space-y-3">
            {Object.entries(data.behaviourReport ?? {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Marketing Report" subtitle="Campaign metrics">
          <div className="space-y-3">
            {Object.entries(data.marketingReport ?? {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recommendation Report" subtitle="AI recommendation metrics">
          <div className="space-y-3">
            {Object.entries(data.recommendationReport ?? {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
