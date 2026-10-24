import { useRef, useState } from 'react'
import { Settings, Globe, Database, Shield, Key, Save, RotateCcw, Download, CheckCircle2 } from 'lucide-react'
import { useToast } from '../../components/marketing/Toast'
import './AdminSettingsPage.css'

const tabs = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'language', label: 'Language', icon: Globe },
  { key: 'database', label: 'Database', icon: Database },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'api', label: 'API', icon: Key },
]

const SETTINGS_KEY = 'clustermind_admin_system_settings'

const defaultSettings = {
  general: {
    siteName: 'ShopSmart',
    siteUrl: 'https://shopsmart.com',
    supportEmail: 'support@shopsmart.com',
    timezone: 'Asia/Kolkata',
  },
  security: {
    twoFactor: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
  },
  api: {
    apiKey: 'sk_live_xxxxxxxxxxxxxxxxxxxx',
    webhookUrl: 'https://shopsmart.com/webhook',
    rateLimit: 1000,
  },
  language: {
    defaultLang: 'en',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    currencySymbol: '\u20B9',
  },
  database: {
    lastBackup: 'No backup created yet',
  },
}

const loadSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      general: { ...defaultSettings.general, ...saved.general },
      security: { ...defaultSettings.security, ...saved.security },
      api: { ...defaultSettings.api, ...saved.api },
      language: { ...defaultSettings.language, ...saved.language },
      database: { ...defaultSettings.database, ...saved.database },
    }
  } catch {
    return defaultSettings
  }
}

function Field({ label, hint, children }) {
  return (
    <div className="settings-field">
      <label className="settings-field-label">{label}</label>
      {hint && <p className="settings-field-hint">{hint}</p>}
      {children}
    </div>
  )
}

function TextInput({ value, onChange, mono }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={`settings-input ${mono ? 'settings-input-mono' : ''}`}
    />
  )
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      className="settings-input"
    />
  )
}

