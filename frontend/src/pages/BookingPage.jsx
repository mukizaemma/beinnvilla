import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePageHeader } from '@features/hotel/queries/usePageHeader'
import ScreenHeader from '@components/ui/ScreenHeader'
import HouseStayForm from '@sections/booking/HouseStayForm'
import styles from './BookingPage.module.css'

export default function BookingPage() {
  const header = usePageHeader('booking-page')

  return (
    <>
    <ScreenHeader image={header.data || ''} title="Book your Stay" ctaTo="#stay-form" />
    <section id="stay-form" className={styles.section}>
      <div className="container">
        <header className={styles.mast}>
          <p>Kanombe–Busanza</p>
          <h1>Book your Stay</h1>
        </header>
        <Link to="/" className={styles.backHome}>
          <ArrowLeft size={14} />
          Back to the house
        </Link>
        <HouseStayForm />
      </div>
    </section>
    </>
  )
}
