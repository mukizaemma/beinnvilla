import { useInView } from '@hooks/useInView';
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage';
import styles from './BarRestaurantPanels.module.css';

function Panel({ panel }) {
  const [ref, inView] = useInView(0.35);

  return (
    <section
      ref={ref}
      className={styles.panel}
      style={{ backgroundImage: `url(${panel.backgroundImage})` }}
    >
      <div className={styles.tint} />
      <div className={`container ${styles.inner}`}>
        <h2 className={`${styles.title} fade-in-up ${inView ? 'is-visible' : ''}`}>
          {panel.title}
        </h2>
        <p
          className={`${styles.description} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.12s' }}
        >
          {panel.description}
        </p>
      </div>
    </section>
  );
}

export default function BarRestaurantPanels() {
  const { data } = useBarRestaurantPage();
  const { panels: barRestaurantPanels } = data;

  return (
    <div>
      {barRestaurantPanels.map((panel) => (
        <Panel key={panel.id} panel={panel} />
      ))}
    </div>
  );
}