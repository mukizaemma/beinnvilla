import { Link } from 'react-router-dom'
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'
import { RESTAURANT_FEATURE_ICONS } from '@features/hotel/restaurantSpotlight'
import Reveal from '@components/ui/Reveal'
import styles from './HomeBarRestaurant.module.css'

export default function HomeBarRestaurant() {
  const { data } = useBarRestaurantPage()
  const spotlight = data?.homeSpotlight
  if (!spotlight) return null

  const images = spotlight.images || []
  const features = spotlight.features || []

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.header}>
          {spotlight.eyebrow && <span className={styles.eyebrow}>{spotlight.eyebrow}</span>}
          <h2>{spotlight.headline}</h2>
          {spotlight.intro && <p className={styles.intro}>{spotlight.intro}</p>}
        </Reveal>

        {features.length > 0 && (
          <ul className={styles.features}>
            {features.map((item, index) => {
              const Icon = RESTAURANT_FEATURE_ICONS[item.icon] || RESTAURANT_FEATURE_ICONS.food
              return (
                <Reveal as="li" key={item.id || item.title} className={styles.feature} delay={index * 80}>
                  <span className={styles.iconWrap}>
                    <Icon size={22} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              )
            })}
          </ul>
        )}

        {images.length > 0 && (
          <div className={`${styles.gallery} ${styles[`count${Math.min(images.length, 4)}`]}`}>
            {images.slice(0, 4).map((src, index) => (
              <Reveal as="figure" key={`${src}-${index}`} className={styles.photo} delay={index * 80}>
                <img src={src} alt="" />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className={styles.actions} delay={120}>
          <Link to={spotlight.cta.path || '/bar-restaurant'} className={styles.cta}>
            {spotlight.cta.label || 'View menu'}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
