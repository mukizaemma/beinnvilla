import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGalleryPage } from '@lib/queries/useGalleryPage';
import styles from './GalleryGrid.module.css';

const PAGE_SIZE = 12;

export default function GalleryGrid() {
  const { data } = useGalleryPage();
  const images = data.images || [];
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const pageCount = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = images.slice(start, start + PAGE_SIZE);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showNext = () => setLightboxIndex((i) => (i + 1) % visible.length);
  const showPrev = () => setLightboxIndex((i) => (i - 1 + visible.length) % visible.length);

  function goTo(next) {
    setPage(next);
    setLightboxIndex(null);
    document.getElementById('gallery-grid')?.scrollIntoView({ block: 'start' });
  }

  return (
    <section id="gallery-grid" className={styles.section}>
      <div className={styles.frame}>
        <div className={styles.grid}>
          {visible.map((img, index) => (
            <button
              key={img.id}
              type="button"
              className={styles.tile}
              onClick={() => openLightbox(index)}
              aria-label={`Open photograph ${start + index + 1}`}
            >
              <img src={img.image} alt="" />
            </button>
          ))}
        </div>
        {images.length === 0 && (
          <p className={styles.empty}>Photographs will appear here as they are added.</p>
        )}
        {pageCount > 1 && (
          <nav className={styles.pager} aria-label="Gallery pages">
            <button type="button" onClick={() => goTo(current - 1)} disabled={current === 1}>
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index + 1}
                type="button"
                aria-current={current === index + 1 ? 'page' : undefined}
                className={current === index + 1 ? styles.pageOn : undefined}
                onClick={() => goTo(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button type="button" onClick={() => goTo(current + 1)} disabled={current === pageCount}>
              Next
            </button>
          </nav>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={visible}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </section>
  );
}

function GalleryLightbox({ images, activeIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button
        type="button"
        className={styles.lightboxClose}
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X size={22} />
      </button>

      <button
        type="button"
        className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
      >
        <ChevronLeft size={22} />
      </button>

      <div className={styles.lightboxStage} onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`${styles.lightboxImage} ${
              i === activeIndex ? styles.lightboxImageActive : ''
            }`}
            style={{ backgroundImage: `url(${img.image})` }}
          />
        ))}
      </div>

      <button
        type="button"
        className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}