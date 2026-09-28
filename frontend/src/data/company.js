/**
 * COMPANY / PROPERTY INFO
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for contact/location details used across the
 * site (Footer, HomeCTA, and later the Contact page). Edit here once —
 * every consumer picks it up automatically.
 * ─────────────────────────────────────────────────────────────
 */

export const company = {
  name: 'Grand Villa Apartment',
  tagline: 'Comfortable rooms, honest food, and Lake Kivu right outside.',

  // TODO: confirm/replace with the real phone and email
  phone: '+250 700 000 000',
  email: 'stay@grandvillaapartment.rw',

  address: 'Karongi, Western Province, Rwanda',
  distanceFromKigali: '~3h drive from Kigali',
  // TODO: swap for the real Google Maps place link once the property has a confirmed pin
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Karongi%2C+Rwanda',

  socials: {
    instagram: '',
    facebook: '',
    tripadvisor: '',
    tiktok: '',
    youtube: '',
    x: '',
    linkedin: '',
  },
};