import { motion } from 'framer-motion'

const ACCENT_MAP = {
  'from-violet-600 to-blue-600': 'linear-gradient(135deg, #7C3AED, #2563EB)',
  'from-red-500 to-orange-500': 'linear-gradient(135deg, #EF4444, #F97316)',
  'from-blue-500 to-cyan-500': 'linear-gradient(135deg, #3B82F6, #06B6D4)',
  'from-emerald-500 to-teal-500': 'linear-gradient(135deg, #10B981, #14B8A6)',
  'from-violet-500 to-purple-500': 'linear-gradient(135deg, #8B5CF6, #A855F7)',
  'from-pink-500 to-rose-500': 'linear-gradient(135deg, #EC4899, #F43F5E)',
  'from-amber-500 to-orange-500': 'linear-gradient(135deg, #F59E0B, #F97316)',
  'from-indigo-500 to-blue-500': 'linear-gradient(135deg, #6366F1, #3B82F6)',
  'from-teal-500 to-green-500': 'linear-gradient(135deg, #14B8A6, #22C55E)',
}

export default function KpiCard({ label, value, icon: Icon, accent = 'from-violet-600 to-blue-600', change, suffix }) {
  const bg = ACCENT_MAP[accent] || 'linear-gradient(135deg, #7C3AED, #2563EB)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="dm-stat-card"
    >
      <div className="dm-stat-card-top">
        <div>
          <p className="dm-stat-card-label">{label}</p>
          <p className="dm-stat-card-value">
            {value}
            {suffix && <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 4, opacity: 0.6 }}>{suffix}</span>}
          </p>
        </div>
        {Icon && (
          <div className="dm-stat-card-icon" style={{ background: bg }}>
            <Icon style={{ width: 20, height: 20 }} />
          </div>
        )}
      </div>
      {change && (
        <span className="dm-stat-card-change up">{change}</span>
      )}
    </motion.div>
  )
}
