import { Link } from 'react-router-dom'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { brandFromCompany } from '@features/hotel/companyBrand'
import { publicPlace } from '@features/hotel/brand'
import { INN, VISIT } from '@features/hotel/inn'
import { normalizeOtas, visibleOtas } from '@features/hotel/socials'
import { usePageHeader } from '@features/hotel/queries/usePageHeader'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import Reveal from '@components/ui/Reveal'
import styles from './Catalog.module.css'

export default function VisitPage() {
  const { data, isLoading } = useSiteLayout()
  const headerQuery = usePageHeader('contact-page')
  if (isLoading) return <PageLoader />
  const company = data?.company
  const brand = brandFromCompany(company)
  const address = publicPlace(company?.address, VISIT.headline)
  const mapUrl = company?.mapUrl && !/karongi|kivu/i.test(company.mapUrl) ? company.mapUrl : VISIT.mapUrl
  const otas = visibleOtas(normalizeOtas(company?.otas))

  return (
    <>
    <ScreenHeader image={headerQuery.data || ''} title="Visit" />
    <div className={styles.page}>
      <div className="container">
        <Reveal>
          <p className={styles.kicker}>Visit</p>
          <h1>{brand.name}</h1>
          <p className={styles.intro}>{VISIT.body}</p>
        </Reveal>
        <div className={styles.visit}>
          <Reveal>
            <p>{address}</p>
            <Link className={styles.button} to="/book">
              Book your Stay
            </Link>
            <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">
              Directions
            </a>
          </Reveal>
          <Reveal delay={80}>
            <dl>
              {company?.phone ? (
                <>
                  <dt>Phone</dt>
                  <dd><a href={`tel:${company.phone}`}>{company.phone}</a></dd>
                </>
              ) : null}
              {company?.email ? (
                <>
                  <dt>Email</dt>
                  <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
                </>
              ) : null}
              <dt>Guests</dt>
              <dd>20 couples or 20 singles</dd>
              <dt>Events</dt>
              <dd>Up to {INN.eventGuests} guests</dd>
              {otas.length > 0 && (
                <>
                  <dt>Book on</dt>
                  <dd className={styles.otas}>
                    {otas.map(({ name, label, href }) => (
                      <a key={name} href={href} target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </Reveal>
        </div>
      </div>
    </div>
    </>
  )
}
