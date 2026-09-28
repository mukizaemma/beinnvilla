export { LOCATION_HIGHLIGHTS } from './lakeStay'

export const BRAND = {
  name: 'BE Inn Villa',
  shortName: 'BE Inn',
  tagline: 'Twenty rooms in Kanombe–Busanza for couples, singles, and groups — breakfast, sauna, and Kigali at night.',
  mark: 'BE',
  place: 'Kanombe–Busanza, Kigali',
  logo: '/brand/be-inn-mark.jpg',
  seal: '/brand/be-inn-welcome.jpg',
  icon: '/brand/be-inn-mark.jpg',
}

export const PUBLIC_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Accommodation', path: '/accommodation' },
  { label: 'Facilities', path: '/facilities' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Visit', path: '/visit' },
]

export const PUBLIC_CTA = { label: 'Book your Stay', path: '/book' }

const LEGACY_NAME = /grand\s*villa/i
const LEGACY_PLACE = /karongi|kibuye|lake\s*kivu|three-hour|western shore/i

export function isLegacyName(value) {
  return LEGACY_NAME.test(String(value || ''))
}

export function publicPlace(value, fallback = BRAND.place) {
  const text = String(value || '').trim()
  if (!text || LEGACY_PLACE.test(text)) return fallback
  return text
}
