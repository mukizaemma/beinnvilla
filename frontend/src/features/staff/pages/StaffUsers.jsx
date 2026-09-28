import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import { useStaffAuth } from '../auth/StaffAuthContext'
import StaffModal from '../components/StaffModal'
import '../staff.css'

const ROLE_LABEL = {
  superadmin: 'Super admin',
  admin: 'Admin',
  editor: 'Editor',
}

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'editor',
  status: 'active',
}

export default function StaffUsers() {
  const { user } = useStaffAuth()
  const superAdmin = user?.role === 'superadmin'
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)

  async function load() {
    const { data } = await staffClient.get('/api/users?limit=100&depth=0')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load users.'))
  }, [])

  if (user && user.role !== 'superadmin' && user.role !== 'admin') {
    return (
      <div className="staffPage">
        <h1>Users</h1>
        <p className="staffLead">Only an admin can manage users.</p>
      </div>
    )
  }

  function openCreate() {
    setForm({ ...empty, role: 'editor' })
  }

  function openEdit(row) {
    setForm({
      id: row.id,
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      password: '',
      role: row.role || 'editor',
      status: row.status || 'active',
    })
  }

  async function save(event) {
    event.preventDefault()
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      status: form.status,
    }
    if (superAdmin) payload.role = form.role
    else if (!form.id) payload.role = 'editor'
    if (form.password) payload.password = form.password
    try {
      if (form.id) await staffClient.patch(`/api/users/${form.id}`, payload)
      else {
        if (!form.password) {
          toast.error('Set a password for the new user.')
          return
        }
        await staffClient.post('/api/users', payload)
      }
      toast.success(form.id ? 'User updated.' : 'User added.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save this user.')
    }
  }

  async function remove(row) {
    if (row.id === user?.id) return
    if (!window.confirm(`Remove ${row.email}?`)) return
    try {
      await staffClient.delete(`/api/users/${row.id}`)
      toast.success('User removed.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not remove this user.')
    }
  }

  const roleOptions = superAdmin
    ? [
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
      ]
    : [{ value: 'editor', label: 'Editor' }]

  return (
    <div className="staffPage">
      <h1>Users</h1>
      <p className="staffLead">
        {superAdmin
          ? 'Accounts created from the handover link stay inactive until you set Status to Active. Only then can that person sign in.'
          : 'You can add, edit, and remove editors. Only a super admin can approve a new admin account.'}
      </p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={openCreate}>
          {superAdmin ? 'Add user' : 'Add editor'}
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}</td>
                <td>{row.email}</td>
                <td>{ROLE_LABEL[row.role] || row.role}</td>
                <td>{row.status || 'active'}</td>
                <td>
                  <div className="rowActions">
                    {(superAdmin || row.role === 'editor' || row.id === user?.id) && (
                      <button type="button" className="staffBtn" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                    )}
                    {row.id !== user?.id && (superAdmin || row.role === 'editor') && (
                      <button type="button" className="staffBtn staffBtnGhost" onClick={() => remove(row)}>
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffModal title={form.id ? 'Edit user' : 'Add user'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-6">
              First name
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label className="staffField col-6">
              Last name
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </label>
            <label className="staffField col-6">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="staffField col-6">
              {form.id ? 'New password' : 'Password'}
              <input
                type="password"
                required={!form.id}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={form.id ? 'Leave blank to keep the current password' : ''}
              />
            </label>
            <label className="staffField col-6">
              Role
              <select
                value={superAdmin ? form.role : 'editor'}
                disabled={!superAdmin || form.role === 'superadmin'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {form.role === 'superadmin' && <option value="superadmin">Super admin</option>}
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="staffField col-6">
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="formActions col-12">
              <button type="submit" className="staffBtn">
                Save user
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
