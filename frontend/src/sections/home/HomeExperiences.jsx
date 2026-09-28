import { Link } from 'react-router-dom'
import { useExperiences } from '@lib/queries/useExperiences'
import { useHomePage } from '@lib/queries/useHomePage'
import { FALLBACK_EXPERIENCES } from '@features/hotel/lakeStay'
import Reveal from '@components/ui/Reveal'
import styles from './HomeExperiences.module.css'

const LAKE_DAY = /boat|kayak|hik|trail|lake|canoe|fish|island|congo nile|paddle/i

function lakeActivities(rows) {
  return (rows || []).filter(
    (item) => item.name && (LAKE_DAY.test(item.name) || LAKE_DAY.test(item.description || '')),
  )
}

export default function HomeExperiences() {
  const home = useHomePage()
  const experiences = useExperiences()
  const section = home.data?.experiencesSection || {}
  const fromCms = lakeActivities(experiences.data)
  const items = (fromCms.length ? fromCms : FALLBACK_EXPERIENCES).slice(0, 3).map((item, index) => ({
    ...item,
    accent: item.accent || FALLBACK_EXPERIENCES[index % FALLBACK_EXPERIENCES.length].accent,
  }))
  if (!items.length) return null

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.header}>
          {section.eyebrow ? <span className={styles.eyebrow}>{section.eyebrow}</span> : null}
          <h2>{section.headline}</h2>
          {section.intro ? <p className={styles.intro}>{section.intro}</p> : null}
        </Reveal>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <Reveal key={item.id || item.name} as="article" className={styles.card} delay={index * 80}>
              <div
                className={styles.visual}
                style={{
                  backgroundImage: item.image ? `url("${item.image}")` : item.accent,
                }}
              />
              <div className={styles.body}>
                <h3>{item.name}</h3>
                {item.description ? <p>{item.description}</p> : null}
                {item.price ? <strong>From ${item.price}</strong> : <strong>Ask the desk to arrange</strong>}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.more} delay={120}>
          <Link to="/things-to-do" className={styles.btn}>
            All lake days
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
