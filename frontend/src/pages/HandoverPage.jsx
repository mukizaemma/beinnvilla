import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import {
  AREAS,
  DEVELOPER_EMAIL,
  LIVE_URL,
  MAINTAINER,
  MAINTAINER_URL,
  MAINTENANCE_FACTS,
  PRODUCT,
  SECTIONS,
  VISITOR_ROWS,
} from '@features/handover/guide'
import styles from './HandoverPage.module.css'

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap'

function parseHash(hash) {
  const raw = String(hash || '').replace(/^#/, '')
  const [head, tail] = raw.split('/')
  const area = AREAS.find((item) => item.id === tail || item.id === head)
  if (head === 'guide') {
    return { section: 'guide', area: area?.id || AREAS[0].id }
  }
  if (SECTIONS.some((item) => item.id === head)) {
    return { section: head, area: AREAS[0].id }
  }
  if (area) return { section: 'guide', area: area.id }
  return { section: 'overview', area: AREAS[0].id }
}

function placeHash(section, area) {
  return section === 'guide' ? `#guide/${area}` : `#${section}`
}

export default function HandoverPage() {
  const { data: layout } = useSiteLayout()
  const brand = brandFromCompany(layout?.company)
  const product = brand.name || PRODUCT
  const prepared = useMemo(
    () => new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' }),
    [],
  )
  const [place, setPlace] = useState(() => parseHash(window.location.hash))

  const sequence = useMemo(
    () => [
      { section: 'overview' },
      { section: 'access' },
      ...AREAS.map((area) => ({ section: 'guide', area: area.id })),
      { section: 'visitors' },
      { section: 'maintenance' },
      { section: 'support' },
    ],
    [],
  )

  const index = Math.max(
    0,
    sequence.findIndex(
      (item) => item.section === place.section && (item.section !== 'guide' || item.area === place.area),
    ),
  )
  const currentArea = AREAS.find((item) => item.id === place.area) || AREAS[0]
  const sectionMeta = SECTIONS.find((item) => item.id === place.section) || SECTIONS[0]
  const progressName = place.section === 'guide' ? `Operator guide · ${currentArea.label}` : sectionMeta.label

  useEffect(() => {
    document.title = `Client handover & user guide — ${product}`
    applyCompanyFavicon(brand.icon)
    const previousRobots = document.querySelector('meta[name="robots"]')
    const robots = document.createElement('meta')
    robots.setAttribute('name', 'robots')
    robots.setAttribute('content', 'noindex, nofollow')
    document.head.appendChild(robots)
    const font = document.createElement('link')
    font.rel = 'stylesheet'
    font.href = FONT_HREF
    document.head.appendChild(font)
    document.body.style.background = '#eef2f6'
    return () => {
      robots.remove()
      font.remove()
      document.body.style.background = ''
      if (previousRobots) document.head.appendChild(previousRobots)
    }
  }, [brand.icon, product])

  useEffect(() => {
    function onHash() {
      setPlace(parseHash(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function openPlace(next) {
    const hash = placeHash(next.section, next.area || place.area)
    if (window.location.hash === hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.location.hash = hash
  }

  function step(delta) {
    const next = sequence[index + delta]
    if (next) openPlace(next)
  }

  useEffect(() => {
    function onKey(event) {
      if (event.altKey || event.metaKey || event.ctrlKey) return
      const target = event.target
      const typing = target instanceof HTMLElement && (
        target.isContentEditable
        || target.closest('input, textarea, select, [contenteditable="true"]')
      )
      if (typing) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const mailto = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(`${product} handover`)}`

  return (
    <div className={styles.shell}>
      <header className={styles.mast}>
        <div>
          <strong>{MAINTAINER} · Prepared for {product}</strong>
          <span>Client handover & user guide · {prepared}</span>
        </div>
        <button type="button" className={styles.download} onClick={() => window.print()}>
          Download PDF
        </button>
      </header>

      <div className={styles.column}>
        <div className={styles.screenTitle}>
          <p className={styles.kicker}>Client handover</p>
          <h1>Client handover & user guide</h1>
        </div>

        <nav className={styles.pills} aria-label="Sections">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === place.section ? styles.primary : styles.secondary}
              onClick={() => openPlace({ section: item.id, area: item.id === 'guide' ? place.area : undefined })}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.progress}>
          <div className={styles.track} aria-hidden="true">
            <i style={{ width: `${((index + 1) / sequence.length) * 100}%` }} />
          </div>
          <span>{progressName}</span>
        </div>

        <Section id="overview" active={place.section === 'overview'} product={product} title="Overview">
          <div className={styles.tiles}>
            <article className={styles.tile}>
              <span>Prepared for</span>
              <strong>{product}</strong>
            </article>
            <article className={styles.tile}>
              <span>Prepared by</span>
              <strong><a href={MAINTAINER_URL} target="_blank" rel="noreferrer">{MAINTAINER}</a></strong>
            </article>
            <article className={styles.tile}>
              <span>Live address</span>
              <strong><a href={LIVE_URL}>{LIVE_URL.replace('https://', '')}</a></strong>
            </article>
          </div>
          <p className={styles.lead}>
            This guide is for the people who will run {product} after launch. It was prepared by {MAINTAINER}.
            One section shows at a time. Use the pills under the title, or Previous and Next. The left and right
            arrow keys do the same, except while you are typing in a field.
          </p>
          <p>
            {product} is a house in Kanombe–Busanza. Guests look through the rooms, facilities, and gallery, then
            send a stay request from Book your Stay or from the form on Home. They choose WhatsApp or email. They
            pay at the hotel when they arrive. You read those requests and update the site from the staff desk.
          </p>
          <div className={styles.jumps}>
            <button type="button" className={styles.secondary} onClick={() => openPlace({ section: 'access' })}>
              Get operator access
            </button>
            <button type="button" className={styles.secondary} onClick={() => openPlace({ section: 'guide', area: AREAS[0].id })}>
              Open the operator guide
            </button>
            <button type="button" className={styles.secondary} onClick={() => openPlace({ section: 'maintenance' })}>
              Maintenance
            </button>
          </div>
        </Section>

        <Section id="access" active={place.section === 'access'} product={product} title="Access">
          <p className={styles.lead}>
            An operator signs in on the staff desk. The same email also opens the content system once the account is active.
          </p>
          <div className={styles.callout}>
            <p>
              Create account saves an Editor with Status Inactive. That person cannot sign in until a Super admin
              opens Users, presses Edit, sets Status to Active, and presses Save user.
            </p>
          </div>
          <ol className={styles.steps}>
            <li>The first Super admin is created at the content system, {`https://cms.beinnvilla.com/admin`}.</li>
            <li>Everyone after that presses Create account, enters First name, Last name, Email, and Password, then presses Create account.</li>
            <li>They email that address to {MAINTAINER}, or a Super admin sets Status to Active on Users.</li>
            <li>They open Login, enter Email and Password, and press Login. Home after sign-in is /staff. That home lists the latest reservations and does not change them.</li>
          </ol>
          <p>
            <Link to="/staff/join" className={`${styles.pill} ${styles.primary}`}>Create account</Link>
          </p>
          <p>
            Sign in at <Link to="/staff/login">/staff/login</Link>. If you forget the password, press Forgot password?
            A reset link is emailed. The new password is chosen from that link. This guide does not contain passwords.
          </p>
          <div className={styles.note}>
            <p>
              <strong>Roles.</strong> An Editor can open every staff screen except Site setting and Users.
              An Admin can open those two, and can press Add editor. Only a Super admin can press Add user and choose Admin.
              An Editor who opens Site setting sees “Only an admin can change site settings.”
            </p>
          </div>
        </Section>

        <section className={`${styles.section} ${place.section === 'guide' ? styles.onScreen : ''}`}>
          <p className={styles.runHead}>{product} · Client handover · Operator guide</p>
          <p className={styles.kicker}>Staff desk</p>
          <h2>Operator guide</h2>
          <p className={styles.lead}>
            These are the staff screens, in the same order as the menu. Previous and Next walk each one before leaving this section.
          </p>
          <nav className={styles.tabs} aria-label="Staff screens">
            {AREAS.map((area) => (
              <button
                key={area.id}
                type="button"
                className={area.id === place.area ? styles.primary : styles.secondary}
                onClick={() => openPlace({ section: 'guide', area: area.id })}
              >
                {area.label}
              </button>
            ))}
          </nav>
          {AREAS.map((area) => (
            <article
              key={area.id}
              className={`${styles.area} ${place.section === 'guide' && area.id === place.area ? styles.onScreen : ''}`}
            >
              <p className={styles.runHead}>{product} · Client handover · {area.label}</p>
              <h2>{area.label}</h2>
              <p className={styles.meta}>
                {area.menu}
                {' · '}
                <Link to={area.path}>{area.path}</Link>
                {area.limited ? ` · ${area.limited}` : ''}
              </p>
              <p>{area.summary}</p>
              <div className={styles.crud}>
                <Action title="Create" on={area.available.create} text={area.actions.create} />
                <Action title="Read" on={area.available.read} text={area.actions.read} />
                <Action title="Update" on={area.available.update} text={area.actions.update} />
                <Action title="Delete" on={area.available.delete} text={area.actions.delete} />
              </div>
              <ol className={styles.steps}>
                {area.steps.map((stepText) => (
                  <li key={stepText}>{stepText}</li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <Section id="visitors" active={place.section === 'visitors'} product={product} title="What visitors see">
          <p className={styles.lead}>
            Guests do not sign in. The public menu is Home, Accommodation, Facilities, Gallery, Visit, and Book your Stay.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Screen</th>
                  <th>Address</th>
                  <th>Edited from</th>
                </tr>
              </thead>
              <tbody>
                {VISITOR_ROWS.map((row) => (
                  <tr key={row.path + row.screen}>
                    <td>{row.screen}</td>
                    <td>{row.path}</td>
                    <td>{row.edited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.kicker} style={{ marginTop: '22px' }}>Stay request</p>
          <ol className={styles.steps}>
            <li>The guest opens Book your Stay, or the form on Home.</li>
            <li>They choose arrival, departure, and how many people are coming. A crossed date is fully booked. They can add a facility.</li>
            <li>They enter their name, mobile number, and email, then choose WhatsApp or email.</li>
            <li>The request is saved. The guest and the desk each receive an email. The desk copy goes to the Email in Site setting and to {DEVELOPER_EMAIL}.</li>
            <li>If they choose WhatsApp, their phone opens a message to the WhatsApp number in Site setting.</li>
            <li>The guest pays at the hotel. You open Bookings to set Pending, Confirmed, or Cancelled.</li>
          </ol>
          <div className={styles.note}>
            <p>
              <strong>Booking policy.</strong> The header image is changed from Pages → Booking policy.
              The paragraphs on that page are part of the page. /about opens Visit, and /things-to-do opens Facilities.
            </p>
          </div>
        </Section>

        <Section id="maintenance" active={place.section === 'maintenance'} product={product} title="Maintenance">
          <p className={styles.lead}>
            These are the services already recorded for {product}. Passwords, keys, and server sign-in details are not written here.
          </p>
          <div className={styles.facts}>
            {MAINTENANCE_FACTS.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>
          <div className={styles.callout}>
            <p>
              You can change the property email, phone, and WhatsApp yourself from Site setting, if your role is Admin
              or Super admin. You can change rooms, facilities, pages, photos, bookings, and closed dates from the staff desk.
            </p>
          </div>
          <div className={styles.note}>
            <p>
              <strong>Ask {MAINTAINER}.</strong> Ask for a change to the domain, the content-system address, email delivery, or the database.
              The database sign-in and the email service key are shared only when you want to manage that access directly.
            </p>
          </div>
        </Section>

        <Section id="support" active={place.section === 'support'} product={product} title="Support">
          <p className={styles.lead}>
            Write to {MAINTAINER} at {DEVELOPER_EMAIL}. That is the same address used when you ask for an account to be approved.
          </p>
          <ol className={styles.steps}>
            <li>For a walkthrough, email {MAINTAINER} and name the staff screen you want to go through.</li>
            <li>For another operator, ask them to press Create account, then ask a Super admin to set Status to Active. An Admin can press Add editor on Users.</li>
            <li>When something will not save, or a change does not appear, include the menu name, the button you pressed, and the message on the screen. Add the public address you checked. Do not include a password.</li>
          </ol>
          <p>
            <a className={`${styles.pill} ${styles.primary}`} href={mailto}>Email {MAINTAINER}</a>
          </p>
          <div className={styles.callout}>
            <p>
              Questions about the domain, the website host, or email delivery go to {MAINTAINER} at {DEVELOPER_EMAIL}.
            </p>
          </div>
          <div className={styles.note}>
            <p>
              <strong>This page.</strong> The guide is at /handover. It is not in the public menu. Search engines are not asked to list it, and crawlers are told not to fetch it.
            </p>
          </div>
        </Section>
      </div>

      <nav className={styles.pager} aria-label="Section pager">
        <button type="button" onClick={() => step(-1)} disabled={index === 0}>
          Previous
        </button>
        <button type="button" className={styles.primary} onClick={() => step(1)} disabled={index === sequence.length - 1}>
          Next
        </button>
      </nav>
    </div>
  )
}

function Section({ id, active, product, title, children }) {
  return (
    <section className={`${styles.section} ${active ? styles.onScreen : ''}`} id={id}>
      <p className={styles.runHead}>{product} · Client handover · {title}</p>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Action({ title, on, text }) {
  return (
    <article className={styles.card}>
      <header>
        <h3>{title}</h3>
        <span className={`${styles.badge} ${on ? styles.on : styles.off}`}>
          {on ? 'Available' : 'Not on this screen'}
        </span>
      </header>
      <p>{text}</p>
    </article>
  )
}
