import { Link } from 'react-router-dom'
import styles from './RoomCard.module.css'

export default function RoomCard({ room, variant = 'default' }) {
  const spec = [room.specs?.bed, room.specs?.occupancy].filter(Boolean).join(' · ')

  return (
    <article className={`${styles.card} ${variant === 'showcase' ? styles.showcase : ''}`}>
      <div className={styles.imageWrap}>
        <div className={styles.image} style={{ backgroundImage: room.image ? `url("${room.image}")` : undefined }} />
      </div>
      <div className={styles.body}>
        <h3>{room.name}</h3>
        <p className={styles.price}>
          From <strong>${room.pricePerNight}</strong> / night
        </p>
        <p className={styles.note}>{spec || room.specs?.breakfast || 'Come back to the apartment after the lake'}</p>
        <Link to={`/accommodation/${room.id}`} className={styles.btn}>
          View stay
        </Link>
      </div>
    </article>
  )
}
