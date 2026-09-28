import { useMemo } from 'react';
import styles from './ParticlesBackground.module.css';

const COLORS = ['var(--color-terracotta)', 'var(--color-gold)', 'var(--color-hillside-green)'];

/**
 * Soft, slow-drifting dots for an ambient "alive" background on light
 * sections. Purely decorative (aria-hidden). Count/opacity are kept low
 * so it reads as texture, not noise.
 */
export default function ParticlesBackground({ count = 18 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 3 + Math.random() * 5,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * -20,
        color: COLORS[i % COLORS.length],
        opacity: 0.12 + Math.random() * 0.18,
      })),
    [count],
  );

  return (
    <div className={styles.field} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.dot}
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}