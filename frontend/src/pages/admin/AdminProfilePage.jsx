import { useState } from 'react'
import { User, Mail, Phone, Shield, Key, BadgeCheck, Calendar } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import { useToast } from '../../components/marketing/Toast'

export default function AdminProfilePage() {
  const { show } = useToast()
  const stored = JSON.parse(localStorage.getItem('shopsmart_user') || '{}')
  const role = localStorage.getItem('shopsmart_role') || 'admin'

  const [profile, setProfile] = useState({
    name: stored.name || 'Admin',
    email: stored.email || 'admin@shopsmart.com',
    phone: stored.contact || '+91 98765 43210',
  })

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSaveProfile = () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      show('Name and email are required.', 'error')
      return
    }
    const updated = { ...stored, name: profile.name, email: profile.email, contact: profile.phone }
    localStorage.setItem('shopsmart_user', JSON.stringify(updated))
    show('Profile updated successfully.', 'success')
  }

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      show('All password fields are required.', 'error')
      return
    }
    if (passwords.next.length < 6) {
      show('New password must be at least 6 characters.', 'error')
      return
    }
    if (passwords.next !== passwords.confirm) {
      show('New passwords do not match.', 'error')
      return
    }
    setPasswords({ current: '', next: '', confirm: '' })
    show('Password changed successfully (demo).', 'success')
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon orange"><User size={24} /></div>
        <div>
          <h2 className="dm-hero-title">My Profile</h2>
          <p className="dm-hero-sub">{role} account settings</p>
        </div>
      </div>

      <ChartCard title="My Profile" subtitle="Manage your admin account details">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-2xl font-black text-white shadow-lg">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                <Shield className="h-3.5 w-3.5" />
                {role}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                <BadgeCheck className="h-3.5 w-3.5" />
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>
      </ChartCard>

      <div className="dm-grid-2">
        <ChartCard title="Personal Information" subtitle="Update your account details">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Change Password" subtitle="Keep your account secure">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">New Password</label>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <Button onClick={handleChangePassword}>Update Password</Button>
            </div>
          </ChartCard>

          <ChartCard title="Account Info" subtitle="Session details">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm capitalize text-slate-500">
                  <Shield className="h-4 w-4" /> Role
                </span>
                <span className="text-sm font-bold capitalize text-slate-900">{role}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" /> Member Since
                </span>
                <span className="text-sm font-bold text-slate-900">12 Jan 2023</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <BadgeCheck className="h-4 w-4" /> Last Login
                </span>
                <span className="text-sm font-bold text-slate-900">Today</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
