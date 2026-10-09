import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Activity,
  Layers,
  Sparkles,
  Cpu,
  Megaphone,
  BarChart3,
  Bell,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  X,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/marketing/Button'
import { getCurrentUser } from '../../services/auth'

const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/customers', label: 'Customer Management', icon: Users },
      { to: '/admin/products', label: 'Product Management', icon: Package },
      { to: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
    ],
  },
  {
    label: 'AI & Analytics',
    items: [
      { to: '/admin/behaviour', label: 'Behaviour Analysis', icon: Activity },
      { to: '/admin/segmentation', label: 'Customer Segmentation', icon: Layers },
      { to: '/admin/recommendations', label: 'AI Recommendations', icon: Sparkles },
    ],
  },
  {
    label: 'AI/ML',
    items: [
      { to: '/admin/models', label: 'Model Management', icon: Cpu },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/admin/marketing', label: 'Marketing Management', icon: Megaphone },
      { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
      { to: '/admin/users', label: 'User & Role Management', icon: Shield },
      { to: '/admin/settings', label: 'System Settings', icon: Settings },
    ],
  },
]

export const ADMIN_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

export default function AdminSidebar({ open, onClose, onLogout }) {
  const user = getCurrentUser() || {}
  const name = user.fullName || user.name || 'Admin'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const [collapsed, setCollapsed] = useState({})

  const toggle = (label) => setCollapsed((p) => ({ ...p, [label]: !p[label] }))

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
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="internal-brand-title">ShopSmart</p>
              <p className="internal-brand-subtitle">Admin Dashboard</p>
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
          <p>Administration</p>
        </div>

        <nav>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="internal-sidebar-section">
              <button
                onClick={() => toggle(section.label)}
                className="internal-section-toggle"
              >
                {section.label}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${collapsed[section.label] ? '-rotate-90' : ''}`}
                />
              </button>
              {!collapsed[section.label] &&
                section.items.map(({ to, label, icon: Icon, end }) => (
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
                            layoutId="admin-sidebar-active"
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
            </div>
          ))}
        </nav>

        <div className="internal-sidebar-footer">
          <div className="internal-user-card">
            <div className="internal-user-avatar">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-slate-400">Super Admin</p>
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
