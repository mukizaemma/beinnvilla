import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import { useStaffAuth } from '../auth/StaffAuthContext'
import '../staff.css'

export default function StaffAccount() {
  const { user } = useStaffAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })

  useEffect(() => {
    if (!user) return
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
    })
  }, [user])

  async function save(event) {
    event.preventDefault()
    if (!user?.id) return
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
    }
    if (form.password) payload.password = form.password
    try {
      await staffClient.patch(`/api/users/${user.id}`, payload)
      toast.success('Account updated.')
      setForm({ ...form, password: '' })
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not update your account.')
    }
  }

  return (
    <div className="staffPage">
      <h1>My account</h1>
      <form onSubmit={save} className="staffCard" style={{ padding: '1.1rem' }}>
        <div className="formGrid">
          <label className="staffField col-3">
            First name
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </label>
          <label className="staffField col-3">
            Last name
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </label>
          <label className="staffField col-3">
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="staffField col-3">
            New password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep the current password"
            />
          </label>
        </div>
        <div className="formActions">
          <button type="submit" className="staffBtn">
            Save account
          </button>
        </div>
      </form>
    </div>
  )
}
