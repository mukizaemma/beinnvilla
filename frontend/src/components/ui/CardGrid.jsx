import { Link } from 'react-router-dom'
import { useState } from 'react'
import Reveal from './Reveal'
import styles from './CardGrid.module.css'

export default function CardGrid({
  items,
  renderCard,
  initialCount = 3,
  columns,
  moreLabel = 'View more',
  moreTo,
}) {
  const [open, setOpen] = useState(false)
  const visible = moreTo || !open ? items.slice(0, initialCount) : items
  const showMore = items.length > initialCount && (Boolean(moreTo) || !open)

  return (
    <>
      <div className={`${styles.grid} ${columns === 2 ? styles.gridTwo : ''}`}>
        {visible.map((item, index) => (
          <Reveal key={item.id || item.slug || index} delay={Math.min(index, 7) * 70}>
            {renderCard(item)}
          </Reveal>
        ))}
      </div>
      {showMore && (
        <Reveal className={styles.more} delay={120}>
          {moreTo ? (
            <Link to={moreTo} className={styles.btn}>
              {moreLabel}
            </Link>
          ) : (
            <button type="button" className={styles.btn} onClick={() => setOpen(true)}>
              {moreLabel}
            </button>
          )}
        </Reveal>
      )}
    </>
  )
}
