import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const ThingsToDoPage = {
  slug: 'things-to-do-page',
  label: 'Things to do',
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
