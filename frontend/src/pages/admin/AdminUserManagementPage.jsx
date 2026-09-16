import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, Eye, Clock } from 'lucide-react'
import ChartCard from '../../components/marketing/ChartCard'
import Button from '../../components/marketing/Button'
import StatusBadge from '../../components/marketing/StatusBadge'
import SearchBar from '../../components/marketing/SearchBar'
import Modal from '../../components/marketing/Modal'
import { useToast } from '../../components/marketing/Toast'
import { getAdminTeamUsers, getAdminActivityLogs } from '../../api'
import { USER_ROLES, ADMIN_USERS as MOCK_ADMIN_USERS, ACTIVITY_LOGS as MOCK_ACTIVITY_LOGS } from '../../data/adminMockData'

export default function AdminUserManagementPage() {
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [viewUser, setViewUser] = useState(null)
  const [userForm, setUserForm] = useState({ name: '', email: '', role: '' })
  const [adminUsers, setAdminUsers] = useState(MOCK_ADMIN_USERS)
  const [activityLogs, setActivityLogs] = useState(MOCK_ACTIVITY_LOGS)

  const load = () => {
    getAdminTeamUsers().then((res) => {
      if (res) setAdminUsers(res.map((u) => ({ ...u, id: u.userId ?? u.id })))
    })
    getAdminActivityLogs().then((res) => {
      if (res) setActivityLogs(res.map((l) => ({ ...l, id: l._id ?? l.id })))
    })
  }

  useEffect(load, [])

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email || !userForm.role) {
      show('Please fill all fields', 'error')
      return
    }
    show(`User "${userForm.name}" added (demo)`, 'success')
    setShowAddUser(false)
    setUserForm({ name: '', email: '', role: '' })
  }

  const tabs = [
    { key: 'users', label: 'Admin Users' },
    { key: 'roles', label: 'Roles & Permissions' },
    { key: 'logs', label: 'Activity Logs' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User & Role Management</h2>
          <p className="text-sm text-slate-500">{adminUsers.length} admin users, {USER_ROLES.length} roles</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="w-64" />
          <Button icon={Plus} onClick={() => activeTab === 'users' ? setShowAddUser(true) : show('Add role (demo)', 'info')}>
            {activeTab === 'users' ? 'Add User' : 'Add Role'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === t.key
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <ChartCard title="Admin Users" subtitle="Manage administrator accounts">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">ID</th>
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Last Login</th>
                  <th className="px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{u.id}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-5 py-4 text-slate-500">{u.email}</td>
                    <td className="px-5 py-4"><StatusBadge status={u.role.includes('Super') ? 'Active' : u.role.includes('Admin') ? 'Completed' : u.role.includes('Marketing') ? 'Scheduled' : 'Draft'} /></td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4 text-slate-500">{u.lastLogin}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewUser(u)}>View</Button>
                        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => show('Edit user (demo)', 'info')}>Edit</Button>
                        <button onClick={() => show(`Deleted user "${u.name}" (demo)`, 'success')} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {USER_ROLES.map((r, i) => (
            <ChartCard key={i} title={r.name} subtitle={`${r.users} users`}>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{r.description}</p>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Permissions</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">{r.permissions}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={Edit3} onClick={() => show('Edit role (demo)', 'info')}>Edit</Button>
                  {r.name !== 'Super Admin' && (
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => show(`Deleted role "${r.name}" (demo)`, 'success')}>Delete</Button>
                  )}
                </div>
              </div>
            </ChartCard>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <ChartCard title="Activity Logs" subtitle="Recent admin activity">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">User</th>
                  <th className="px-5 py-3.5 font-semibold">Action</th>
                  <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-5 py-3.5 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.map((l) => (
                  <tr key={l.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{l.user}</td>
                    <td className="px-5 py-4 text-slate-600">{l.action}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {l.timestamp}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      <Modal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="Add Admin User"
        subtitle="Create a new admin account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Name *</label>
            <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Full name" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Email *</label>
            <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="email@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Role *</label>
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option value="">Select role</option>
              {USER_ROLES.map((r) => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
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
