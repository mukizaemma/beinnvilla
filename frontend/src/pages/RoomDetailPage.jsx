import { useParams, Navigate, Link } from 'react-router-dom'
import {
  Ruler,
  BedDouble,
  Users,
  Mountain,
  Tv,
  Wifi,
  Snowflake,
  Lock,
  AlarmClock,
  Phone,
  Bath,
  Sofa,
  Refrigerator,
  Cigarette,
  Coffee,
  UtensilsCrossed,
  Droplets,
  Wine,
  Ship,
  Armchair,
  Building2,
} from 'lucide-react'
import { useRoomsPage } from '@lib/queries/useRoomsPage'
import { isLegacyName } from '@features/hotel/brand'
import { featureLabel } from '@features/hotel/rooms/featureLibrary'
import { APARTMENT } from '@features/hotel/lakeStay'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import RichText from '@components/ui/RichText'
import RoomGallery from '@sections/room-detail/RoomGallery'
import HouseHold from '@sections/booking/HouseHold'
import Reveal from '@components/ui/Reveal'
import styles from './RoomDetailPage.module.css'

const SPEC_META = [
  { key: 'size', Icon: Ruler },
  { key: 'bedrooms', Icon: BedDouble },
  { key: 'bed', Icon: BedDouble },
  { key: 'occupancy', Icon: Users },
  { key: 'view', Icon: Mountain },
  { key: 'breakfast', Icon: Coffee },
  { key: 'smoking', Icon: Cigarette },
]

const FEATURE_ICONS = {
  tv: Tv,
  wifi: Wifi,
  ac: Snowflake,
  safe: Lock,
  alarm: AlarmClock,
  phone: Phone,
  bath: Bath,
  sofa: Sofa,
  fridge: Refrigerator,
  kitchen: UtensilsCrossed,
  'hot-water': Droplets,
  'private-bar': Wine,
  boat: Ship,
  jacuzzi: Bath,
  'sauna-chair': Armchair,
  'city-view': Building2,
}

function specLabel(key, value) {
  if (key === 'occupancy' && /^\d+$/.test(String(value).trim())) {
    const count = Number(value)
    return `${count} guest${count === 1 ? '' : 's'}`
  }
  if (key === 'bedrooms' && Number(value) > 0) {
    const count = Number(value)
    return `${count} bedroom${count === 1 ? '' : 's'}`
  }
  return value
}

export default function RoomDetailPage() {
  const { roomId } = useParams()
  const { data, isLoading, isError } = useRoomsPage()

  if (isLoading) return <PageLoader />
  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  const room = data.rooms.find((item) => item.id === roomId) || data.rooms[0]
  if (!room) return <Navigate to="/accommodation" replace />
  const others = data.rooms.filter((item) => item.id !== room.id).slice(0, 3)

  const specs = SPEC_META.map((item) => ({ ...item, value: room.specs?.[item.key] })).filter((item) => item.value)
  const features = room.features || []
  const night = room.pricePerNight || APARTMENT.priceSelfCatering
  const breakfast = room.priceWithBreakfast || APARTMENT.priceWithBreakfast
  const monthly = room.monthlyRate || APARTMENT.monthlyRate

  return (
    <>
    <ScreenHeader image={room.image || room.gallery?.[0] || ''} title={isLegacyName(room.name) ? 'Room' : room.name} />
    <div className={styles.page}>
      <div className={`container ${styles.top}`}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/accommodation">Accommodation</Link>
          <span>/</span>
          <span>{room.name}</span>
        </nav>

        <div className={styles.layout}>
          <Reveal className={styles.main}>
            <RoomGallery
              key={room.id}
              images={room.gallery?.length ? room.gallery : [room.image].filter(Boolean)}
              roomName={room.name}
            />

            <p className={styles.kicker}>BE Inn Villa</p>
            <h1>{room.name}</h1>
            <p className={styles.price}>
              <strong>${night}</strong> / night without breakfast
            </p>
            <p className={styles.note}>
              ${breakfast} / night with breakfast · ${Number(monthly).toLocaleString('en-US')} / month
            </p>

            {specs.length > 0 && (
              <ul className={styles.specs}>
                {specs.map(({ key, Icon, value }) => (
                  <li key={key}>
                    <Icon size={16} />
                    <span>{specLabel(key, value)}</span>
                  </li>
                ))}
              </ul>
            )}

            <RichText className={styles.copy} value={room.descriptionHtml || room.description} />

            {features.length > 0 && (
              <>
                <h2>Amenities</h2>
                <ul className={styles.features}>
                  {features.map((id) => {
                    const Icon = FEATURE_ICONS[id]
                    return (
                      <li key={id}>
                        {Icon ? <Icon size={16} /> : null}
                        <span>{featureLabel(id)}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </Reveal>

          <Reveal delay={100}>
            <HouseHold />
          </Reveal>
        </div>
        {others.length > 0 && (
          <section className={styles.others}>
            <div className={styles.othersHead}>
              <p className={styles.kicker}>Keep exploring</p>
              <h2>Other rooms</h2>
              <Link to="/accommodation">View all</Link>
            </div>
            <div className={styles.otherGrid}>
              {others.map((item) => (
                <Link key={item.id} to={`/accommodation/${item.id}`}>
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
