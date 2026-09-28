import { Link } from 'react-router-dom'
import { useRoomsPage } from '@lib/queries/useRoomsPage'
import { isLegacyName } from '@features/hotel/brand'
import { ROOMS } from '@features/hotel/inn'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import Reveal from '@components/ui/Reveal'
import styles from './Catalog.module.css'

function money(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return ''
  return `$${Math.round(amount)}`
}

export default function AccommodationPage() {
  const { data, isLoading, isError } = useRoomsPage()
  if (isLoading) return <PageLoader />
  if (isError) {
    return <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>Couldn&apos;t load the rooms.</div>
  }

  const rooms = data.rooms || []
  const header = data.hero?.backgroundImage || rooms.find((room) => room.image)?.image || ''

  return (
    <>
    <ScreenHeader image={header} title="Accommodation" />
    <div className={styles.page}>
      <div className="container">
        <Reveal>
          <p className={styles.kicker}>Accommodation</p>
          <h1>{ROOMS.headline}</h1>
          <p className={styles.intro}>{ROOMS.intro}</p>
        </Reveal>
        <div className={styles.grid}>
          {rooms.map((room, index) => {
            const name = isLegacyName(room.name) ? `Room ${String(index + 1).padStart(2, '0')}` : room.name
            const night = money(room.pricePerNight)
            const breakfast = money(room.priceWithBreakfast)
            return (
              <Reveal key={room.id} as="article" className={styles.roomCard} delay={index * 70}>
                <Link to={`/accommodation/${room.id}`} className={styles.roomPhoto} aria-label={`View ${name}`}>
                  {room.image ? <img src={room.image} alt="" /> : <div className={styles.fill} />}
                </Link>
                <div className={styles.roomBody}>
                  <h2>{name}</h2>
                  <p>{room.specs?.occupancy || 'A couple or a single guest'}</p>
                  {night && (
                    <p className={styles.roomPrice}>
                      <strong>{night}</strong>
                      <span> / night</span>
                    </p>
                  )}
                  {breakfast && breakfast !== night && (
                    <p className={styles.roomBreakfast}>With breakfast {breakfast}</p>
                  )}
                  <div className={styles.roomActions}>
                    <Link to={`/accommodation/${room.id}`} className={styles.details}>View details</Link>
                    <Link to="/book" className={styles.book}>Book now</Link>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
        {rooms.length === 0 && <p className={styles.intro}>Room photographs will appear here as they are added.</p>}
      </div>
    </div>
    </>
  )
}
