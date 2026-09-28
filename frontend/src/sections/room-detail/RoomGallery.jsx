import { useState } from 'react'
import styles from './RoomGallery.module.css'

export default function RoomGallery({ images, roomName }) {
  const [active, setActive] = useState(0)
  const photos = images.filter(Boolean)

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        {photos.map((image, i) => (
          <div
            key={image}
            className={`${styles.stageImage} ${i === active ? styles.stageImageActive : ''}`}
            style={{ backgroundImage: `url("${image}")` }}
            aria-hidden={i !== active}
          />
        ))}
        {photos.length > 1 && (
          <span className={styles.count}>
            {active + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className={styles.thumbs}>
          {photos.map((image, i) => (
            <button
              key={image}
              type="button"
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              style={{ backgroundImage: `url("${image}")` }}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${roomName}`}
              aria-current={i === active}
            />
          ))}
        </div>
      )}
    </div>
  )
}
