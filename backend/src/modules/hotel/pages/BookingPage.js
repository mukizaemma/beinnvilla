import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const BookingPage = {
  slug: 'booking-page',
  label: 'Booking',
  admin: { group: false },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: pageHeroFields,
    },
  ],
}
