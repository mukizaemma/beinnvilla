/**
 * ROOMS DATA (canonical)
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for room data — used by the homepage teaser
 * (HomeRooms.jsx), the full Rooms list (RoomsList.jsx), and individual
 * room detail pages (RoomDetailPage.jsx).
 *
 * TODO: every price, spec, description, and feature list below is a
 * placeholder invented to fill out the layout — confirm real room
 * names, rates, and specs before this goes live. `image` and every
 * entry in `gallery` are gradient placeholders pending real photography
 * (each gallery entry is a distinct gradient on purpose, purely so the
 * thumbnail-swap interaction is visibly demonstrable before real photos
 * exist — once real photos go in, they'll naturally look distinct too).
 * ─────────────────────────────────────────────────────────────
 */
 
// Shared library of in-room feature icons — see RoomInfo.jsx for the
// icon-key → component mapping. Rooms reference these by id below.
export const FEATURE_LIBRARY = {
  tv: 'Flat-Screen TV',
  wifi: 'Free Wi-Fi',
  ac: 'Air Conditioning',
  safe: 'In-Room Safe',
  alarm: 'Alarm Clock',
  phone: 'Direct Phone Line',
  bath: 'Private Bathroom',
  sofa: 'Sitting Area',
  fridge: 'Mini Fridge',
};

export const rooms = [
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
    features: ['tv', 'wifi', 'ac', 'bath', 'alarm'],
    image: '/images/rooms/standard.jpg',
    gallery: [
      'linear-gradient(160deg, #3A2C1F 0%, #2A2016 100%)',
      'linear-gradient(200deg, #5A4530 0%, #2A2016 100%)',
      'linear-gradient(120deg, #2A2016 0%, #4A3826 100%)',
      'linear-gradient(60deg, #4A3826 0%, #1E1610 100%)',
    ],
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
    features: ['tv', 'wifi', 'ac', 'bath', 'safe'],
    image: '/images/rooms/twin-room.jpg',
    gallery: [
      'linear-gradient(160deg, #2C4A4E 0%, #1B3A3E 100%)',
      'linear-gradient(200deg, #3E6468 0%, #1B3A3E 100%)',
      'linear-gradient(120deg, #1B3A3E 0%, #24484C 100%)',
      'linear-gradient(60deg, #24484C 0%, #0F2224 100%)',
    ],
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
    features: ['tv', 'wifi', 'ac', 'bath', 'alarm'],
    image: '/images/rooms/garden-view.jpg',
    gallery: [
      'linear-gradient(160deg, #4A6B5A 0%, #24382C 100%)',
      'linear-gradient(200deg, #5F8570 0%, #24382C 100%)',
      'linear-gradient(120deg, #24382C 0%, #3A5844 100%)',
      'linear-gradient(60deg, #3A5844 0%, #17241C 100%)',
    ],
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
    features: ['tv', 'wifi', 'ac', 'bath', 'safe', 'fridge'],
    image: '/images/rooms/family.jpg',
    gallery: [
      'linear-gradient(160deg, #4A3A2C 0%, #2A2016 100%)',
      'linear-gradient(200deg, #6A5540 0%, #2A2016 100%)',
      'linear-gradient(120deg, #2A2016 0%, #4A3826 100%)',
      'linear-gradient(60deg, #4A3826 0%, #1E1610 100%)',
    ],
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
    features: ['tv', 'wifi', 'ac', 'bath', 'safe', 'phone'],
    image: '/images/rooms/deluxe-lake-view.jpg',
    gallery: [
      'linear-gradient(160deg, #1B3A3E 0%, #0F2224 100%)',
      'linear-gradient(200deg, #2C4A4E 0%, #0F2224 100%)',
      'linear-gradient(120deg, #0F2224 0%, #1F3D40 100%)',
      'linear-gradient(60deg, #1F3D40 0%, #081416 100%)',
    ],
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
    features: ['tv', 'wifi', 'ac', 'bath', 'safe', 'sofa', 'fridge', 'phone'],
    image: '/images/rooms/executive-suite.jpg',
    gallery: [
      'linear-gradient(160deg, #5A4A2C 0%, #2E2414 100%)',
      'linear-gradient(200deg, #7A6440 0%, #2E2414 100%)',
      'linear-gradient(120deg, #2E2414 0%, #4E4020 100%)',
      'linear-gradient(60deg, #4E4020 0%, #1C1610 100%)',
    ],
  },
];