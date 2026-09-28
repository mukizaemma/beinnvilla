import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

export const Facilities = {
  slug: 'facilities',
  labels: {
    singular: 'Facility',
    plural: 'Facilities',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'name',
    defaultColumns: ['image', 'name', 'audience', 'available'],
    description:
      'Jacuzzi and meeting space are held with a stay. Sauna, bar, and restaurant can also welcome friends and visitors.',
  },
  hooks: {
    beforeValidate: [applyAutoSlug],
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '25%' } },
    {
      name: 'audience',
      type: 'select',
      required: true,
      defaultValue: 'visitors',
      admin: { width: '25%' },
      options: [
        { label: 'Held with a stay (jacuzzi, meetings)', value: 'exclusive' },
        { label: 'Also open to friends and visitors', value: 'visitors' },
      ],
    },
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      label: 'Available to request',
      admin: { width: '25%' },
    },
    { name: 'sort', type: 'number', defaultValue: 0, admin: { width: '25%' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'Short line on the facilities list and the booking form.' },
    },
    { name: 'description', type: 'richText' },
    previewUpload('image', { admin: { width: '25%' } }),
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Photos for this facility’s page.',
        components: {
          Field: './src/components/payload/MediaGridField/index.jsx#MediaGridField',
        },
      },
      fields: [previewUpload('photo', { required: true, admin: { width: '50%' } })],
    },
  ],
}
