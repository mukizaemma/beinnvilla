import { Link } from 'react-router-dom';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { useInView } from '@hooks/useInView';
import { useHomePage } from '@lib/queries/useHomePage';
import { useSiteLayout } from '@lib/queries/useSiteLayout';
import styles from './HomeCTA.module.css';

// NOTE: parallax here is done with plain CSS `background-attachment: fixed`
// on .section (see HomeCTA.module.css) rather than a JS-driven transform
// layer. The previous version paired a scroll-transformed background layer
// with a backdrop-filter glass card and hit a real Chromium GPU compositing
// bug (transform + backdrop-filter siblings occasionally render corrupted
// frames). This version has no transformed layer at all, and the "glass"
// card is a gradient/border effect rather than an actual backdrop-filter
// blur — same premium look, no shared failure mode.
export default function HomeCTA() {
  const { data } = useHomePage();
  const { data: layout } = useSiteLayout();
  const [sectionRef, inView] = useInView(0.25);
  const { eyebrow, headline, body, cta, backgroundImage } = data.cta;
  const { address, distanceFromKigali, mapUrl } = layout.company;

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.tint} />

      <div className={`container ${styles.inner}`}>
        <div className={`${styles.card} fade-in-up ${inView ? 'is-visible' : ''}`}>
          <div className={styles.cardSheen} aria-hidden="true" />

          <div className={styles.cardContent}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 className={styles.headline}>{headline}</h2>
            <p className={styles.body}>{body}</p>

            {cta?.path ? (
              <Link to={cta.path} className={styles.ctaBtn}>
                {cta.label || 'Book the apartment'}
              </Link>
            ) : null}

            <div className={styles.divider} />

            <div className={styles.locationRow}>
              <div className={styles.locationItem}>
                <MapPin size={16} className={styles.locationIcon} />
                <span>{address || 'Karongi, Western Province, Rwanda'}</span>
              </div>
              <div className={styles.locationItem}>
                <Clock size={16} className={styles.locationIcon} />
                <span>{distanceFromKigali || 'About 3 hours from Kigali'}</span>
              </div>
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsLink}
                >
                  <Navigation size={15} />
                  Get Directions
                </a>
              ) : (
                <Link to="/contact" className={styles.directionsLink}>
                  <Navigation size={15} />
                  Get Directions
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}