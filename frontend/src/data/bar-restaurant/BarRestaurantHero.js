/**
 * BAR & RESTAURANT — HERO
 * ─────────────────────────────────────────────────────────────
 * videoUrl is intentionally empty — no footage exists yet. The hero
 * falls back to a moody gradient background if empty (see
 * BarRestaurantHero.jsx); once you have real slow-motion footage of
 * people toasting/cheersing, drop the URL in here.
 * ─────────────────────────────────────────────────────────────
 */

export const barRestaurantHero = {
  eyebrow: 'Bar & Restaurant',
  headline: 'You came to the right place',
  intro: 'Leave everything behind. Good food, good drinks, and a view worth staying for.',
  cta: { label: 'Reserve a Table', path: '/contact' },
  // TODO: replace with real slow-motion video (people toasting/cheersing)
  videoUrl: '/images/bar-restaurant/hero-video.mp4',
  // TODO: replace with a real photo — used as poster + fallback if no video
  backgroundImage: '/images/bar-restaurant/hero-bg.jpg',
}