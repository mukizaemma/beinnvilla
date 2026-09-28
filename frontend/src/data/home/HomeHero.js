/**
 * HOME HERO DATA
 * ─────────────────────────────────────────────────────────────
 * Each slide is a "scene" in the rotation (overview / rooms / bar &
 * restaurant). `placeholderGradient` stands in until real property
 * photography is ready — swap it for an image/video src later without
 * touching HomeHero.jsx.
 * ─────────────────────────────────────────────────────────────
 */

export const heroSlides = [
  {
    id: 'overview',
    eyebrow: 'Karongi · Lake Kivu',
    headline: 'Grand Villa Apartment',
    subline:
      'Comfortable rooms, breakfast included, on the shores of Lake Kivu.',
    image: '/images/home/hero-overview.jpg',
    placeholderGradient:
      'linear-gradient(180deg, #2C4A4E 0%, #1B3A3E 60%, #15302E 100%)',
  },
  {
    id: 'rooms',
    eyebrow: 'Rooms & Breakfast',
    headline: 'Rest easy, wake up well fed',
    subline:
      'Every stay includes a full Rwandan breakfast, made fresh each morning.',
    image: '/images/home/breakfast.jpg',
    placeholderGradient:
      'linear-gradient(180deg, #4A3A2C 0%, #3A2C1F 60%, #2A2016 100%)',
  },
  {
    id: 'bar-restaurant',
    eyebrow: 'Bar & Restaurant',
    headline: 'Good food, better view',
    subline:
      'Local dishes and cold drinks, served looking out over the water.',
    image: '/images/home/Villa-Hotel-and-Restaurant.jpg',
    placeholderGradient:
      'linear-gradient(180deg, #3A2A2E 0%, #2C1F22 60%, #1E1517 100%)',
  },
];

export const heroCTAs = {
  primary: { label: 'Book Now', link: '/contact' },
};
