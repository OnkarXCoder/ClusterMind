import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, Eye, Clock, Users, ShieldCheck, Mail, UserRound, CheckCircle2 } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import EmptyState from '../../components/marketing/EmptyState'
import { createAdminTeamUser, deleteAdminTeamUser, getAdminTeamUsers, getAdminActivityLogs, updateAdminTeamUser } from '../../api'

export default function AdminUserManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [userForm, setUserForm] = useState({ name: '', email: '', role: '' })
  const [adminUsers, setAdminUsers] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [roles, setRoles] = useState([])

  const load = () => {
    getAdminTeamUsers().then((res) => {
      const users = Array.isArray(res) ? res : res?.users
      if (Array.isArray(users)) {
        setAdminUsers(users.map((u) => ({ ...u, id: u.userId ?? u.id ?? u._id })))
      }
      const rawRoles = Array.isArray(res?.roles) ? res.roles : []
      setRoles(rawRoles.map((r) => (typeof r === 'string' ? { name: r } : r)))
    })
    getAdminActivityLogs().then((res) => {
      if (Array.isArray(res)) setActivityLogs(res.map((l) => ({ ...l, id: l._id ?? l.id })))
    })
  }

  useEffect(load, [])

  const filteredUsers = adminUsers.filter(
    (u) =>
      String(u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      String(u.role || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleAddUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role) {
      show('Please fill all fields', 'error')
      return
    }

    try {
      const created = await createAdminTeamUser(userForm)
      if (!created) throw new Error('Unable to create user')
      const normalized = { ...created, id: created.userId ?? created.id ?? created._id }
      setAdminUsers((users) => [normalized, ...users])
      show(`User "${normalized.name}" added successfully`, 'success')
      setShowAddUser(false)
      setUserForm({ name: '', email: '', role: '' })
      load()
    } catch (err) {
      show(err.message || 'Unable to create user', 'error')
    }
  }

  const openEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      status: user.status || 'Active',
    })
  }

  const handleUpdateUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role) {
      show('Please fill name, email and role', 'error')
      return
    }
    try {
      const updated = await updateAdminTeamUser(editingUser.id, userForm)
      if (!updated) throw new Error('Unable to save user changes')
      const normalized = { ...updated, id: updated.userId ?? updated.id ?? updated._id }
      setAdminUsers((users) => users.map((user) => user.id === editingUser.id ? normalized : user))
      show(`User "${normalized.name}" updated successfully`, 'success')
      setEditingUser(null)
      setUserForm({ name: '', email: '', role: '' })
    } catch (err) {
      show(err.message || 'Unable to update user', 'error')
    }
  }

  const handleDeleteUser = async (user) => {
    try {
      const deleted = await deleteAdminTeamUser(user.id)
      if (!deleted) throw new Error('Unable to delete user')
      setAdminUsers((users) => users.filter((item) => item.id !== user.id))
      show(`User "${user.name}" deleted successfully`, 'success')
      load()
    } catch (err) {
      show(err.message || 'Unable to delete user', 'error')
    }
  }

  const tabs = [
    { key: 'users', label: 'Admin Users' },
    { key: 'roles', label: 'Roles & Permissions' },
    { key: 'logs', label: 'Activity Logs' },
  ]

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon purple"><Users size={24} /></div>
        <div>
          <h2 className="dm-hero-title">User & Role Management</h2>
          <p className="dm-hero-sub">{adminUsers.length} admin users, {roles.length} roles</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div className="dm-tabs">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`dm-tab ${activeTab === t.key ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="w-64" />
          <Button icon={Plus} onClick={() => activeTab === 'users' ? setShowAddUser(true) : show('Roles are managed from backend seed/config data.', 'info')}>
            {activeTab === 'users' ? 'Add User' : 'Add Role'}
          </Button>
        </div>
      </div>

      {activeTab === 'users' && (
        <ChartCard title="Admin Users" subtitle="Manage administrator accounts">
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>No admin users found</td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.id}</td>
                    <td style={{ fontWeight: 700, color: '#1E293B' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><StatusBadge status={String(u.role || '').includes('Super') ? 'Active' : String(u.role || '').includes('Admin') ? 'Completed' : String(u.role || '').includes('Marketing') ? 'Scheduled' : 'Draft'} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td>{u.lastLogin}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewUser(u)}>View</Button>
                        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditUser(u)}>Edit</Button>
                        <button onClick={() => handleDeleteUser(u)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {activeTab === 'roles' && (
        roles.length === 0 ? (
          <EmptyState title="No roles configured" description="Roles are read from backend configuration." />
        ) : (
          <div className="dm-grid-3">
            {roles.map((r, i) => (
              <ChartCard key={i} title={r.name} subtitle={r.users != null ? `${r.users} users` : 'Role'}>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">{r.description || 'Role configured in the backend.'}</p>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">Permissions</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{r.permissions || '—'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={Edit3} onClick={() => show('Role permissions are read from backend configuration.', 'info')}>Edit</Button>
                    {r.name !== 'Super Admin' && (
                      <Button size="sm" variant="ghost" icon={Trash2} onClick={() => show('Role deletion requires a backend permissions endpoint.', 'info')}>Delete</Button>
                    )}
                  </div>
                </div>
              </ChartCard>
            ))}
          </div>
        )
      )}

      {activeTab === 'logs' && (
        <ChartCard title="Activity Logs" subtitle="Recent admin activity">
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>No activity logs found</td>
                  </tr>
                )}
                {activityLogs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.user}</td>
                    <td>{l.action}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} />
                        {l.timestamp}
                      </span>
                    </td>
                    <td>{l.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      <Modal
        open={showAddUser || !!editingUser}
        onClose={() => {
          setShowAddUser(false)
          setEditingUser(null)
        }}
        title={editingUser ? 'Edit Admin User' : 'Create Admin User'}
        subtitle={editingUser ? 'Update account details and permissions' : 'Set up a secure administrator account'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowAddUser(false)
              setEditingUser(null)
            }}>Cancel</Button>
            <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>{editingUser ? 'Save Changes' : 'Add User'}</Button>
          </>
        }
      >
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-4">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-auto rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-400 shadow-sm">
              {editingUser ? 'EDIT MODE' : 'NEW ACCOUNT'}
            </span>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Account information</h4>
              <p className="text-xs text-slate-500">All fields marked with * are required.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="min-h-[72px]">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <UserRound size={14} className="text-indigo-500" /> Full name *
              </label>
              <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Type the administrator's name" autoFocus />
            </div>
            <div className="min-h-[84px]">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Mail size={14} className="text-indigo-500" /> Work email *
              </label>
              <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="name@company.com" />
              <p className="mt-1.5 text-[11px] text-slate-400">Use a unique work email for account notifications.</p>
            </div>
            <div className={`grid gap-4 ${editingUser ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="min-h-[72px]">
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Role *</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
                  <option value="">Choose role</option>
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              {editingUser && (
                <div className="min-h-[72px]">
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Account status</label>
                  <select value={userForm.status || 'Active'} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-xs leading-5 text-emerald-800">Changes are saved securely and reflected in the admin users list immediately.</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title={viewUser?.name}
        subtitle={viewUser?.email}
      >
        {viewUser && (
          <div className="space-y-3">
            {Object.entries(viewUser).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-semibold text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
