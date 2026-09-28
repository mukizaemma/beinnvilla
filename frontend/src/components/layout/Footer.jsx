import { Link } from 'react-router-dom'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { PUBLIC_NAV, publicPlace } from '@features/hotel/brand'
import { INN, VISIT } from '@features/hotel/inn'
import { brandFromCompany } from '@features/hotel/companyBrand'
import { normalizeSocials, visibleSocials } from '@features/hotel/socials'
import { SOCIAL_ICONS } from '@features/hotel/socialIcons'
import styles from './Footer.module.css'

export default function Footer() {
  const { data } = useSiteLayout()
  const company = data?.company || {}
  const brand = brandFromCompany(company)
  const socials = visibleSocials(normalizeSocials(company.socials))
  const address = publicPlace(company.address, VISIT.headline)
  const mapUrl = company.mapUrl && !/karongi|kivu/i.test(company.mapUrl) ? company.mapUrl : VISIT.mapUrl
  const phone = company.phone
  const email = company.email

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img className={styles.seal} src={brand.seal} alt="" />
          <p className={styles.kicker}>Visit</p>
          <h2>{brand.name}</h2>
          <p className={styles.intro}>{VISIT.body}</p>
          <p className={styles.address}>{address}</p>
          {socials.length > 0 && (
            <div className={styles.socials}>
              {socials.map(({ name, label, href }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  {SOCIAL_ICONS[name]}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={styles.details}>
          <ul className={styles.facts}>
            <li>
              <strong>20</strong>
              <span>couples</span>
            </li>
            <li>
              <strong>20</strong>
              <span>singles</span>
            </li>
            <li>
              <strong>{INN.eventGuests}</strong>
              <span>event guests</span>
            </li>
          </ul>

          <div className={styles.contact}>
            {phone ? <a href={`tel:${phone}`}>{phone}</a> : null}
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
            <a href={mapUrl} target="_blank" rel="noreferrer">
              Directions
            </a>
          </div>

          <nav className={styles.nav} aria-label="Footer">
            {PUBLIC_NAV.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.label}
              </Link>
            ))}
          </nav>
          <Link to="/book" className={styles.book}>
            Book your Stay
          </Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} {brand.name}. All Rights Reserved.</p>
        <p>
          Developed by{' '}
          <a href="https://iremetech.com" target="_blank" rel="noreferrer">
            Ireme Tech
          </a>
        </p>
      </div>
    </footer>
  )
}
