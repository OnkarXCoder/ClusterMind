import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import SearchBar from './SearchBar'
import DateRangePicker from './DateRangePicker'
import { currentMonthRange } from '../../utils/dateRange'
import { NAV_ITEMS } from './MarketingSidebar'
import { getMarketingCampaigns } from '../../api'
import { getCurrentUser, logout } from '../../services/auth'

export default function MarketingHeader({ onMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [range, setRange] = useState(currentMonthRange())
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    getMarketingCampaigns()
      .then((res) => {
        if (res?.items?.length) {
          setNotifications(
            res.items.slice(0, 5).map((c) => ({
              title: `Campaign "${c.name}" is ${c.status}`,
              time: c.startDate || '',
              unread: String(c.status).toLowerCase() === 'active',
            })),
          )
        }
      })
      .catch(() => {})
  }, [])
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const current = NAV_ITEMS.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
  )
  const title = current?.label || 'Marketing & AI/ML Dashboard'
  const moduleMatches = search.trim()
    ? NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(search.trim().toLowerCase()),
      ).slice(0, 5)
    : []

  const openModule = (to) => {
    setSearch('')
    navigate(to)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter' && moduleMatches[0]) {
      openModule(moduleMatches[0].to)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const user = getCurrentUser() || {}
  const name = user.fullName || user.name || 'Marketing Team'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="internal-header">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="internal-header-title min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-900">{title}</h1>
        <p className="hidden text-xs text-slate-500 sm:block">Marketing + AI/ML Console</p>
      </div>

      <div className="internal-header-actions ml-auto flex items-center gap-2.5 sm:gap-3">
        <div className="internal-module-search">
          <SearchBar
            value={search}
            onChange={setSearch}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search modules..."
            className="internal-header-search w-full lg:w-64"
          />
          {moduleMatches.length > 0 && (
            <div className="internal-search-menu">
              {moduleMatches.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.to} type="button" onClick={() => openModule(item.to)}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <DateRangePicker value={range} onChange={setRange} />

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((o) => !o)
              setProfileOpen(false)
            }}
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notifications.filter((n) => n.unread).length}
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-slate-400">No notifications</li>
                )}
                {notifications.map((n, i) => (
                  <li key={i} className="flex items-start gap-2.5 px-3 py-3 transition hover:bg-slate-50">
                    {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
                    <div className={n.unread ? '' : 'pl-3.5'}>
                      <p className="text-sm text-slate-700">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((o) => !o)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 transition hover:border-violet-300"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden text-sm font-semibold text-slate-800 sm:block">{name}</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/marketing/settings')
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
