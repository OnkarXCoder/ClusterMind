import { motion } from 'framer-motion'

export default function KpiCard({ label, value, icon: Icon, accent = 'from-violet-600 to-blue-600', change, suffix }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="dashboard-kpi-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="dashboard-kpi-top">
        <div className="dashboard-kpi-copy">
          <p className="dashboard-kpi-label">{label}</p>
          <p className="dashboard-kpi-value">
            {value}
            {suffix && <span className="dashboard-kpi-suffix">{suffix}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`dashboard-kpi-icon bg-gradient-to-br ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {change && <p className="dashboard-kpi-change">{change}</p>}
    </motion.div>
  )
}
