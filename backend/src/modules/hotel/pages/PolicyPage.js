import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const PolicyPage = {
  slug: 'policy-page',
  label: 'Booking policy',
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
    { name: 'body', type: 'richText' },
  ],
}
