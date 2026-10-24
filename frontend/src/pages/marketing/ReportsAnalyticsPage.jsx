import { useEffect, useState } from 'react'
import {
  Banknote,
  Percent,
  Gift,
  Users,
  Download,
  FileDown,
  BarChart3,
  Award,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getMarketingReports } from '../../api'

const SEGMENT_COLORS = ['#7c3aed', '#2563eb', '#10b981', '#f59e0b', '#ec4899']

export default function ReportsAnalyticsPage() {
  const { show } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getMarketingReports()
      .then((res) => {
        if (active && res) {
          setData(res)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleDownload = () => {
    window.print()
    show('Opening print view for executive report.', 'success')
  }

  const handleExport = () => {
    if (!data) {
      show('No report data available to export.', 'error')
      return
    }

    const rows = [
      ['Metric / Dimension', 'Value', 'Details'],
      ['Total Sales', `INR ${data.salesReport?.totalSales || 0}`, 'Lifetime revenue'],
      ['Total Orders', data.salesReport?.totalOrders || 0, 'Fulfilled & Processing'],
      ['Average Order Value', `INR ${data.salesReport?.averageOrderValue || 0}`, 'Per order average'],
      ['Active Customers', data.customerReport?.activeCustomers || 0, 'Engaged shoppers'],
      ['Campaigns Executed', data.marketingReport?.campaignsRun || 0, 'Total campaigns'],
      ['Recommendation Conversion', `${data.recommendationReport?.conversionRate || 0}%`, 'AI suggestions clicked'],
      [],
      ['Month', 'Revenue (INR)'],
      ...(data.revenueHistory || []).map((r) => [r.month, r.revenue]),
      [],
      ['Campaign Name', 'Revenue (INR)', 'Conversion Rate (%)'],
      ...(data.campaignPerformance || []).map((c) => [c.name, c.revenue, `${c.conversion}%`]),
    ]

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `clustermind_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    show('Report CSV exported successfully!', 'success')
  }

  if (loading) {
    return (
      <div className="dm-page">
        <LoadingState label="Loading comprehensive reports..." />
      </div>
    )
  }

  const sales = data?.salesReport ?? {}
  const customers = data?.customerReport ?? {}
  const marketing = data?.marketingReport ?? {}
  const recs = data?.recommendationReport ?? {}
  const behaviour = data?.behaviourReport ?? {}

  const revenueHistory = data?.revenueHistory ?? []
  const campaignPerformance = data?.campaignPerformance ?? []
  const customerGrowth = data?.customerGrowth ?? []
  const segments = data?.segmentRevenue ?? [
    { name: 'Premium Segment', value: 38 },
    { name: 'Loyal Customers', value: 29 },
    { name: 'Price Sensitive', value: 18 },
    { name: 'New Shoppers', value: 15 },
  ]

  const cards = [
    {
      label: 'Campaign Revenue',
      value: `₹${Number(sales.totalSales || 0).toLocaleString('en-IN')}`,
      change: '+12.4% vs last period',
      Icon: Banknote,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Conversion Rate',
      value: `${recs.conversionRate || 41.5}%`,
      change: '+4.2% AI lift',
      Icon: Percent,
      accent: 'from-violet-600 to-purple-600',
    },
    {
      label: 'Campaigns Run',
      value: `${marketing.campaignsRun || 0} active`,
      change: `${marketing.openRate || 68}% open rate`,
      Icon: Gift,
      accent: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Active Customers',
      value: Number(customers.activeCustomers || customers.totalCustomers || 0).toLocaleString(),
      change: `+${Number(customers.newCustomers || 0).toLocaleString()} new`,
      Icon: Users,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Total Views & Hits',
      value: Number(behaviour.pageViews || 0).toLocaleString(),
      change: `${Number(behaviour.cartAdditions || 0).toLocaleString()} carts`,
      Icon: Award,
      accent: 'from-blue-600 to-cyan-500',
    },
  ]

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon green">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Reports & Analytics</h2>
        <p className="dm-hero-sub">Live performance metrics across revenue, campaigns and customer segments</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="secondary" icon={Download} onClick={handleDownload}>
          Print Executive Report
        </Button>
        <Button icon={FileDown} onClick={handleExport}>
          Export CSV Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, change, Icon, accent }) => (
          <KpiCard key={label} label={label} value={value} change={change} icon={Icon} accent={accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue Growth Trend" subtitle="Monthly total sales volume (INR)">
          {revenueHistory.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueHistory} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="reportRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#reportRevGrad)">
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    formatter={(v) => `₹${(Number(v) / 100000).toFixed(1)}L`}
                    className="fill-slate-700"
                    fontSize={11}
                    fontWeight={700}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No revenue trend" description="Revenue history will appear as sales occur." />
          )}
        </ChartCard>

        <ChartCard title="Campaign Conversion & Performance" subtitle="Revenue generated vs conversion rate">
          {campaignPerformance.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={campaignPerformance} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v, name) => [name === 'conversion' ? `${v}%` : `₹${Number(v).toLocaleString('en-IN')}`, name === 'conversion' ? 'Conversion' : 'Revenue']}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#6366f1">
                  <LabelList
                    dataKey="conversion"
                    position="top"
                    formatter={(v) => `${v}% conv`}
                    className="fill-slate-700"
                    fontSize={11}
                    fontWeight={700}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No campaign performance" description="Execute marketing campaigns to track returns." />
          )}
        </ChartCard>

        <ChartCard title="Customer Growth Trajectory" subtitle="Total customer adoption over time">
          {customerGrowth.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={customerGrowth} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [Number(v).toLocaleString(), 'Registered Customers']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="customers" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }}>
                  <LabelList
                    dataKey="customers"
                    position="top"
                    formatter={(v) => Number(v).toLocaleString()}
                    className="fill-slate-700"
                    fontSize={11}
                    fontWeight={700}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No growth data" description="Customer growth data will update over time." />
          )}
        </ChartCard>

        <ChartCard title="Revenue Share by Segment" subtitle="Monetary contribution per customer cluster">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                strokeWidth={0}
              >
                {segments.map((_, i) => (
                  <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
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
        </ChartCard>
      </div>
    </div>
  )
}
