export const HANDOVER_TABS = [
  { id: 'overview', label: 'What was built' },
  { id: 'access', label: 'Sign in' },
  { id: 'settings', label: 'Site setting' },
  { id: 'pages', label: 'Pages' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'amenities', label: 'Facilities' },
  { id: 'menu', label: 'Menu items' },
  { id: 'gallery', label: 'Gallery & media' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'audit', label: 'Site audit' },
  { id: 'feedback', label: 'Send feedback' },
]

export const HANDOVER_SECTIONS = {
  overview: {
    title: 'What was built',
    lead: 'Grand Villa Apartment now has a public website and a staff desk for day-to-day content.',
    blocks: [
      {
        heading: 'Public website',
        body: 'Guests can browse rooms, the restaurant, things to do, the gallery, about, contact, and book a stay. They never log in. Payments can go through card or Mobile Money when those services are connected, or they can pay on arrival.',
      },
      {
        heading: 'Staff desk',
        body: 'Use /staff for the simpler property desk: rooms, menu items, pages, photos, amenities, and reservations. Payload admin at /admin is the same content with a few extra tools, including this live site audit.',
      },
      {
        heading: 'What to keep current',
        body: 'Room photos and prices, restaurant highlights, gallery photos, contact numbers, and booking replies. The Site audit tab scores those items so you know where to focus.',
      },
    ],
  },
  access: {
    title: 'How to sign in',
    lead: 'Two doors, one property account. The password is never shown on this page.',
    blocks: [
      {
        heading: 'Staff desk',
        body: 'Open /staff, sign in with the property admin email, then use the left menu. This is the everyday place to change rooms, pages, and photos.',
      },
      {
        heading: 'Full admin',
        body: 'Open /admin for the same account. Use this if you prefer Payload’s screens, or to read handover feedback and the live audit.',
      },
      {
        heading: 'Password',
        body: 'Ireme shares the first password privately (email or WhatsApp). This page will not display it. If it is lost, use Forgot password on the login screen — a reset link is emailed to that account.',
      },
    ],
  },
  settings: {
    title: 'Site setting',
    lead: 'Property name, logo, phones, email, map, and search-engine text all live in one place.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Site setting, or Admin → Site setting. Fill name, logo, phone, WhatsApp, email, address, and a Google Maps link or embed.',
      },
      {
        heading: 'Why it matters',
        body: 'The footer, contact page, and booking messages read from here. Empty phone or map fields show up on the site audit as items to finish.',
      },
    ],
  },
  pages: {
    title: 'Website pages',
    lead: 'Each public page has a matching edit screen. Change the header image and headline first — that is what guests see at the top.',
    blocks: [
      {
        heading: 'Home',
        body: 'Hero slides (photo + headline), welcome features, rooms intro, and location copy. Restaurant photos on the home page are edited under Bar & Restaurant → Home page section.',
      },
      {
        heading: 'Other pages',
        body: 'Accommodation, Bar & Restaurant, Things to do, Gallery, About, Contact, Booking, and Booking policy each have their own tab. Keep a header image and headline on every page.',
      },
    ],
  },
  rooms: {
    title: 'Rooms',
    lead: 'A room needs a name, nightly rate, description, main photo, extra photos, bed/occupancy, and in-room amenities.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Rooms. Add or edit a room, then upload a main photo and a few gallery shots. Set how many physical rooms of that type you have. Tick the amenities that belong in that room (Wi-Fi, AC, bathroom, and so on).',
      },
      {
        heading: 'What guests see',
        body: 'The accommodation list and each room page. Missing photos or amenities lower the site audit score for that room.',
      },
    ],
  },
  amenities: {
    title: 'Property facilities',
    lead: 'Facilities are property-wide (parking, restaurant, front desk), not the in-room list on each room.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Amenities. Add a name, short description, and a photo. Aim for at least three published facilities.',
      },
    ],
  },
  menu: {
    title: 'Menu items',
    lead: 'Each dish lives in Menu items, not on the restaurant page form. The page only holds the menu headline.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Menu items, or Admin → Menu items. Add a name, price, category, photo, ingredients, and any allergens or dietary tags.',
      },
      {
        heading: 'What guests see',
        body: 'The Bar & Restaurant page shows the dishes in a grid. Details (hover or tap) open ingredients and notes. Guests can add items and send the order on WhatsApp with prices, total, and their notes.',
      },
    ],
  },
  gallery: {
    title: 'Gallery and media',
    lead: 'Media Gallery is the library. Site Gallery is what guests see on /gallery.',
    blocks: [
      {
        heading: 'Upload once, reuse everywhere',
        body: 'Staff desk → Media Gallery to upload. On any page or room, choose an existing file or upload a new one.',
      },
      {
        heading: 'Publish to the gallery page',
        body: 'Open the file and set Gallery category to Rooms, Bar & Restaurant, Property & views, or Amenities. Leave it on None to keep the file in the library only.',
      },
    ],
  },
  bookings: {
    title: 'Bookings',
    lead: 'New reservations appear on the admin home and under Bookings. You can confirm, reply, or take a note on the conversation thread.',
    blocks: [
      {
        heading: 'Daily use',
        body: 'Filter by date, open a booking, and reply on WhatsApp or email — whichever the guest chose. Paste guest replies so the thread stays on that reservation.',
      },
      {
        heading: 'When the property is full',
        body: 'Staff desk → Availability. Close the whole property or selected rooms for a date range (for example a football team until 8 September). The website stops those bookings. Tap Open again when you can take guests.',
      },
      {
        heading: 'Payments',
        body: 'Card and Mobile Money only work after those accounts are connected. Guests can always choose pay on arrival.',
      },
    ],
  },
  audit: {
    title: 'Site audit',
    lead: 'This score is calculated from live content. It is not a manual checklist.',
    blocks: [
      {
        heading: 'How to use it',
        body: 'Work through anything marked Focus. Open the staff desk link beside the item, add the missing photo or text, then refresh this page. The score updates from the website content itself.',
      },
    ],
  },
  feedback: {
    title: 'Tell us what to improve',
    lead: 'If something is missing, unclear, or should work differently, send a note. Ireme can see it in admin under Handover notes.',
    blocks: [],
  },
}
