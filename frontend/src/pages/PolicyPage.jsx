import { Link } from 'react-router-dom'
import Reveal from '@components/ui/Reveal'
import { usePageHeader } from '@features/hotel/queries/usePageHeader'
import ScreenHeader from '@components/ui/ScreenHeader'
import { POLICY_LEDE } from '@features/hotel/inn'
import styles from './PolicyPage.module.css'

export default function PolicyPage() {
  const header = usePageHeader('policy-page')

  return (
    <>
    <ScreenHeader image={header.data || ''} title="Booking policy" />
    <section className={styles.section}>
      <div className="container">
        <Reveal>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span aria-current="page">Booking policy</span>
        </nav>
        <p className={styles.kicker}>Kanombe–Busanza</p>
        <h1 className={styles.headline}>Booking policy</h1>
        <p className={styles.lede}>{POLICY_LEDE}</p>
        <div className={styles.body}>
          <h2>Requests, not instant confirmation</h2>
          <p>
            Submitting a booking asks us to hold the dates you selected. Pay-on-arrival and Western
            Union requests stay pending until our team confirms availability and payment.
          </p>
          <h2>Payment</h2>
          <p>
            Card payments are processed by Stripe. Mobile Money is processed by MTN. Western Union
            transfers must include your booking reference. Rates shown on the website are in USD
            unless we tell you otherwise.
          </p>
          <h2>Your details</h2>
          <p>
            We use your name, phone, and email only to confirm the stay and contact you about it.
            We do not sell guest information.
          </p>
          <h2>Changes and cancellations</h2>
          <p>
            Contact us by phone, WhatsApp, or email as soon as you need to change dates. We will
            confirm what we can do based on occupancy.
          </p>
        </div>
        </Reveal>
      </div>
    </section>
    </>
  )
}
