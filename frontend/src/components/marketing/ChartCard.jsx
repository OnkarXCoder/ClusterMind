import { motion } from 'framer-motion'

export default function ChartCard({ title, subtitle, action, children, className = '', bodyClassName = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`dm-card ${className}`}
    >
      <div className="dm-card-head" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {subtitle && <p className="dm-hero-sub">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={`dm-card-body ${bodyClassName}`}>{children}</div>
    </motion.div>
  )
}
