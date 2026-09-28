import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

function plainLexical(value) {
  if (!value || typeof value === 'string') return String(value || '')
  function walk(node) {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    const children = (node.children || []).map(walk).join('')
    return node.type === 'paragraph' || node.type === 'heading' ? `${children} ` : children
  }
  return walk(value.root).replace(/\s+/g, ' ').trim()
}

function excerpt(text, limit = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const cut = clean.slice(0, limit)
  const space = cut.lastIndexOf(' ')
  return `${(space > 60 ? cut.slice(0, space) : cut).trim()}…`
}

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
    beforeChange: [
      ({ data }) => {
        if (!data?.description) return data
        data.summary = excerpt(plainLexical(data.description))
        return data
      },
    ],
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
      admin: {
        hidden: true,
        description: 'Filled from the description. The public list shows the first 160 characters.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'One description. The facilities list shows the first 160 characters. The facility page shows the full text.',
      },
    },
    previewUpload('image', { admin: { width: '25%' } }),
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Add as many photos as you need. The first is the cover. The rest appear in the facility gallery.',
        components: {
          Field: './src/components/payload/MediaGridField/index.jsx#MediaGridField',
        },
      },
      fields: [previewUpload('photo', { required: true, admin: { width: '50%' } })],
    },
  ],
}
