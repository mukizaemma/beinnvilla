import { useState } from 'react'
import { Link } from 'react-router-dom'
import { brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { useStaffAuth } from '../auth/StaffAuthContext'
import styles from './StaffLoginPage.module.css'

export default function StaffForgotPage() {
  const { forgotPassword } = useStaffAuth()
  const { data } = useSiteLayout()
  const brand = brandFromCompany(data?.company)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Could not send a reset email.')
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
        <h1>Reset password</h1>
        {sent ? (
          <p className={styles.note}>
            If that email has an account, we sent a reset link. Check your inbox, then return here to
            sign in.
          </p>
        ) : (
          <>
            <p>Enter the email for your admin account. We’ll send a reset link.</p>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </>
        )}
        <Link to="/staff/login" className={styles.forgot}>
          Back to login
        </Link>
      </form>
    </div>
  )
}
