import { Heart, Wallet, Sparkles, Handshake, Home, Sunrise } from 'lucide-react';
import { useInView } from '@hooks/useInView';
import { useAboutPage } from '@lib/queries/useAboutPage';
import styles from './AboutValues.module.css';

const ICONS = {
  heart: Heart,
  wallet: Wallet,
  sparkles: Sparkles,
  handshake: Handshake,
  home: Home,
  sunrise: Sunrise,
};

export default function AboutValues() {
  const [sectionRef, inView] = useInView(0.15);
  const { data } = useAboutPage();
  const { values } = data;

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={`${styles.header} fade-in-up ${inView ? 'is-visible' : ''}`}>
          <span className={styles.eyebrow}>What We Believe</span>
          <h2 className={styles.headline}>The Grand Villa Way</h2>
        </div>

        <div className={styles.grid}>
          {values.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.id}
                className={`${styles.card} fade-in-up ${inView ? 'is-visible' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <Icon size={24} className={styles.icon} />
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}