export default function AdminSettingsPage() {
  const { show } = useToast()
  const restoreInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(null)
  const [database, setDatabase] = useState(() => loadSettings().database)

  const [general, setGeneral] = useState(() => loadSettings().general)

  const [security, setSecurity] = useState(() => loadSettings().security)

  const [api, setApi] = useState(() => loadSettings().api)

  const [language, setLanguage] = useState(() => loadSettings().language)

  const currentSettings = () => ({ general, language, security, api, database })

  const persistSettings = (next = currentSettings()) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }

  const handleSave = (section) => {
    const key = section.toLowerCase()
    persistSettings()
    setSaved(key)
    show(`${section} settings saved successfully`, 'success')
    setTimeout(() => setSaved(null), 2000)
  }

  const handleToggleTwoFactor = () => {
    const nextSecurity = { ...security, twoFactor: !security.twoFactor }
    setSecurity(nextSecurity)
    persistSettings({ ...currentSettings(), security: nextSecurity })
    show(`2FA ${nextSecurity.twoFactor ? 'enabled' : 'disabled'}`, 'success')
  }

  const handleBackup = () => {
    const backup = {
      createdAt: new Date().toISOString(),
      settings: currentSettings(),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    link.href = url
    link.download = `clustermind-settings-backup-${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    const sizeKb = Math.max(1, Math.round(blob.size / 1024))
    const nextDatabase = {
      lastBackup: `${new Date().toLocaleString('en-IN')} - ${sizeKb} KB`,
    }
    setDatabase(nextDatabase)
    persistSettings({ ...currentSettings(), database: nextDatabase })
    show('Settings backup downloaded.', 'success')
  }

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const restored = parsed.settings || parsed
      const next = {
        general: { ...defaultSettings.general, ...restored.general },
        language: { ...defaultSettings.language, ...restored.language },
        security: { ...defaultSettings.security, ...restored.security },
        api: { ...defaultSettings.api, ...restored.api },
        database: {
          ...defaultSettings.database,
          ...restored.database,
          lastBackup: `Restored ${new Date().toLocaleString('en-IN')}`,
        },
      }
      setGeneral(next.general)
      setLanguage(next.language)
      setSecurity(next.security)
      setApi(next.api)
      setDatabase(next.database)
      persistSettings(next)
      show('Settings restored successfully.', 'success')
    } catch {
      show('Unable to restore settings. Choose a valid JSON backup.', 'error')
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-hero">
        <div className="settings-hero-icon">
          <Settings className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="settings-hero-title">System Settings</h2>
          <p className="settings-hero-sub">Configure system-wide settings and preferences</p>
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`settings-tab ${activeTab === t.key ? 'active' : ''}`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-body">
        {activeTab === 'general' && (
          <div className="settings-card">
            <div className="settings-card-head">
              <h3>General Settings</h3>
              <p>Basic site configuration and branding</p>
            </div>
            <div className="settings-fields">
              <Field label="Site Name" hint="The name displayed across the platform">
                <TextInput value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} />
              </Field>
              <Field label="Site URL" hint="The primary domain for your store">
                <TextInput value={general.siteUrl} onChange={(e) => setGeneral({ ...general, siteUrl: e.target.value })} />
              </Field>
              <Field label="Support Email" hint="Contact email for customer support">
                <TextInput value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
              </Field>
              <Field label="Timezone" hint="Default timezone for reports and logs">
                <TextInput value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })} />
              </Field>
            </div>
            <div className="settings-card-foot">
              <button className="settings-save-btn" onClick={() => handleSave('General')}>
                {saved === 'general' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'general' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'language' && (
          <div className="settings-card">
            <div className="settings-card-head">
              <h3>Language & Locale</h3>
              <p>Localization and currency preferences</p>
            </div>
            <div className="settings-fields">
              <Field label="Default Language" hint="Primary language for the storefront">
                <TextInput value={language.defaultLang} onChange={(e) => setLanguage({ ...language, defaultLang: e.target.value })} />
              </Field>
              <Field label="Date Format" hint="How dates are displayed to users">
                <TextInput value={language.dateFormat} onChange={(e) => setLanguage({ ...language, dateFormat: e.target.value })} />
              </Field>
              <Field label="Currency Code" hint="ISO currency code (e.g. INR, USD)">
                <TextInput value={language.currency} onChange={(e) => setLanguage({ ...language, currency: e.target.value })} />
              </Field>
              <Field label="Currency Symbol" hint="Symbol shown before prices">
                <TextInput value={language.currencySymbol} onChange={(e) => setLanguage({ ...language, currencySymbol: e.target.value })} />
              </Field>
            </div>
            <div className="settings-card-foot">
              <button className="settings-save-btn" onClick={() => handleSave('Language')}>
                {saved === 'language' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'language' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="settings-card">
            <div className="settings-card-head">
              <h3>Database Management</h3>
              <p>Backup and restore operations</p>
            </div>
            <div className="settings-db-grid">
              <div className="settings-db-card">
                <div className="settings-db-icon bg-emerald-500">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="settings-db-title">Backup Database</p>
                  <p className="settings-db-desc">Create a full backup of all data</p>
                </div>
                <button className="settings-db-btn primary" onClick={handleBackup}>
                  <Download className="h-4 w-4" /> Start Backup
                </button>
              </div>
              <div className="settings-db-card">
                <div className="settings-db-icon bg-amber-500">
                  <RotateCcw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="settings-db-title">Restore Database</p>
                  <p className="settings-db-desc">Restore from a previous backup</p>
                </div>
                <button className="settings-db-btn secondary" onClick={() => restoreInputRef.current?.click()}>
                  <RotateCcw className="h-4 w-4" /> Start Restore
                </button>
                <input ref={restoreInputRef} type="file" accept="application/json,.json" className="sr-only" onChange={handleRestoreFile} />
              </div>
            </div>
            <div className="settings-db-last">
              <p className="settings-db-last-label">Last Backup</p>
              <p className="settings-db-last-value">{database.lastBackup}</p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-card">
            <div className="settings-card-head">
              <h3>Security Settings</h3>
              <p>Authentication and access controls</p>
            </div>
            <div className="settings-fields">
              <div className="settings-toggle-row">
                <div>
                  <p className="settings-toggle-label">Two-Factor Authentication</p>
                  <p className="settings-toggle-desc">Require 2FA for all admin accounts</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleTwoFactor}
                  className={`settings-toggle ${security.twoFactor ? 'on' : ''}`}
                >
                  <span className={`settings-toggle-thumb ${security.twoFactor ? 'on' : ''}`} />
                </button>
              </div>
              <Field label="Session Timeout (minutes)" hint="Auto-logout after inactivity">
                <NumberInput value={security.sessionTimeout} min={5} max={120} onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })} />
              </Field>
              <Field label="Minimum Password Length" hint="Enforce stronger passwords">
                <NumberInput value={security.passwordMinLength} min={6} max={32} onChange={(e) => setSecurity({ ...security, passwordMinLength: e.target.value })} />
              </Field>
              <Field label="Max Login Attempts" hint="Lock account after failed attempts">
                <NumberInput value={security.maxLoginAttempts} min={3} max={20} onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })} />
              </Field>
            </div>
            <div className="settings-card-foot">
              <button className="settings-save-btn" onClick={() => handleSave('Security')}>
                {saved === 'security' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'security' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="settings-card">
            <div className="settings-card-head">
              <h3>API Configuration</h3>
              <p>API keys and webhook settings</p>
            </div>
            <div className="settings-fields">
              <Field label="API Key" hint="Secret key for API authentication">
                <TextInput value={api.apiKey} mono onChange={(e) => setApi({ ...api, apiKey: e.target.value })} />
              </Field>
              <Field label="Webhook URL" hint="Endpoint for event notifications">
                <TextInput value={api.webhookUrl} onChange={(e) => setApi({ ...api, webhookUrl: e.target.value })} />
              </Field>
              <Field label="Rate Limit (req/min)" hint="Maximum requests per minute">
                <NumberInput value={api.rateLimit} min={100} max={10000} onChange={(e) => setApi({ ...api, rateLimit: e.target.value })} />
              </Field>
            </div>
            <div className="settings-card-foot">
              <button className="settings-save-btn" onClick={() => handleSave('API')}>
                {saved === 'api' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'api' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
