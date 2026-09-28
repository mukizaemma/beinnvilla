import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { CMS_URL } from '@lib/apiClient'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { isValidEmail } from '@features/hotel/email'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { DEVELOPER_EMAIL } from '@features/handover/guide'
import styles from './StaffLoginPage.module.css'

export default function StaffJoinPage() {
  const { data } = useSiteLayout()
  const brand = brandFromCompany(data?.company)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [doneEmail, setDoneEmail] = useState('')

  useEffect(() => {
    document.title = `Create an admin account — ${brand.shortName}`
    applyCompanyFavicon(brand.icon)
  }, [brand.icon, brand.logo, brand.shortName])

  const notifyHref = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent('BE Inn Villa admin email')}&body=${encodeURIComponent(
    `Please approve this email for admin access: ${doneEmail || form.email}`,
  )}`

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    if (!isValidEmail(form.email)) {
      setError('Enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Use a password of at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await axios.post(`${CMS_URL}/api/staff-access`, form, { timeout: 15000 })
      setDoneEmail(form.email.trim().toLowerCase())
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Could not save this account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`${styles.wrap} ${styles.wrapTall}`}>
      <Link to="/handover" className={styles.back}>
        ← Back to the guide
      </Link>
      <form className={styles.card} onSubmit={onSubmit}>
        {brand.logo ? <img className={styles.logo} src={brand.logo} alt={brand.name} /> : null}
        <h1>{brand.shortName}</h1>
        {doneEmail ? (
          <>
            <p>
              Your account is saved for <strong>{doneEmail}</strong>. You cannot sign in yet. Send that email to Ireme
              Tech so a super admin can approve it.
            </p>
            <a className={styles.submitLink} href={notifyHref}>
              Email this address to Ireme Tech
            </a>
          </>
        ) : (
          <>
            <p>Create your admin account. It stays closed until Ireme Tech approves the email you use here.</p>
            <label>
              First name
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </label>
            <label>
              Last name
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </label>
            <label>
              Email
              <input
                type="text"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Create account'}
            </button>
          </>
        )}
      </form>
      <p className={styles.credit}>
        Developed by{' '}
        <a href="https://iremetech.com" target="_blank" rel="noopener noreferrer">
          Ireme Tech
        </a>
      </p>
    </div>
  )
}
