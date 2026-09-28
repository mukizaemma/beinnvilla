/**
 * ADAPTERS
 * ─────────────────────────────────────────────────────────────
 * Reshape raw Payload API responses into the exact shapes the existing
 * components already expect, so components stay untouched wherever
 * possible.
 * ─────────────────────────────────────────────────────────────
 */
import { CMS_URL } from '@lib/apiClient'
import { asPlain } from '@lib/richText'

/**
 * Resolve a Payload upload field (or a plain string path) into a full
 * image URL. Payload uploads come back as `{ url: '/api/media/file/x.jpg' }`
 * — relative to the CMS origin, not the frontend's.
 */
export function mediaUrl(field) {
  if (!field) return ''
  const url = typeof field === 'string' ? field : field.url
  if (!url) return ''
  return url.startsWith('http') ? url : `${CMS_URL}${url}`
}

/**
 * Reshapes a Payload `rooms` doc into the exact shape the existing room
 * components expect (see the old @data/rooms/rooms.js) — `id` maps to
 * the human-readable `slug` (used in routes like /rooms/:roomId), and
 * image/gallery upload objects collapse down to plain URL strings.
 */
export function adaptRoom(doc) {
  return {
    id: doc.slug,
    name: doc.name,
    pricePerNight: doc.pricePerNight,
    priceWithBreakfast: doc.priceWithBreakfast,
    monthlyRate: doc.monthlyRate,
    units: Math.max(1, Number(doc.units) || 1),
    description: asPlain(doc.description),
    descriptionHtml: doc.description,
    specs: doc.specs || {},
    features: [
      ...(doc.features || []),
      ...(doc.customFeatures || []).map((item) => item?.label).filter(Boolean),
    ],
    image: mediaUrl(doc.image),
    gallery: (doc.gallery || []).map((g) => mediaUrl(g.photo)).filter(Boolean),
    galleryItems: (doc.gallery || [])
      .map((g) => ({
        id: (typeof g.photo === 'object' && g.photo?.id) || g.id,
        image: mediaUrl(g.photo),
        createdAt: typeof g.photo === 'object' ? g.photo.createdAt : undefined,
        category: 'rooms',
      }))
      .filter((item) => item.image),
  }
}

/** Public site sells one villa, even if older room types remain in the CMS. */
export function pickApartment(rooms = []) {
  if (!rooms.length) return null
  return (
    rooms.find((room) => /villa|apartment|grand/i.test(`${room.name || ''} ${room.id || ''}`)) ||
    rooms[0]
  )
}

/**
 * Reshapes a Payload `experiences` doc the same way adaptRoom() does for
 * rooms — `id` maps to `slug`, upload fields collapse to plain URLs.
 * `price` is flat/one-time (see Experiences.js), unlike a room's
 * `pricePerNight`.
 */
export function publicExcerpt(value, limit = 160) {
  const raw = typeof value === 'string' && value.includes('<')
    ? value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/g, '&')
    : asPlain(value)
  const clean = String(raw || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const cut = clean.slice(0, limit)
  const space = cut.lastIndexOf(' ')
  return `${(space > 60 ? cut.slice(0, space) : cut).trim()}…`
}

export function adaptFacility(doc) {
  const gallery = (doc.gallery || []).map((item) => mediaUrl(item.photo)).filter(Boolean)
  const image = mediaUrl(doc.image) || gallery[0] || ''
  const full = asPlain(doc.description)
  return {
    id: doc.slug,
    name: doc.name,
    summary: publicExcerpt(full || doc.summary),
    description: asPlain(doc.description),
    descriptionHtml: doc.description,
    audience: doc.audience === 'exclusive' ? 'exclusive' : 'visitors',
    available: doc.available !== false,
    image,
    gallery: gallery.length ? gallery : image ? [image] : [],
    sort: Number(doc.sort) || 0,
  }
}

export function adaptExperience(doc) {
  return {
    id: doc.slug,
    name: doc.name,
    price: doc.price,
    description: asPlain(doc.description),
    image: mediaUrl(doc.image),
  }
}

export function adaptMenuItem(doc) {
  return {
    id: doc.id || doc.slug,
    slug: doc.slug,
    name: doc.name,
    price: Number(doc.price) || 0,
    category: doc.category || 'Main',
    description: asPlain(doc.description),
    ingredients: doc.ingredients || '',
    allergens: doc.allergens || '',
    notes: doc.notes || '',
    dietary: doc.dietary || [],
    portion: doc.portion || '',
    image: mediaUrl(doc.image),
    available: doc.available !== false,
    sort: Number(doc.sort) || 0,
  }
}