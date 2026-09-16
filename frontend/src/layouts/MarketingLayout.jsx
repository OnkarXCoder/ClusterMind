import { useState } from 'react'
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingSidebar from '../components/marketing/MarketingSidebar'
import MarketingHeader from '../components/marketing/MarketingHeader'
import { getCurrentUser, isAuthenticated, logout } from '../services/auth'

export default function MarketingLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const role = getCurrentUser()?.role

  if (!isAuthenticated() || !['marketing', 'aiml'].includes(role)) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="internal-shell">
      <MarketingSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="internal-main">
        <MarketingHeader onMenu={() => setSidebarOpen(true)} />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="internal-content"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
