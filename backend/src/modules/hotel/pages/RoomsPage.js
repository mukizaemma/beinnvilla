import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const RoomsPage = {
  slug: 'rooms-page',
  label: 'The apartment',
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
    {
      name: 'highlights',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'select',
          admin: { width: '25%' },
          options: [
            { label: 'Bedrooms', value: 'bed' },
            { label: 'Bathrooms', value: 'bath' },
            { label: 'Kitchen', value: 'kitchen' },
            { label: 'Bar', value: 'bar' },
            { label: 'Air conditioning', value: 'ac' },
            { label: 'Hot water', value: 'hot-water' },
            { label: 'Boat', value: 'boat' },
            { label: 'Breakfast', value: 'breakfast' },
            { label: 'Wi-Fi', value: 'wifi' },
            { label: 'Parking', value: 'parking' },
            { label: 'Front desk', value: 'front-desk' },
          ],
        },
        { name: 'label', type: 'text', required: true, admin: { width: '75%' } },
      ],
    },
  ],
}
