import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

export const Rooms = {
  slug: 'rooms',
  labels: {
    singular: 'Apartment',
    plural: 'Apartment',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'name',
    defaultColumns: ['image', 'name', 'pricePerNight', 'priceWithBreakfast', 'monthlyRate'],
    description: 'The whole villa guests book. Keep a single listing — this is not a hotel of room types.',
  },
  hooks: {
    beforeValidate: [applyAutoSlug],
    beforeChange: [
      ({ data }) => {
        if (data?.image && (!data.gallery || data.gallery.length === 0)) {
          const photo = typeof data.image === 'object' ? data.image.id : data.image
          if (photo) data.gallery = [{ photo }]
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const ids = (doc.gallery || [])
          .map((item) => (typeof item.photo === 'object' ? item.photo?.id : item.photo))
          .filter(Boolean)
        for (const id of ids) {
          try {
            const media = await req.payload.findByID({
              collection: 'media',
              id,
              depth: 0,
              overrideAccess: true,
            })
            if (!media) continue
            const category = media.galleryCategory
            if (media.showOnGallery && category && category !== 'none') continue
            await req.payload.update({
              collection: 'media',
              id,
              data: {
                showOnGallery: true,
                galleryCategory: category && category !== 'none' ? category : 'rooms',
              },
              overrideAccess: true,
            })
          } catch {
            /* skip a missing or unreadable file */
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { width: '25%' },
    },
    {
      name: 'pricePerNight',
      type: 'number',
      required: true,
      label: 'Nightly rate (no breakfast)',
      admin: { width: '25%', description: 'USD per night without breakfast.' },
    },
    {
      name: 'priceWithBreakfast',
      type: 'number',
      label: 'Nightly rate with breakfast',
      admin: { width: '25%', description: 'USD per night with breakfast.' },
    },
    {
      name: 'monthlyRate',
      type: 'number',
      label: 'Monthly rate',
      admin: { width: '25%', description: 'USD for a month-long stay.' },
    },
    {
      name: 'units',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: {
        width: '25%',
        description: 'Leave as 1. Guests book the whole apartment, not extra copies of a room type.',
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
      required: true,
      admin: { description: 'What the group is booking: the whole apartment, not a single hotel room.' },
    },
    {
      name: 'specs',
      type: 'group',
      fields: [
        { name: 'size', type: 'text', admin: { width: '25%' } },
        { name: 'bed', type: 'text', admin: { width: '25%' } },
        { name: 'occupancy', type: 'text', admin: { width: '25%' } },
        { name: 'view', type: 'text', admin: { width: '25%' } },
        { name: 'smoking', type: 'text', admin: { width: '25%' } },
        { name: 'breakfast', type: 'text', admin: { width: '25%' } },
      ],
    },
    {
      name: 'features',
      type: 'select',
      hasMany: true,
      admin: { width: '50%' },
      options: [
        { label: 'Flat-Screen TV', value: 'tv' },
        { label: 'Free Wi-Fi', value: 'wifi' },
        { label: 'Air Conditioning', value: 'ac' },
        { label: 'In-Room Safe', value: 'safe' },
        { label: 'Alarm Clock', value: 'alarm' },
        { label: 'Direct Phone Line', value: 'phone' },
        { label: 'Private Bathroom', value: 'bath' },
        { label: 'Sitting Area', value: 'sofa' },
        { label: 'Mini Fridge', value: 'fridge' },
        { label: 'Full kitchen', value: 'kitchen' },
        { label: 'Hot water', value: 'hot-water' },
        { label: 'Private in-house bar', value: 'private-bar' },
        { label: 'Boat ride for in-house guests', value: 'boat' },
      ],
    },
    previewUpload('image', { admin: { width: '25%' } }),
    {
      name: 'gallery',
      type: 'array',
      admin: {
        width: '100%',
        description: 'Photos of the apartment. New images are also added to the website gallery (homepage shows the latest 4). Files over 700KB are resized first.',
        components: {
          Field: './src/components/payload/MediaGridField/index.jsx#MediaGridField',
        },
      },
      fields: [
        previewUpload('photo', { required: true, admin: { width: '50%' } }),
      ],
    },
  ],
}
