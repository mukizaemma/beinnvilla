/**
 * GALLERY DATA
 * ─────────────────────────────────────────────────────────────
 * All images are gradient placeholders (TODO: replace every one with
 * real photography). `aspect` drives the masonry tile height —
 * 'tall' | 'square' | 'wide' — pick whatever suits each real photo
 * once it goes in; doesn't need to match what's here now.
 * ─────────────────────────────────────────────────────────────
 */

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'bar-restaurant', label: 'Bar & Restaurant' },
  { id: 'lake-grounds', label: 'Lake & Grounds' },
  { id: 'amenities', label: 'Amenities' },
]

export const galleryImages = [
  { id: 'g1', category: 'rooms', caption: 'Standard Room', aspect: 'tall',
    image: '/images/rooms/standard.jpg' },
  { id: 'g2', category: 'rooms', caption: 'Deluxe Lake View Room', aspect: 'square',
    image: '/images/rooms/deluxe-lake-view.jpg' },
  { id: 'g3', category: 'rooms', caption: 'Family Room', aspect: 'wide',
    image: '/images/rooms/family.jpg' },
  { id: 'g4', category: 'rooms', caption: 'Executive Suite', aspect: 'tall',
    image: '/images/rooms/executive-suite.jpg' },
  { id: 'g5', category: 'rooms', caption: 'Twin Room', aspect: 'square',
    image: '/images/rooms/twin-room.jpg' },

  { id: 'g6', category: 'bar-restaurant', caption: 'Lakeside Sundowners', aspect: 'wide',
    image: '/images/bar-restaurant/lakeside-sundowners.jpg' },
  { id: 'g7', category: 'bar-restaurant', caption: 'Fresh Lake Fish', aspect: 'square',
    image: '/images/bar-restaurant/fresh-lake-fish.jpg' },
  { id: 'g8', category: 'bar-restaurant', caption: 'Dining Terrace', aspect: 'tall',
    image: '/images/bar-restaurant/dining-terrace.jpg' },
  { id: 'g9', category: 'bar-restaurant', caption: 'Evening at the Bar', aspect: 'square',
    image: '/images/bar-restaurant/evening-at-the-bar.jpg' },

  { id: 'g10', category: 'lake-grounds', caption: 'Lake Kivu Shoreline', aspect: 'wide',
    image: '/images/bar-restaurant/lake-kivu-shoreline.jpg' },
  { id: 'g11', category: 'lake-grounds', caption: 'Property Courtyard', aspect: 'tall',
    image: '/images/bar-restaurant/property-courtyard.jpg' },
  { id: 'g12', category: 'lake-grounds', caption: 'Sunset Over the Water', aspect: 'square',
    image: 'linear-gradient(160deg, #C88B4A 0%, #8A5A2C 100%)' },
  { id: 'g13', category: 'lake-grounds', caption: 'Garden Path', aspect: 'square',
    image: 'linear-gradient(160deg, #5A6B4A 0%, #2A3820 100%)' },

  { id: 'g14', category: 'amenities', caption: 'Swimming Pool', aspect: 'wide',
    image: '/images/amenities/swimming-pool.jpg' },
  { id: 'g15', category: 'amenities', caption: 'Spa Center', aspect: 'tall',
    image: '/images/bar-restaurant/spa-center.jpg' },
  { id: 'g16', category: 'amenities', caption: 'Lake-View Terrace', aspect: 'square',
    image: '/images/bar-restaurant/lake-view-terrace.jpg' },
]