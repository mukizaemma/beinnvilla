import { BRAND } from './brand'

export const INN = {
  rooms: 20,
  eventGuests: 50,
  facts: [
    { value: '20', label: 'Rooms' },
    { value: '2', label: 'Guests a room' },
    { value: '50', label: 'Event guests' },
    { value: 'Night', label: 'Kigali views' },
  ],
  offers: [
    {
      index: '01',
      title: 'Bed and breakfast',
      text: 'Sleep in, then breakfast in the house. Short nights and long stays both start the same way.',
    },
    {
      index: '02',
      title: 'Sauna',
      text: 'Open to guests of the house, and to friends and visitors when it is free.',
    },
    {
      index: '03',
      title: 'Bar and restaurant',
      text: 'Breakfast for the stay. Friends and visitors are welcome at the bar and restaurant too.',
    },
  ],
}

export const HERO = {
  eyebrow: 'After dark',
  headline: 'The night is the view.',
  lines: [
    'A private house for the people you want beside you.',
    'Wake above the city. Leave only when you are ready.',
    'Couples, friends, and nights that run long.',
    'Breakfast in the house. The lights stay outside.',
    'Hold the evening. The view does the rest.',
  ],
  primary: { label: 'Book your Stay', path: '/book' },
}

export const FACILITIES = [
  {
    id: 'jacuzzi',
    name: 'Jacuzzi',
    audience: 'exclusive',
    summary: 'Booked with the stay. It stays with that group until they check out, then it is free again.',
    image: '',
    gallery: [],
  },
  {
    id: 'meetings',
    name: 'Meetings',
    audience: 'exclusive',
    summary: 'A room for gatherings of up to 50. Held with the group’s stay, then released.',
    image: '',
    gallery: [],
  },
  {
    id: 'sauna',
    name: 'Sauna',
    audience: 'visitors',
    summary: 'For guests in the house, and for friends and visitors when it is free.',
    image: '',
    gallery: [],
  },
  {
    id: 'table',
    name: 'Bar and restaurant',
    audience: 'visitors',
    summary: 'Breakfast comes with the stay. Friends and visitors can also use the bar and restaurant.',
    image: '',
    gallery: [],
  },
]

export const HOUSE = {
  eyebrow: 'The house',
  headline: 'Built for a group, ready for one room.',
  body: 'BE Inn Villa holds 20 rooms in Kanombe–Busanza. Each room takes a couple or a single guest, so the house can host 20 couples or 20 singles. Most people take it together — a group, a long stay, or a short one — with breakfast, a sauna, and a bar and restaurant that stay inside the house.',
}

export const ROOMS = {
  eyebrow: 'Stay',
  headline: 'Twenty rooms. Short or long.',
  intro: 'Book a room, or take the house for the group. Couples and singles share the same quiet standard.',
}

export const NIGHT = {
  eyebrow: 'After dark',
  headline: 'Kigali, from the house.',
  body: 'The rooms look out over the city at night. The same rooms hold a small event — up to 50 guests — without leaving the architecture.',
  points: ['Night views over Kigali', 'Events up to 50 guests', 'Groups, long stays, short stays'],
}

export const FRAMES = {
  eyebrow: 'Inside',
  headline: 'A house that photographs.',
  intro: 'Angles, light, and the structure of the villa. Bring a camera; the rooms are the set.',
}

export const VISIT = {
  eyebrow: 'Visit',
  headline: 'Kanombe–Busanza',
  body: 'A new premium address in Kigali. Ask the desk for directions, a group hold, or a longer stay.',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kanombe%20Busanza%20Kigali',
}

export const POLICY_LEDE = `These terms apply when you request a stay at ${BRAND.name}. Staff confirm every reservation before it is final.`
