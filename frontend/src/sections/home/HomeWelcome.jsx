import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { useInView } from '@hooks/useInView';
import { useCountUp } from '@hooks/useCountUp';
import { useHomePage } from '@lib/queries/useHomePage';
import styles from './HomeWelcome.module.css';

function ReviewBadge({ badge, inView, delay }) {
  // Animate score*10 as an integer, then divide back down — gives a
  // smooth count-up to a one-decimal score (e.g. "4.7") instead of
  // jumping in whole-number steps.
  const animatedTenths = useCountUp(Math.round(badge.score * 10), 1400, inView);
  const displayScore = (animatedTenths / 10).toFixed(1);

  return (
    <div
      className={`${styles.badge} fade-in-up ${inView ? 'is-visible' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className={styles.badgeIcon}>
        <Star size={14} fill="currentColor" strokeWidth={0} />
      </span>
      <div className={styles.badgeText}>
        <span className={styles.badgeScore}>
          {displayScore}
          <span className={styles.badgeScoreOutOf}>/5</span>
        </span>
        <span className={styles.badgeTier}>{badge.tier}</span>
        <span className={styles.badgeSource}>{badge.source}</span>
      </div>
    </div>
  );
}

export default function HomeWelcome() {
  const { data } = useHomePage();
  const homeWelcome = data.welcome;
  const { reviewBadges } = homeWelcome;
  const [sectionRef, inView] = useInView(0.2);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.collage}>
            <div
              className={`${styles.imagePrimary} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ backgroundImage: `url("${homeWelcome.images.primary}")` }}
            />
            <div
              className={`${styles.imageSecondary} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ animationDelay: '0.15s' }}
            >
              <div
                className={styles.imageSecondaryInner}
                style={{ backgroundImage: `url("${homeWelcome.images.secondary}")` }}
              />
            </div>
          </div>

          <div className={styles.copy}>
            <span
              className={`${styles.eyebrow} fade-in-up ${inView ? 'is-visible' : ''}`}
            >
              {homeWelcome.eyebrow}
            </span>
            <h2
              className={`${styles.headline} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              {homeWelcome.headline}
            </h2>
            <p
              className={`${styles.body} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              {homeWelcome.body}
            </p>
            <Link
              to={homeWelcome.cta.path}
              className={`${styles.ctaLink} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ animationDelay: '0.3s' }}
            >
              {homeWelcome.cta.label}
              <span className={styles.ctaArrow}>
                <ArrowRight size={16} />
              </span>
            </Link>

            <div className={styles.badges}>
              {reviewBadges.map((badge, index) => (
                <ReviewBadge
                  key={badge.id}
                  badge={badge}
                  inView={inView}
                  delay={0.4 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}