import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CMS_URL } from '@lib/apiClient'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { DEVELOPER_EMAIL, HANDOVER_SECTIONS, HANDOVER_TABS } from '@features/handover/guide'
import styles from './HandoverPage.module.css'

const LESSONS = HANDOVER_TABS

function lessonIndex(id) {
  return LESSONS.findIndex((item) => item.id === id)
}

export default function HandoverPage() {
  const [tab, setTab] = useState(LESSONS[0].id)
  const [seen, setSeen] = useState(() => new Set([LESSONS[0].id]))
  const [form, setForm] = useState({ name: '', email: '', section: LESSONS[0].id, message: '' })
  const [busy, setBusy] = useState(false)
  const { data: layout } = useSiteLayout()
  const brand = brandFromCompany(layout?.company)

  const index = Math.max(0, lessonIndex(tab))
  const section = HANDOVER_SECTIONS[tab] || HANDOVER_SECTIONS.overview
  const previous = LESSONS[index - 1]
  const next = LESSONS[index + 1]
  const progress = Math.round((seen.size / LESSONS.length) * 100)

  useEffect(() => {
    document.title = `Handover — ${brand.name}`
    applyCompanyFavicon(brand.icon)
  }, [brand.icon, brand.logo, brand.name])

  function openLesson(id) {
    setTab(id)
    setSeen((current) => new Set(current).add(id))
    setForm((current) => ({ ...current, section: id }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            <small>Hotel handbook</small>
          </div>
        </Link>

        <div className={styles.progress}>
          <div>
            <span>Lesson {index + 1} of {LESSONS.length}</span>
            <strong>{progress}%</strong>
          </div>
          <div className={styles.track}>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>

        <nav aria-label="Lessons">
          {LESSONS.map((item, itemIndex) => {
            const open = item.id === tab
            const headings = HANDOVER_SECTIONS[item.id]?.blocks.map((block) => block.heading) || []
            return (
              <div key={item.id} className={open ? styles.lessonOpen : styles.lesson}>
                <button type="button" className={open ? styles.active : undefined} onClick={() => openLesson(item.id)}>
                  <span className={seen.has(item.id) && !open ? styles.done : undefined}>{itemIndex + 1}</span>
                  {item.label}
                </button>
                {open && headings.length > 0 && (
                  <div className={styles.outline}>
                    {headings.map((heading, headingIndex) => (
                      <a key={heading} href={`#part-${headingIndex}`}>
                        {heading}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
        <article className={styles.sheet}>
          <p className={styles.kicker}>Lesson {index + 1} · {section.title}</p>
          <h1>{section.title}</h1>
          <p className={styles.lead}>{section.lead}</p>

          {section.spotlight && (
            <aside className={styles.spotlight} aria-label="Hosting requirements and fee">
              <div>
                <p>{section.spotlight.label}</p>
                <ul>
                  {section.spotlight.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.fee}>
                <strong>{section.spotlight.fee}</strong>
                <span>every year</span>
                <small>{section.spotlight.feeNote}</small>
              </div>
            </aside>
          )}

          {section.blocks.length > 0 && (
            <ol className={styles.contents}>
              {section.blocks.map((block, blockIndex) => (
                <li key={block.heading}>
                  <a href={`#part-${blockIndex}`}>{block.heading}</a>
                </li>
              ))}
            </ol>
          )}

          {tab === 'account' && (
            <div className={styles.actions}>
              <Link to="/staff/join" className={styles.action}>
                Create your admin account
              </Link>
              <a href={`mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent('BE Inn Villa admin email')}`}>
                Email Ireme Tech after you register
              </a>
            </div>
          )}

          {tab === 'inbox' && (
            <div className={styles.actions}>
              <Link to="/staff/reservations" className={styles.action}>
                Open bookings
              </Link>
            </div>
          )}

          {tab === 'manual' && (
            <div className={styles.actions}>
              <Link to="/staff" className={styles.action}>
                Open the staff pages
              </Link>
              <a href={`${CMS_URL}/admin`} target="_blank" rel="noreferrer">
                Open the admin pages
              </a>
            </div>
          )}

          {section.blocks.map((block, blockIndex) => (
            <section key={block.heading} id={`part-${blockIndex}`} className={styles.card}>
              <h2>
                <span>{blockIndex + 1}</span>
                {block.heading}
              </h2>
              {block.body ? <p>{block.body}</p> : null}
              {block.steps?.length ? (
                <ol className={styles.steps}>
                  {block.steps.map((step, stepIndex) => (
                    <li key={step}>
                      <span>{stepIndex + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}

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
                  {LESSONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
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
        </article>

        <nav className={styles.pager} aria-label="Lesson pages">
          <button type="button" onClick={() => previous && openLesson(previous.id)} disabled={!previous}>
            <small>Previous</small>
            {previous ? previous.label : 'Start'}
          </button>
          <p>
            {index + 1} / {LESSONS.length}
          </p>
          <button type="button" className={styles.next} onClick={() => next && openLesson(next.id)} disabled={!next}>
            <small>{next ? 'Next' : 'Finished'}</small>
            {next ? next.label : section.title}
          </button>
        </nav>
      </main>
    </div>
  )
}
