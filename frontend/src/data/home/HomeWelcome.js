/**
 * HOME WELCOME DATA
 * ─────────────────────────────────────────────────────────────
 * The image-collage + intro-copy section that follows HomeStats.
 * Everything below is placeholder content:
 *  - images: swap for real property photography
 *  - reviewBadges: swap scores/counts for real numbers once the
 *    property has live reviews on these platforms — do NOT launch
 *    with fabricated review counts, they're here only to block out
 *    the layout.
 * ─────────────────────────────────────────────────────────────
 */

export const homeWelcome = {
  eyebrow: 'Welcome to Grand Villa',
  headline: 'A quieter kind of comfort on Lake Kivu',
  body: "Grand Villa Apartment offers restful rooms with breakfast included, and a bar & restaurant looking out over the water. We built this place for travelers who want Karongi's calm without paying resort prices — clean, comfortable, and genuinely welcoming.",
  cta: { label: 'Discover More', path: '/about' },
  images: {
    // TODO: replace both with real property photography
    primary: '/images/home/welcome-2.jpg',
    secondary: '/images/home/welcome-1.jpg',
  },
};

// TODO: replace with real scores/review counts once live on these platforms
export const reviewBadges = [
  { id: 'booking', source: 'Booking.com', score: 4.7, tier: 'Very Good', reviewCount: 0 },
  { id: 'google', source: 'Google Reviews', score: 4.8, tier: 'Excellent', reviewCount: 0 },
  { id: 'tripadvisor', source: 'TripAdvisor', score: 4.6, tier: 'Very Good', reviewCount: 0 },
];