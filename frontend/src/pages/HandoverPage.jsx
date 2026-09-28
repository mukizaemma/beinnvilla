import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CMS_URL } from '@lib/apiClient'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import SiteAuditBoard from '@features/handover/SiteAuditBoard'
import { HANDOVER_SECTIONS, HANDOVER_TABS } from '@features/handover/guide'
import styles from './HandoverPage.module.css'

const SECTIONS = HANDOVER_TABS.map((tab) => tab.id)

async function readJson(path) {
  const res = await fetch(`${CMS_URL}${path}`)
  if (!res.ok) throw new Error('request failed')
  return res.json()
}

export default function HandoverPage() {
  const [tab, setTab] = useState('overview')
  const [report, setReport] = useState(null)
  const [origin, setOrigin] = useState('')
  const [form, setForm] = useState({ name: '', email: '', section: 'overview', message: '' })
  const [busy, setBusy] = useState(false)
  const { data: layout } = useSiteLayout()
  const brand = brandFromCompany(layout?.company)
  const company = layout?.company

  const section = HANDOVER_SECTIONS[tab] || HANDOVER_SECTIONS.overview
  const adminUrl = `${CMS_URL}/admin`

  useEffect(() => {
    setOrigin(window.location.origin)
    readJson('/api/site-audit/report').then(setReport).catch(() => {})
  }, [])

  useEffect(() => {
    document.title = `Handover — ${brand.name}`
    applyCompanyFavicon(brand.icon)
  }, [brand.icon, brand.logo, brand.name])

  const credentials = useMemo(
    () => [
      { label: 'Public website', value: origin || '/', href: '/' },
      { label: 'Staff desk', value: origin ? `${origin}/staff` : '/staff', href: '/staff' },
      { label: 'Admin', value: adminUrl, href: adminUrl },
      { label: 'Login email', value: company?.email || 'The email Ireme sent with your account' },
      { label: 'Password', value: 'Not shown here. Use Forgot password if you need a new one.' },
    ],
    [adminUrl, company?.email, origin],
  )

  async function sendFeedback(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const res = await fetch(`${CMS_URL}/api/handover-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('Thank you — your note was sent.')
      setForm({ name: '', email: '', section: tab, message: '' })
    } catch {
      toast.error('Could not send that note. Try again in a few minutes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          {brand.logo ? <img src={brand.logo} alt="" /> : null}
          <div>
            <strong>{brand.shortName}</strong>
            <small>Handover guide</small>
          </div>
        </Link>
        <nav>
          {HANDOVER_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? styles.active : undefined}
              onClick={() => {
                setTab(item.id)
                setForm((current) => ({ ...current, section: item.id }))
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <Link to="/" className={styles.back}>
          ← Back to website
        </Link>
        <p className={styles.credit}>
          Developed by{' '}
          <a href="https://iremetech.com" target="_blank" rel="noopener noreferrer">
            Ireme Tech
          </a>
        </p>
      </aside>

      <main className={styles.main}>
        <p className={styles.kicker}>For the Grand Villa team</p>
        <h1>{section.title}</h1>
        <p className={styles.lead}>{section.lead}</p>

        {tab === 'access' && (
          <div className={styles.creds}>
            {credentials.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                {row.href ? (
                  <a href={row.href} target={row.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {row.value}
                  </a>
                ) : (
                  <strong>{row.value}</strong>
                )}
              </div>
            ))}
          </div>
        )}

        {section.blocks.map((block) => (
          <section key={block.heading} className={styles.card}>
            <h2>{block.heading}</h2>
            <p>{block.body}</p>
          </section>
        ))}

        {tab === 'audit' && <SiteAuditBoard report={report} />}

        {tab === 'feedback' && (
          <form className={styles.form} onSubmit={sendFeedback}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              About
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                {SECTIONS.map((id) => (
                  <option key={id} value={id}>
                    {HANDOVER_TABS.find((item) => item.id === id)?.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.full}>
              What should we change or improve?
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
