import { Link } from 'react-router-dom';
import { useInView } from '@hooks/useInView';
import { useAboutPage } from '@lib/queries/useAboutPage';
import styles from './AboutCTA.module.css';

export default function AboutCTA() {
  const [ref, inView] = useInView(0.3);
  const { data } = useAboutPage();
  const { eyebrow, headline, body, button } = data.cta;

  return (
    <section className={styles.section} ref={ref}>
      <div className={`container ${styles.inner}`}>
        {eyebrow && (
          <span className={`${styles.eyebrow} fade-in-up ${inView ? 'is-visible' : ''}`}>
            {eyebrow}
          </span>
        )}
        <h2
          className={`${styles.headline} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.06s' }}
        >
          {headline}
        </h2>
        <p
          className={`${styles.body} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.12s' }}
        >
          {body}
        </p>
        <Link
          to={button?.path || '/contact'}
          className={`${styles.ctaBtn} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.18s' }}
        >
          {button?.label || 'Book Now'}
        </Link>
      </div>
    </section>
  );
}