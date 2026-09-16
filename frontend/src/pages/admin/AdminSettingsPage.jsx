import { useState } from 'react'
import { Settings, Globe, Database, Shield, Key } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import { useToast } from '../../components/marketing/Toast'

export default function AdminSettingsPage() {
  const { show } = useToast()
  const [activeTab, setActiveTab] = useState('general')

  const [general, setGeneral] = useState({ siteName: 'ShopSmart', siteUrl: 'https://shopsmart.com', supportEmail: 'support@shopsmart.com', timezone: 'Asia/Kolkata' })
  const [security, setSecurity] = useState({ twoFactor: true, sessionTimeout: 30, passwordMinLength: 8, maxLoginAttempts: 5 })
  const [api, setApi] = useState({ apiKey: 'sk_live_xxxxxxxxxxxxxxxxxxxx', webhookUrl: 'https://shopsmart.com/webhook', rateLimit: 1000 })
  const [language, setLanguage] = useState({ defaultLang: 'en', dateFormat: 'DD/MM/YYYY', currency: 'INR', currencySymbol: '₹' })

  const tabs = [
    { key: 'general', label: 'General Settings', icon: Settings },
    { key: 'language', label: 'Language & Locale', icon: Globe },
    { key: 'database', label: 'Database', icon: Database },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'api', label: 'API Config', icon: Key },
  ]

  const handleSave = (section) => {
    show(`${section} settings saved (demo)`, 'success')
  }

  const handleBackup = () => {
    show('Database backup initiated (demo)', 'success')
  }

  const handleRestore = () => {
    show('Database restore initiated (demo)', 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">System Settings</h2>
        <p className="text-sm text-slate-500">Configure system-wide settings and preferences</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === t.key
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <ChartCard title="General Settings" subtitle="Basic site configuration">
          <div className="space-y-4">
            {Object.entries(general).map(([key, val]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  value={val}
                  onChange={(e) => setGeneral({ ...general, [key]: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
            ))}
            <Button onClick={() => handleSave('General')}>Save Changes</Button>
          </div>
        </ChartCard>
      )}

      {activeTab === 'language' && (
        <ChartCard title="Language & Locale Settings" subtitle="Localization preferences">
          <div className="space-y-4">
            {Object.entries(language).map(([key, val]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  value={val}
                  onChange={(e) => setLanguage({ ...language, [key]: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
            ))}
            <Button onClick={() => handleSave('Language')}>Save Changes</Button>
          </div>
        </ChartCard>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          <ChartCard title="Database Management" subtitle="Backup and restore operations">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                      <Database className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Backup Database</p>
                      <p className="text-xs text-slate-500">Create a full backup of all data</p>
                    </div>
                  </div>
                  <Button className="mt-4" icon={Database} onClick={handleBackup}>Start Backup</Button>
                </div>
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                      <Database className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Restore Database</p>
                      <p className="text-xs text-slate-500">Restore from a previous backup</p>
                    </div>
                  </div>
                  <Button className="mt-4" variant="secondary" icon={Database} onClick={handleRestore}>Start Restore</Button>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Last Backup</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">28 May 2024, 2:00 AM — 245 MB</p>
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {activeTab === 'security' && (
        <ChartCard title="Security Settings" subtitle="Authentication and access controls">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Require 2FA for all admin accounts</p>
              </div>
              <button
                onClick={() => {
                  setSecurity({ ...security, twoFactor: !security.twoFactor })
                  show(`2FA ${!security.twoFactor ? 'enabled' : 'disabled'} (demo)`, 'success')
                }}
                className={`relative h-6 w-11 rounded-full transition ${security.twoFactor ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${security.twoFactor ? 'left-5.5' : 'left-0.5'}`} style={{ left: security.twoFactor ? '22px' : '2px' }} />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Session Timeout (minutes)</label>
              <input type="number" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Minimum Password Length</label>
              <input type="number" value={security.passwordMinLength} onChange={(e) => setSecurity({ ...security, passwordMinLength: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Max Login Attempts</label>
              <input type="number" value={security.maxLoginAttempts} onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <Button onClick={() => handleSave('Security')}>Save Changes</Button>
          </div>
        </ChartCard>
      )}

      {activeTab === 'api' && (
        <ChartCard title="API Configuration" subtitle="API keys and webhook settings">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">API Key</label>
              <input value={api.apiKey} onChange={(e) => setApi({ ...api, apiKey: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Webhook URL</label>
              <input value={api.webhookUrl} onChange={(e) => setApi({ ...api, webhookUrl: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Rate Limit (req/min)</label>
              <input type="number" value={api.rateLimit} onChange={(e) => setApi({ ...api, rateLimit: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </div>
            <Button onClick={() => handleSave('API')}>Save Changes</Button>
          </div>
        </ChartCard>
      )}
    </div>
  )
}
