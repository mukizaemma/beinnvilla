import styles from './HomeStats.module.css';
import { homeStats } from '@data/home/HomeStats';

// A standalone section that sits well below HomeHero — not straddling the
// hero seam. Each hexagon tile gets an image-style background (see
// placeholderImage in the data file) with a dark overlay for text legibility.
export default function HomeStats() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.tiles}`}>
        {homeStats.map((stat) => (
          <div
            key={stat.id}
            className={styles.tile}
            style={{ backgroundImage: stat.placeholderImage }}
          >
            <div className={styles.overlay} />
            <div className={styles.content}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}