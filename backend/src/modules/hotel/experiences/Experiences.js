import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

export const Experiences = {
  slug: 'experiences',
  labels: {
    singular: 'Activity',
    plural: 'Things to do',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'name',
    defaultColumns: ['image', 'name', 'price'],
    description: 'Activities on Things to do. Slug is generated from the name.',
  },
  hooks: {
    beforeValidate: [applyAutoSlug],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { width: '25%' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        width: '25%',
        description: 'Flat, one-time price — not per night.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    previewUpload('image', { admin: { width: '25%' } }),
  ],
}
