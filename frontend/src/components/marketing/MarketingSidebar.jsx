/* eslint-disable react-refresh/only-export-components */
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Database,
  Activity,
  Layers,
  Sparkles,
  Megaphone,
  Ticket,
  Award,
  Crosshair,
  BarChart3,
  Cpu,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import Button from './Button'
import { getCurrentUser } from '../../services/auth'

export const NAV_ITEMS = [
  { to: '/marketing', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/marketing/dataset', label: 'Dataset Management', icon: Database },
  { to: '/marketing/behaviour', label: 'Behaviour Analysis', icon: Activity },
  { to: '/marketing/segmentation', label: 'Customer Segmentation', icon: Layers },
  { to: '/marketing/recommendations', label: 'Recommendation Engine', icon: Sparkles },
  { to: '/marketing/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/marketing/offers', label: 'Offers & Coupons', icon: Ticket },
  { to: '/marketing/loyalty', label: 'Loyalty Programs', icon: Award },
  { to: '/marketing/targeting', label: 'Customer Targeting', icon: Crosshair },
  { to: '/marketing/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/marketing/models', label: 'Model Performance', icon: Cpu },
  { to: '/marketing/settings', label: 'Settings', icon: Settings },
]

export default function MarketingSidebar({ open, onClose, onLogout }) {
  const user = getCurrentUser() || {}
  const name = user.fullName || user.name || 'Marketing Team'
  const role = user.role === 'aiml' ? 'AI/ML Team' : 'Marketing + AI/ML'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="internal-overlay lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`internal-sidebar ${open ? 'open' : ''}`}
      >
        <div className="internal-brand">
          <div className="flex items-center gap-3">
            <div className="internal-brand-mark">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="internal-brand-title">ShopSmart</p>
              <p className="internal-brand-subtitle">Marketing + AI/ML</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="internal-close"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="internal-dashboard-tag">
          <p>Dashboard</p>
          <p>Marketing & AI/ML</p>
        </div>

        <nav>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `internal-nav-link px-4 py-2.5 ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="internal-nav-active"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="internal-sidebar-footer">
          <div className="internal-user-card">
            <div className="internal-user-avatar">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-slate-400">{role}</p>
            </div>
          </div>
          <Button variant="danger" className="w-full" icon={LogOut} onClick={onLogout}>
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
