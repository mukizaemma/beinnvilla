export const GalleryPhotos = {
  slug: 'gallery-photos',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Gallery photo',
    plural: 'Site Gallery',
  },
  admin: {
    group: false,
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'category', 'photo'],
    description: 'Legacy gallery rows. The public Gallery now uses Media files marked Show on gallery.',
  },
  fields: [
    {
      name: 'category',
      type: 'select',
      required: true,
      admin: { width: '25%' },
      options: [
        { label: 'None — do not show', value: 'none' },
        { label: 'The apartment', value: 'rooms' },
        { label: 'Kitchen & bar', value: 'bar-restaurant' },
        { label: 'Property & views', value: 'lake-grounds' },
        { label: 'Amenities', value: 'amenities' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
      required: true,
      admin: { width: '50%' },
    },
    {
      name: 'aspect',
      type: 'select',
      defaultValue: 'square',
      admin: {
        width: '25%',
        description: 'Controls the masonry tile height on the Gallery page',
      },
      options: [
        { label: 'Tall', value: 'tall' },
        { label: 'Square', value: 'square' },
        { label: 'Wide', value: 'wide' },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      displayPreview: true,
      admin: { description: 'Create New to upload, or Choose from existing in the Media library.' },
    },
  ],
}
