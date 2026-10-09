import { useEffect, useState } from 'react'
import { Award, Star, Coins, RefreshCw, Gift } from 'lucide-react'
import KpiCard from '../../components/marketing/KpiCard'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import StatusBadge from '../../components/marketing/StatusBadge'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { getMarketingLoyalty } from '../../api'

const REWARD_TIERS = [
  { name: 'Silver', range: '0 - 999 points', color: 'from-slate-400 to-slate-300', perk: 'Basic rewards & birthday offer' },
  { name: 'Gold', range: '1,000 - 4,999 points', color: 'from-amber-400 to-yellow-300', perk: 'Free shipping + early sale access' },
  { name: 'Platinum', range: '5,000+ points', color: 'from-purple-500 to-violet-400', perk: 'Premium perks + dedicated support' },
]

const COLUMNS = [
  { key: 'member', label: 'Member' },
  { key: 'tier', label: 'Tier', render: (v) => <StatusBadge status={v} /> },
  { key: 'pointsEarned', label: 'Points Earned', render: (v) => v.toLocaleString() },
  { key: 'pointsRedeemed', label: 'Points Redeemed', render: (v) => v.toLocaleString() },
  { key: 'lastActivity', label: 'Last Activity' },
]

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Bronze'

const normalizeLoyalty = (items) => ({
  stats: [
    { label: 'Total Loyalty Members', value: items.length.toLocaleString() },
    {
      label: 'Total Points Issued',
      value: items.reduce((sum, i) => sum + (i.pointsEarned ?? i.points ?? 0), 0).toLocaleString(),
    },
    {
      label: 'Points Redeemed',
      value: items.reduce((sum, i) => sum + (i.pointsRedeemed ?? 0), 0).toLocaleString(),
    },
    {
      label: 'Active Rewards',
      value: items.filter((i) => i.rewards?.length).length.toLocaleString(),
    },
  ],
  activity: items.map((i) => ({
    member: i.member || i.customerId || 'Member',
    tier: capitalize(i.tier),
    pointsEarned: i.pointsEarned ?? i.points ?? 0,
    pointsRedeemed: i.pointsRedeemed ?? 0,
    lastActivity: i.lastActivity || '—',
  })),
})

export default function LoyaltyProgramsPage() {
  const [loyalty, setLoyalty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getMarketingLoyalty()
      .then((res) => {
        if (active) setLoyalty(normalizeLoyalty(res?.items ?? []))
      })
      .catch(() => {
        if (active) setLoyalty(normalizeLoyalty([]))
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
        <LoadingState label="Loading loyalty programs..." />
      </div>
    )
  }

  const data = loyalty ?? normalizeLoyalty([])

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon green">
          <Award className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Loyalty Programs</h2>
        <p className="dm-hero-sub">Track loyalty members, points and reward tiers</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Loyalty Members" value={data.stats[0].value} icon={Award} accent="from-violet-600 to-purple-600" />
        <KpiCard label="Total Points Issued" value={data.stats[1].value} icon={Star} accent="from-amber-500 to-orange-500" />
        <KpiCard label="Points Redeemed" value={data.stats[2].value} icon={Coins} accent="from-blue-600 to-cyan-500" />
        <KpiCard label="Active Rewards" value={data.stats[3].value} icon={Gift} accent="from-emerald-500 to-teal-500" />
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900">Reward Tiers</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {REWARD_TIERS.map((t) => (
            <div key={t.name} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${t.color}`} />
              <p className="text-sm font-bold text-slate-900">{t.name} Tier</p>
              <p className="mt-0.5 text-xs text-slate-500">{t.range}</p>
              <p className="mt-3 text-sm text-slate-600">{t.perk}</p>
            </div>
          ))}
        </div>
      </div>

      <ChartCard
        title="Loyalty Activity"
        subtitle="Recent points activity across members"
        action={
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <RefreshCw size={12} />
            Updated today
          </span>
        }
      >
        {data.activity.length ? (
          <DataTable columns={COLUMNS} rows={data.activity} />
        ) : (
          <EmptyState
            title="No loyalty activity"
            description="No loyalty members are available at the moment."
          />
        )}
      </ChartCard>
    </div>
  )
}
