import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { useInView } from '@hooks/useInView';
import styles from './VideoShowcase.module.css';

/**
 * Generic full-bleed video-showcase section — reused by HomeVideoShowcase
 * and BarRestaurantVideo (and any future page that wants one). Pass a
 * `data` object shaped { eyebrow, headline, backgroundImage, videoUrl }.
 * If videoUrl is empty, the modal shows a graceful "coming soon" state
 * instead of trying to play a broken video.
 */
export default function VideoShowcase({ data }) {
  const [sectionRef, inView] = useInView(0.3);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ backgroundImage: `url("${data.backgroundImage}")` }}
    >
      <div className={styles.overlay} />

      <div className={`container ${styles.inner}`}>
        <span className={`${styles.eyebrow} fade-in-up ${inView ? 'is-visible' : ''}`}>
          {data.eyebrow}
        </span>
        <h2
          className={`${styles.headline} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.1s' }}
        >
          {data.headline}
        </h2>

        <button
          type="button"
          className={`${styles.playBtn} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.2s' }}
          onClick={() => setModalOpen(true)}
          aria-label="Play video"
        >
          <span className={styles.playRing} />
          <span className={styles.playRing} />
          <Play size={22} fill="currentColor" strokeWidth={0} className={styles.playIcon} />
        </button>
      </div>

      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video"
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setModalOpen(false)}
              aria-label="Close video"
            >
              <X size={22} />
            </button>

            {data.videoUrl ? (
              <video src={data.videoUrl} controls autoPlay className={styles.video} />
            ) : (
              <div className={styles.comingSoon}>
                <Play size={28} className={styles.comingSoonIcon} />
                <p className={styles.comingSoonText}>
                  This video is on its way — check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}