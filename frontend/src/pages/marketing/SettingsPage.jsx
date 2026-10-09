import { useState } from 'react'
import { User, Bell, Sparkles, LayoutDashboard, ShieldCheck, Save } from 'lucide-react'
import Button from '../../components/marketing/Button'
import { useToast } from '../../components/marketing/Toast'
import { getCurrentUser } from '../../services/auth'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100'

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, description, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-violet-600' : 'bg-slate-300'}`}
        aria-pressed={on}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { show } = useToast()
  const user = getCurrentUser() || {}
  const [form, setForm] = useState({
    name: user.name || 'Marketing Team',
    email: user.email || 'marketing@shopsmart.ai',
    department: 'Marketing Team',
  })

  const handleSave = (e) => {
    e.preventDefault()
    show('Settings saved. Backend persistence is not implemented yet.', 'success')
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon blue">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Settings</h2>
        <p className="dm-hero-sub">Manage profile, preferences and security</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SettingsSection icon={User} title="Profile Settings" description="Your personal information">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
              <input className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <Button type="submit" icon={Save}>
              Save Profile
            </Button>
          </form>
        </SettingsSection>

        <div className="space-y-6">
          <SettingsSection icon={Bell} title="Notification Settings" description="Control what you receive">
            <Toggle label="Campaign performance alerts" description="When a campaign crosses a threshold" defaultOn />
            <Toggle label="Segment change alerts" description="When the AI updates a segment" defaultOn />
            <Toggle label="Model training notifications" description="When retraining finishes" />
            <Toggle label="Weekly digest email" description="Summary every Monday at 9 AM" defaultOn />
          </SettingsSection>

          <SettingsSection icon={Sparkles} title="Marketing Preferences" description="Default values for new campaigns">
            <Toggle label="Auto-suggest target segments" description="AI recommends segments for each campaign" defaultOn />
            <Toggle label="Auto-apply AI recommendations" description="Apply recommendations without review" />
            <Toggle label="Personalize offer messaging" description="Use AI-generated copy per customer" defaultOn />
          </SettingsSection>
        </div>

        <SettingsSection icon={LayoutDashboard} title="Dashboard Preferences" description="Customize this dashboard">
          <Toggle label="Show AI assistant tips" description="Display helpful AI hints across pages" defaultOn />
          <Toggle label="Compact tables" description="Reduce row padding in data tables" />
          <Toggle label="Default date range" description="Open reports on the current month" defaultOn />
        </SettingsSection>

        <SettingsSection icon={ShieldCheck} title="Security" description="Protect your account">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Change Password</label>
              <input type="password" className={inputClass} placeholder="New password" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input type="password" className={inputClass} placeholder="Confirm new password" />
            </div>
            <Toggle label="Two-factor authentication" description="Extra security for your account" />
            <Button type="submit" variant="secondary" icon={Save} onClick={() => show('Password update is a frontend demo for now.', 'info')}>
              Update Password
            </Button>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
