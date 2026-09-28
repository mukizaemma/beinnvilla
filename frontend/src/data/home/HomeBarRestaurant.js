/**
 * HOME BAR & RESTAURANT DATA
 * ─────────────────────────────────────────────────────────────
 * highlights are real (confirmed in chat) — only the descriptions are
 * placeholder copy, worth a polish pass before launch. Images/captions
 * are placeholders pending real photography (same pattern as every
 * other section).
 * ─────────────────────────────────────────────────────────────
 */

export const homeBarRestaurant = {
  eyebrow: 'Bar & Restaurant',
  headline: 'Evenings worth staying in for',
  body: 'From morning coffee on the terrace to a slow dinner by the water, our bar & restaurant is built around Lake Kivu — not just next to it.',
  cta: { label: 'Explore Bar & Restaurant', path: '/bar-restaurant' },
  highlights: [
    {
      id: 'sundowners',
      title: 'Lakeside Sundowners',
      description: 'Cocktails and cold drinks, timed for the view as the sun goes down over the water.',
    },
    {
      id: 'lake-fish',
      title: 'Fresh Lake Fish',
      description: 'Caught nearby and grilled simply, so the fish speaks for itself.',
    },
    {
      id: 'local-dishes',
      title: 'Local Rwandan Dishes',
      description: 'Honest regional cooking alongside familiar favorites, for guests who want to taste the place they\u2019re visiting.',
    },
    {
      id: 'all-day-dining',
      title: 'All-Day Dining',
      description: 'Open from breakfast through dinner — not restricted to hotel-guest hours only.',
    },
  ],
  images: {
    // TODO: replace both with real food/terrace photography
    primary: '/images/bar-restaurant/fresh-fish.jpg',
    secondary: '/images/bar-restaurant/sundowner.jpg',
  },
  captions: {
    // TODO: replace with captions matching the real photos above
    primary: 'Fresh catch, grilled lakeside',
    secondary: 'Sundowner hour on the terrace',
  },
};