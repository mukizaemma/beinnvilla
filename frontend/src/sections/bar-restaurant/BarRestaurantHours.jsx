import { Coffee, UtensilsCrossed } from 'lucide-react';
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage';
import Reveal from '@components/ui/Reveal';
import styles from './BarRestaurantHours.module.css';

const ICONS = { breakfast: Coffee, 'restaurant-bar': UtensilsCrossed };

export default function BarRestaurantHours() {
  const { data } = useBarRestaurantPage();
  const { hours: barRestaurantHours } = data;

  return (
    <div className={styles.strip}>
      <div className={`container ${styles.row}`}>
        {barRestaurantHours.map((item, index) => {
          const Icon = ICONS[item.icon];
          return (
            <Reveal key={item.id} className={styles.item} delay={index * 80}>
              <Icon size={16} />
              <span className={styles.label}>{item.label}</span>
              <span className={styles.hours}>{item.hours}</span>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}