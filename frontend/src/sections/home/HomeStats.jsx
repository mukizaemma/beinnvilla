import { useHomePage } from '@lib/queries/useHomePage'
import styles from './HomeStats.module.css'

export default function HomeStats() {
  const { data } = useHomePage()
  const stats = data?.stats || []
  if (!stats.length) return null

  const topRow = stats.slice(0, 3)
  const bottomRow = stats.slice(3, 5)

  const renderTile = (stat) => (
    <article key={stat.id} className={styles.tile}>
      <div
        className={styles.tileBg}
        style={stat.image ? { backgroundImage: `url("${stat.image}")` } : undefined}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.edgeGlow} aria-hidden="true" />
      <div className={styles.content}>
        <span className={styles.label}>{stat.label}</span>
        <span className={styles.value}>{stat.value}</span>
      </div>
    </article>
  )

  return (
    <section className={styles.section}>
      <div className={styles.honeycomb}>
        <div className={styles.topRow}>{topRow.map(renderTile)}</div>
        {bottomRow.length > 0 && (
          <div className={styles.bottomRow}>{bottomRow.map(renderTile)}</div>
        )}
      </div>
    </section>
  )
}
