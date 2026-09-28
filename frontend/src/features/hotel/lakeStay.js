/** Public fallbacks for BE Inn Villa in Kanombe–Busanza. */

export const APARTMENT = {
  bedrooms: 20,
  bathrooms: 20,
  priceSelfCatering: 150,
  priceWithBreakfast: 200,
  monthlyRate: 2500,
  facts: [
    { value: '20', label: 'Rooms' },
    { value: '1–2', label: 'Guests a room' },
    { value: '50', label: 'Event guests' },
    { value: 'In-house', label: 'Bar & restaurant' },
  ],
  perks: [
    'Bed and breakfast',
    'Sauna',
    'Bar and restaurant for guests staying here',
    'Kigali night views',
    'Rooms suited to photography',
  ],
}

export const DESTINATION = {
  eyebrow: 'Kanombe–Busanza',
  headline: 'Twenty rooms above Kigali',
  body:
    'BE Inn Villa is a premium house in Kanombe–Busanza. Twenty rooms for couples or singles, preferably taken by a group, for a short stay or a long one. Breakfast, a sauna, and a bar and restaurant for people staying in the house.',
  cta: { label: 'Book a stay', path: '/book' },
  facts: [
    { value: '20', label: 'Rooms' },
    { value: '50', label: 'Event guests' },
    { value: 'Night', label: 'City views' },
  ],
}

export const DEFAULT_HOME_FEATURES = [
  {
    icon: 'coffee',
    title: 'Bed and breakfast',
    text: 'Breakfast in the house, whether the stay is a few nights or a month.',
  },
  {
    icon: 'droplets',
    title: 'Sauna',
    text: 'Heat and quiet, reserved for guests of the villa.',
  },
  {
    icon: 'wine',
    title: 'In-house table',
    text: 'Bar and restaurant for people staying here, not for walk-in diners.',
  },
  {
    icon: 'mountain',
    title: 'Night views',
    text: 'Kigali after dark, from rooms made to be photographed.',
  },
]

export const FALLBACK_EXPERIENCES = [
  {
    id: 'night-views',
    name: 'Kigali at night',
    price: null,
    description: 'The city after dark, from the rooms and terraces of the house.',
    image: '',
    accent: 'linear-gradient(160deg, #2a211c 0%, #120e0c 100%)',
  },
  {
    id: 'small-events',
    name: 'Small events',
    price: null,
    description: 'Gatherings of up to 50 guests inside the villa, among the architecture.',
    image: '',
    accent: 'linear-gradient(160deg, #3a2a22 0%, #1c1410 100%)',
  },
  {
    id: 'sauna',
    name: 'Sauna',
    price: null,
    description: 'A private sauna for guests staying at BE Inn Villa.',
    image: '',
    accent: 'linear-gradient(160deg, #4a3428 0%, #241812 100%)',
  },
]

export const LOCATION_HIGHLIGHTS = [
  'Kanombe–Busanza, Kigali',
  'Twenty rooms for couples, singles, or a group',
  'Night views, small events, and interiors for photography',
]

export const ROOMS_SECTION = {
  eyebrow: 'Stay',
  headline: 'Twenty rooms',
  intro: 'A couple or a single guest in each room. Take one room, or hold the house for a group — short stay or long.',
}

export const GALLERY_PREVIEW = {
  eyebrow: 'Frames',
  headline: 'The architecture, inside',
  intro: 'Rooms, light, and the lines of the house — a place people come to photograph.',
  cta: { label: 'Book a stay', path: '/book' },
}

export const HOME_CTA = {
  eyebrow: 'Kanombe–Busanza',
  headline: 'Hold a room, or the house.',
  body:
    'BE Inn Villa is twenty rooms for couples and singles, preferably for groups, with breakfast, a sauna, and an in-house bar and restaurant.',
  cta: { label: 'Book a stay', path: '/book' },
}

export const EXPERIENCES_SECTION = {
  eyebrow: 'The house',
  headline: 'Night, events, and the table',
  intro:
    'Kigali after dark, gatherings up to 50 guests, and a bar and restaurant that serves only people staying here.',
}

export const APARTMENT_DESCRIPTION =
  'BE Inn Villa in Kanombe–Busanza has 20 rooms, each for a couple or a single guest. The house is preferred for groups, on short stays or long ones, with bed and breakfast, a sauna, and a bar and restaurant for in-house guests. Night views over Kigali, events up to 50, and interiors shaped for photography.'
