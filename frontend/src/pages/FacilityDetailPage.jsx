import { Link, Navigate, useParams } from 'react-router-dom'
import { useFacilities } from '@features/hotel/queries/useFacilities'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import RichText from '@components/ui/RichText'
import Reveal from '@components/ui/Reveal'
import RoomGallery from '@sections/room-detail/RoomGallery'
import HouseHold from '@sections/booking/HouseHold'
import styles from './RoomDetailPage.module.css'

export default function FacilityDetailPage() {
  const { facilityId } = useParams()
  const { data, isLoading } = useFacilities()
  if (isLoading) return <PageLoader />

  const facility = (data || []).find((item) => item.id === facilityId)
  if (!facility) return <Navigate to="/facilities" replace />
  const others = (data || []).filter((item) => item.id !== facility.id)
  const photos = facility.gallery?.length ? facility.gallery : [facility.image].filter(Boolean)

  return (
    <>
    <ScreenHeader image={facility.image || photos[0] || ''} title={facility.name} />
    <div className={styles.page}>
      <div className={`container ${styles.top}`}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/facilities">Facilities</Link>
          <span>/</span>
          <span>{facility.name}</span>
        </nav>
        <div className={styles.layout}>
          <Reveal className={styles.main}>
            {photos.length > 0 && <RoomGallery images={photos} roomName={facility.name} />}
            <p className={styles.kicker}>{facility.audience === 'exclusive' ? 'Held with a stay' : 'Open to visitors'}</p>
            <h1>{facility.name}</h1>
            <p className={styles.note}>
              {facility.audience === 'exclusive'
                ? 'Request this with your rooms. It stays with your group until checkout, then it is free for the next reservation.'
                : 'Guests can request this with a stay. Friends and visitors can use it too, when it is free.'}
            </p>
            {facility.summary && <p>{facility.summary}</p>}
            <RichText className={styles.copy} value={facility.descriptionHtml || facility.description} />
          </Reveal>
          <Reveal delay={100}>
            <HouseHold facilityId={facility.id} />
          </Reveal>
        </div>
        {others.length > 0 && (
          <section className={styles.others}>
            <div className={styles.othersHead}>
              <h2>Other facilities</h2>
              <Link to="/facilities">View all</Link>
            </div>
            <div className={styles.otherGrid}>
              {others.map((item) => (
                <Link key={item.id} to={`/facilities/${item.id}`}>
                  {item.image ? <img src={item.image} alt="" /> : <div className={styles.otherFill} />}
                  <strong>{item.name}</strong>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  )
}
