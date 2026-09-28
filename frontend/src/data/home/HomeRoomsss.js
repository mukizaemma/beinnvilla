/**
 * HOME ROOMS DATA (homepage preview carousel)
 * ─────────────────────────────────────────────────────────────
 * TODO: every price, spec, and description below is a placeholder
 * invented to fill out the layout — confirm real room names, rates,
 * and specs before this goes live. Images are gradient placeholders
 * (see @data/home/HomeHero for the same pattern) pending real photos.
 * ─────────────────────────────────────────────────────────────
 */

export const homeRooms = [
  {
    id: 'standard',
    name: 'Standard Room',
    pricePerNight: 45,
    description:
      'Cozy and comfortable, this room covers everything you need for a relaxed stay in Karongi.',
    specs: {
      size: '22 m²',
      bed: '1 Queen Bed',
      occupancy: '2 Adults',
      view: 'Garden View',
      smoking: 'No Smoking',
      breakfast: 'Breakfast Included',
    },
    image: '/images/rooms/standard.jpg',
  },
  {
    id: 'twin',
    name: 'Twin Room',
    pricePerNight: 50,
    description:
      'Two comfortable single beds, ideal for friends or colleagues traveling together.',
    specs: {
      size: '24 m²',
      bed: '2 Single Beds',
      occupancy: '2 Adults',
      view: 'Garden View',
      smoking: 'No Smoking',
      breakfast: 'Breakfast Included',
    },
    image: '/images/rooms/twin-room.jpg',
  },
  {
    id: 'garden-view',
    name: 'Garden View Room',
    pricePerNight: 55,
    description:
      'A quiet room looking out over the courtyard garden — simple, fresh, and restful.',
    specs: {
      size: '24 m²',
      bed: '1 Queen Bed',
      occupancy: '2 Adults',
      view: 'Courtyard Garden',
      smoking: 'No Smoking',
      breakfast: 'Breakfast Included',
    },
    image: '/images/rooms/garden-view.jpg',
  },
  {
    id: 'family',
    name: 'Family Room',
    pricePerNight: 70,
    description:
      'Extra space for the whole family, with a mix of bedding to suit parents and kids alike.',
    specs: {
      size: '32 m²',
      bed: '1 Queen + 2 Singles',
      occupancy: '2 Adults, 2 Children',
      view: 'Garden View',
      smoking: 'No Smoking',
      breakfast: 'Breakfast Included',
    },
    image: '/images/rooms/family.jpg',
  },
  {
    id: 'deluxe-lake-view',
    name: 'Deluxe Lake View Room',
    pricePerNight: 85,
    description:
      'Wake up to Lake Kivu right outside your window — our most requested room.',
    specs: {
      size: '28 m²',
      bed: '1 King Bed',
      occupancy: '2 Adults',
      view: 'Lake Kivu View',
      smoking: 'No Smoking',
      breakfast: 'Breakfast Included',
    },
    image: '/images/rooms/deluxe-lake-view.jpg',
  },
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    pricePerNight: 110,
    description:
      'Our largest room, with a separate sitting area — for travelers who want a little more room to breathe.',
    specs: {
      size: '40 m²',
      bed: '1 King Bed',
      occupancy: '2 Adults, 1 Child',
      view: 'Lake Kivu View',
      smoking: 'No Smoking',
      breakfast: 'Breakfast Included',
    },
    image: '/images/rooms/executive-suite.jpg',
  },
];