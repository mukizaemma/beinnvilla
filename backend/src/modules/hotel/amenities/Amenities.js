import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

export const Amenities = {
  slug: 'amenities',
  labels: {
    singular: 'Amenity',
    plural: 'Amenities',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'name',
    defaultColumns: ['image', 'name', 'updatedAt'],
    description: 'Apartment amenities shown on the public site.',
  },
  hooks: {
    beforeValidate: [applyAutoSlug],
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '25%' } },
    {
      name: 'icon',
      type: 'select',
      admin: { width: '25%' },
      options: [
        'wifi', 'parking', 'bar-restaurant', 'front-desk',
        'transport', 'terrace', 'pool', 'gym', 'spa', 'breakfast',
      ].map((value) => ({ label: value, value })),
    },
    { name: 'sort', type: 'number', defaultValue: 0, admin: { width: '25%' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true, readOnly: true },
    },
    { name: 'description', type: 'richText' },
    previewUpload('image', { admin: { width: '25%' } }),
  ],
}
