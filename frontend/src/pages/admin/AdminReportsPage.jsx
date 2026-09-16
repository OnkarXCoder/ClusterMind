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
import { useToast } from '../../components/marketing/Toast'
import { getAdminReports } from '../../api'
import { ADMIN_REPORTS as MOCK_ADMIN_REPORTS } from '../../data/adminMockData'

export default function AdminReportsPage() {
  const { show } = useToast()
  const [data, setData] = useState(MOCK_ADMIN_REPORTS)

  useEffect(() => {
    getAdminReports().then((res) => {
      if (res) setData({ ...res, revenueReport: res.revenueHistory ?? res.revenueReport ?? MOCK_ADMIN_REPORTS.revenueReport })
    })
  }, [])

  const sales = data.salesReport ?? MOCK_ADMIN_REPORTS.salesReport

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Comprehensive business intelligence reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={FileText} onClick={() => show('PDF export coming soon', 'info')}>Export PDF</Button>
          <Button variant="secondary" icon={Download} onClick={() => show('Excel export coming soon', 'info')}>Export Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Sales" value={`₹${(sales.totalSales / 10000000).toFixed(2)}Cr`} icon={BarChart3} accent="from-red-500 to-orange-500" change={`+${sales.monthlyGrowth}% growth`} />
        <KpiCard label="Orders" value={sales.totalOrders.toLocaleString()} icon={FileText} accent="from-blue-500 to-cyan-500" change="+6.4% this month" />
        <KpiCard label="Avg Order Value" value={`₹${sales.averageOrderValue.toLocaleString()}`} icon={BarChart3} accent="from-emerald-500 to-teal-500" change="+5.0%" />
        <KpiCard label="Campaign ROI" value="287%" icon={BarChart3} accent="from-violet-500 to-purple-500" change="Overall return" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue (₹)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueReport}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip
                formatter={(v) => [`₹${(v / 100000).toFixed(1)}L`, 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Growth" subtitle="Monthly customer count">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [v.toLocaleString(), 'Customers']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Campaign Performance" subtitle="Revenue and conversion by campaign">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.campaignPerformance} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : `${v}%`, name === 'revenue' ? 'Revenue' : 'Conversion']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="revenue" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Bar dataKey="conversion" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Customer Report" subtitle="Customer metrics">
          <div className="space-y-3">
            {Object.entries(data.customerReport).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Product Report" subtitle="Product metrics">
          <div className="space-y-3">
            {Object.entries(data.productReport).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Behaviour Report" subtitle="User activity metrics">
          <div className="space-y-3">
            {Object.entries(data.behaviourReport).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Marketing Report" subtitle="Campaign metrics">
          <div className="space-y-3">
            {Object.entries(data.marketingReport).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-slate-900">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recommendation Report" subtitle="AI recommendation metrics">
          <div className="space-y-3">
            {Object.entries(data.recommendationReport).map(([key, val]) => (
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
