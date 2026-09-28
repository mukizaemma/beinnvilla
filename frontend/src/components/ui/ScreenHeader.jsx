import { Link } from 'react-router-dom'
import { useInView } from '@hooks/useInView'
import styles from './ScreenHeader.module.css'

export default function ScreenHeader({
  image,
  title,
  ctaTo = '/book',
  ctaLabel = 'Book your Stay',
}) {
  const [ref, shown] = useInView(0.08)

  return (
    <section
      ref={ref}
      className={`${styles.header} ${shown ? styles.shown : ''}`}
      aria-label={title || 'Page header'}
    >
      <div className={styles.media}>
        {image ? <img src={image} alt="" /> : null}
        <div className={styles.veil} aria-hidden="true" />
      </div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.copy}>
        {title ? <h1>{title}</h1> : null}
        <Link to={ctaTo} className={styles.cta}>
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
