import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const GalleryPage = {
  slug: 'gallery-page',
  label: 'Gallery',
  admin: { group: false },
  access: {
    read: () => true,
  },
  fields: pageHeroFields,
}