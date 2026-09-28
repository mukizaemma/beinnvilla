import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import styles from './PageHero.module.css'

export default function PageHero({
  image,
  eyebrow,
  title,
  text,
  primaryTo = '/book',
  primaryLabel = 'Book Now',
  secondaryTo,
  secondaryLabel,
}) {
  return (
    <section
      className={styles.hero}
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
    >
      <div className={styles.tint} />
      <div className={`container ${styles.inner}`}>
        <Reveal>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        {text && <p className={styles.text}>{text}</p>}
        <div className={styles.actions}>
          <Link to={primaryTo} className={styles.primary}>
            {primaryLabel}
          </Link>
          {secondaryTo && (
            <Link to={secondaryTo} className={styles.secondary}>
              {secondaryLabel}
            </Link>
          )}
        </div>
        </Reveal>
      </div>
    </section>
  )
}
