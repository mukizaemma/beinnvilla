import { Link } from 'react-router-dom'
import { useInView } from '@hooks/useInView'
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'
import styles from './BarRestaurantCTA.module.css'

export default function BarRestaurantCTA() {
  const [ref, inView] = useInView(0.3)
  const { data } = useBarRestaurantPage()
  const cta = data.cta

  return (
    <section className={styles.section} ref={ref}>
      <div className={`container ${styles.inner}`}>
        <h2 className={`${styles.headline} fade-in-up ${inView ? 'is-visible' : ''}`}>
          {cta.headline}
        </h2>
        <p className={`${styles.body} fade-in-up ${inView ? 'is-visible' : ''}`} style={{ animationDelay: '0.1s' }}>
          {cta.body}
        </p>
        <Link
          to={cta.buttonPath}
          className={`${styles.ctaBtn} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          {cta.buttonLabel}
        </Link>
      </div>
    </section>
  )
}
