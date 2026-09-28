import { useRoomsPage } from '@lib/queries/useRoomsPage'
import { ROOMS } from '@features/hotel/inn'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import Reveal from '@components/ui/Reveal'
import RoomOffer from '@components/hotel/RoomOffer'
import styles from './Catalog.module.css'

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
          {rooms.map((room, index) => (
            <Reveal key={room.id} delay={index * 70}>
              <RoomOffer room={room} index={index} />
            </Reveal>
          ))}
        </div>
        {rooms.length === 0 && <p className={styles.intro}>Room photographs will appear here as they are added.</p>}
      </div>
    </div>
    </>
  )
}
