import { Link } from 'react-router-dom'
import { useHomePage } from '@lib/queries/useHomePage'
import Reveal from '@components/ui/Reveal'
import styles from './HomeDestination.module.css'

export default function HomeDestination() {
  const { data } = useHomePage()
  const dest = data.destination
  if (!dest) return null

  const photo = dest.images?.primary
  const secondary = dest.images?.secondary

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <Reveal>
          <span className={styles.eyebrow}>{dest.eyebrow}</span>
          <h2>{dest.headline}</h2>
          <p className={styles.body}>{dest.body}</p>
          <ul className={styles.facts}>
            {dest.facts.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </li>
            ))}
          </ul>
          {dest.cta?.path ? (
            <Link to={dest.cta.path} className={styles.link}>
              {dest.cta.label}
            </Link>
          ) : null}
        </Reveal>

        {(photo || secondary) && (
          <Reveal className={styles.collage} delay={100}>
            {photo ? <div className={styles.primary} style={{ backgroundImage: `url("${photo}")` }} /> : null}
            {secondary ? <div className={styles.secondary} style={{ backgroundImage: `url("${secondary}")` }} /> : null}
          </Reveal>
        )}
      </div>
    </section>
  )
}
