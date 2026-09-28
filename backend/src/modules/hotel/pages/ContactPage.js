import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const ContactPage = {
  slug: 'contact-page',
  label: 'Contact us',
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
    { name: 'responseNote', type: 'text', admin: { width: '50%' } },
    { name: 'frontDeskNote', type: 'text', admin: { width: '50%' } },
  ],
}
