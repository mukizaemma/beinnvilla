/**
 * NAVIGATION DATA
 * ─────────────────────────────────────────────────────────────
 * Shared between Navbar, MobileDrawer, and Footer so link labels/paths
 * only ever need to change in one place.
 * ─────────────────────────────────────────────────────────────
 */

export const primaryNav = [
  { label: 'Home', path: '/' },
  { label: 'Rooms', path: '/rooms' },
  { label: 'Bar & Restaurant', path: '/bar-restaurant' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

// TODO: link updates to '/booking' once real booking functionality is built —
// for now it points at Contact, matching our "inquiry-style" booking decision.
export const navCTA = { label: 'Book Now', path: '/contact' }
