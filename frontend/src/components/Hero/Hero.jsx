import { useRef, useState, useCallback, useEffect } from 'react';
import styles from './Hero.module.css';
import { heroSlides } from '../../data/heroSlides';

const AUTO_ROTATE_MS = 4800;
const TRANSITION_MS = 900;
const WAVE_AMPLITUDE = 20;
const WAVE_FREQUENCY = 0.02;
const FOAM_WIDTH = 30;
const SAMPLE_STEPS = 9;

// Computes the x position of the wavy edge at a given vertical position and
// transition progress (0 = fully hidden, 1 = fully revealed).
function edgeX(y, progress, width) {
  const base = width * (1 - progress);
  return base + WAVE_AMPLITUDE * Math.sin(y * WAVE_FREQUENCY + progress * 7);
}

function buildRevealClipPath(progress, width, height) {
  const points = ['100% 0%'];
  for (let i = 0; i <= SAMPLE_STEPS; i += 1) {
    const y = (height * i) / SAMPLE_STEPS;
    const x = Math.max(0, Math.min(width, edgeX(y, progress, width)));
    points.push(`${((x / width) * 100).toFixed(2)}% ${((y / height) * 100).toFixed(2)}%`);
  }
  points.push('100% 100%');
  return `polygon(${points.join(',')})`;
}

function buildFoamClipPath(progress, width, height) {
  const points = [];
  for (let i = 0; i <= SAMPLE_STEPS; i += 1) {
    const y = (height * i) / SAMPLE_STEPS;
    const x = Math.max(0, Math.min(width, edgeX(y, progress, width)));
    points.push(`${((x / width) * 100).toFixed(2)}% ${((y / height) * 100).toFixed(2)}%`);
  }
  for (let i = SAMPLE_STEPS; i >= 0; i -= 1) {
    const y = (height * i) / SAMPLE_STEPS;
    const x = Math.max(0, Math.min(width, edgeX(y, progress, width) + FOAM_WIDTH));
    points.push(`${((x / width) * 100).toFixed(2)}% ${((y / height) * 100).toFixed(2)}%`);
  }
  return `polygon(${points.join(',')})`;
}

const KEN_BURNS_VARIANTS = ['kenBurns0', 'kenBurns1', 'kenBurns2'];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const viewportRef = useRef(null);
  const slideRefs = useRef([]);
  const foamRef = useRef(null);
  const busyRef = useRef(false);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const isFirstRender = useRef(true);
  const currentRef = useRef(0);

  const goTo = useCallback((nextIndex) => {
    const fromIndex = currentRef.current;
    if (busyRef.current || nextIndex === fromIndex) return;
    busyRef.current = true;
    setActiveSlide(nextIndex);

    const outgoing = slideRefs.current[fromIndex];
    const incoming = slideRefs.current[nextIndex];
    const foam = foamRef.current;
    const rect = viewportRef.current.getBoundingClientRect();
    const { width, height } = rect;

    outgoing.style.zIndex = '2';
    outgoing.style.opacity = '1';
    outgoing.style.clipPath = 'none';
    incoming.style.zIndex = '3';
    incoming.style.opacity = '1';
    incoming.style.clipPath = buildRevealClipPath(0, width, height);
    foam.style.opacity = '1';
    foam.style.clipPath = buildFoamClipPath(0, width, height);

    let start = null;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / TRANSITION_MS);
      const eased = 1 - (1 - progress) ** 3;

      incoming.style.clipPath = buildRevealClipPath(eased, width, height);
      foam.style.clipPath = buildFoamClipPath(eased, width, height);
      foam.style.opacity = String(Math.sin(Math.min(1, progress) * Math.PI) * 0.9);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        incoming.style.clipPath = 'none';
        outgoing.style.opacity = '0';
        outgoing.style.zIndex = '1';
        foam.style.opacity = '0';
        busyRef.current = false;
        currentRef.current = nextIndex;
        setCurrent(nextIndex);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const resetAutoRotate = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % heroSlides.length;
      goTo(next);
    }, AUTO_ROTATE_MS);
  }, [goTo]);

  useEffect(() => {
    resetAutoRotate();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setAnimKey((key) => key + 1);
  }, [activeSlide]);

  const handleArrow = (direction) => {
    const next =
      direction === 'next'
        ? (current + 1) % heroSlides.length
        : (current - 1 + heroSlides.length) % heroSlides.length;
    goTo(next);
    resetAutoRotate();
  };

  const handleDot = (index) => {
    goTo(index);
    resetAutoRotate();
  };

  return (
    <section className={styles.hero}>
      <nav className={styles.navbar}>
        <span className={styles.logo}>Grand Villa</span>
        <div className={styles.navLinks}>
          <a href="#home">Home</a>
          <a href="#rooms">Rooms</a>
          <a href="#bar-restaurant">Bar &amp; Restaurant</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <button type="button" className={styles.bookNowBtn}>
          BOOK NOW
        </button>
      </nav>

      <div className={styles.slidesViewport} ref={viewportRef}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className={styles.slide}
            style={{
              opacity: index === 0 ? 1 : 0,
              zIndex: index === 0 ? 2 : 1,
            }}
          >
            <div
              key={index === activeSlide ? `${slide.id}-${animKey}` : slide.id}
              className={`${styles.slideImage} ${styles[KEN_BURNS_VARIANTS[index % KEN_BURNS_VARIANTS.length]]} ${index === activeSlide ? styles.slideImageActive : ''}`}
              style={{
                backgroundImage: slide.image
                  ? `url("${slide.image}")`
                  : slide.placeholderGradient,
                animationDuration: `${AUTO_ROTATE_MS}ms`,
              }}
              aria-hidden="true"
            />
            <div className={styles.slideContent}>
              <span className={styles.slideKicker}>{slide.kicker}</span>
              <h1 className={styles.slideTitle}>{slide.title}</h1>
              <p className={styles.slideDescription}>{slide.description}</p>
            </div>
          </div>
        ))}

        <div className={styles.foamOverlay} ref={foamRef} />

        <button
          type="button"
          aria-label="Previous slide"
          className={`${styles.arrowBtn} ${styles.prevBtn}`}
          onClick={() => handleArrow('prev')}
        >
          &lsaquo;
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className={`${styles.arrowBtn} ${styles.nextBtn}`}
          onClick={() => handleArrow('next')}
        >
          &rsaquo;
        </button>

        <div className={styles.dots}>
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
              onClick={() => handleDot(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}