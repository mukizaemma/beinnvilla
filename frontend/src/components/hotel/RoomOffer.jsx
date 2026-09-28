import { Link } from 'react-router-dom'
import { isLegacyName } from '@features/hotel/brand'
import styles from './RoomOffer.module.css'

function money(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return ''
  return `$${Math.round(amount)}`
}

export default function RoomOffer({ room, index = 0 }) {
  const name = isLegacyName(room.name) ? `Room ${String(index + 1).padStart(2, '0')}` : room.name
  const night = money(room.pricePerNight)

  return (
    <article className={styles.card}>
      <Link to={`/accommodation/${room.id}`} className={styles.photo} aria-label={`View ${name}`}>
        {room.image ? <img src={room.image} alt="" /> : <div className={styles.fill} />}
      </Link>
      <div className={styles.body}>
        <h2>{name}</h2>
        {night && (
          <p className={styles.price}>
            <strong>{night}</strong>
            <span> / night</span>
          </p>
        )}
        <div className={styles.actions}>
          <Link to={`/accommodation/${room.id}`} className={styles.details}>View details</Link>
          <Link to="/book" className={styles.book}>Book now</Link>
        </div>
      </div>
    </article>
  )
}
