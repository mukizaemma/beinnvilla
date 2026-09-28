import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { useStaffAuth } from '../auth/StaffAuthContext'
import styles from './StaffLoginPage.module.css'

export default function StaffResetPage() {
  const { token } = useParams()
  const { resetPassword } = useStaffAuth()
  const { data } = useSiteLayout()
  const brand = brandFromCompany(data?.company)
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The passwords do not match.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await resetPassword(token, password)
      navigate('/staff', { replace: true })
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'This reset link is invalid or expired.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.back}>
        ← Back to home
      </Link>
      <form className={styles.card} onSubmit={onSubmit}>
        {brand.logo ? <img className={styles.logo} src={brand.logo} alt={brand.name} /> : null}
        <h1>New password</h1>
        <p>Choose a new password for your admin account.</p>
        <label>
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Confirm password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
        <Link to="/staff/login" className={styles.forgot}>
          Back to login
        </Link>
      </form>
    </div>
  )
}
