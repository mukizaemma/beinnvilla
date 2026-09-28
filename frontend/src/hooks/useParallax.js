import { useRef, useState, useEffect } from 'react';

/**
 * Returns [ref, offsetPx] — attach ref to the section, apply offsetPx as
 * a translateY on an oversized background layer inside it. speed controls
 * how much slower the background moves than the page (0 = no parallax,
 * 0.3–0.4 is a subtle, premium-feeling amount — anything higher starts
 * to feel gimmicky).
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
          setOffset(distanceFromCenter * speed * -1);
        }
        tickingRef.current = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [speed]);

  return [ref, offset];
}