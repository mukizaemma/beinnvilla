import {
  Wifi,
  ParkingCircle,
  UtensilsCrossed,
  BellRing,
  PlaneTakeoff,
  Sunset,
  Waves,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import { useInView } from '@hooks/useInView';
import { useHomePage } from '@lib/queries/useHomePage';
import styles from './HomeAmenities.module.css';

const ICONS = {
  wifi: Wifi,
  parking: ParkingCircle,
  'bar-restaurant': UtensilsCrossed,
  'front-desk': BellRing,
  transport: PlaneTakeoff,
  terrace: Sunset,
  pool: Waves,
  gym: Dumbbell,
  spa: Sparkles,
};

export default function HomeAmenities() {
  const { data } = useHomePage();
  const homeAmenities = data.amenities;
  const [sectionRef, inView] = useInView(0.15);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={`${styles.header} fade-in-up ${inView ? 'is-visible' : ''}`}>
          <span className={styles.eyebrow}>Modern &amp; Comfortable</span>
          <h2 className={styles.headline}>Facilities and amenities</h2>
        </div>

        <div className={styles.grid}>
          {homeAmenities.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.id || item.icon}
                className={`${styles.item} fade-in-up ${inView ? 'is-visible' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <Icon size={28} strokeWidth={1.5} className={styles.icon} />
                <div>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}