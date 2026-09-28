import {
  buttonsBlock,
  headerImageBlock,
  pageCopyFields,
  previewUpload,
  textContentBlock,
} from '../../../core/fields/pageHero.js'

export const BarRestaurantPage = {
  slug: 'bar-restaurant-page',
  label: 'Kitchen & bar',
  admin: { group: false },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        textContentBlock(pageCopyFields),
        headerImageBlock(previewUpload('backgroundImage')),
        buttonsBlock(),
        {
          name: 'videoUrl',
          type: 'upload',
          relationTo: 'media',
          displayPreview: true,
          filterOptions: {
            mimeType: {
              contains: 'video/',
            },
          },
          admin: { width: '50%', description: 'Choose an existing video or upload a new one.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Home page section',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'homeSpotlight',
          type: 'group',
          label: false,
          admin: {
            description: 'Headline, highlights, and photos shown on the public home page.',
          },
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'In-house', admin: { width: '25%' } },
            {
              name: 'headline',
              type: 'text',
              defaultValue: 'Kitchen and a private bar',
              admin: { width: '75%', className: 'hero-headline' },
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Cook in the apartment kitchen. The bar is for your group staying in the villa — not a public hotel restaurant.',
              admin: { width: '100%' },
            },
            {
              name: 'features',
              type: 'array',
              maxRows: 3,
              labels: { singular: 'Highlight', plural: 'Highlights' },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'food',
                  admin: { width: '25%' },
                  options: [
                    { label: 'Kitchen', value: 'food' },
                    { label: 'Private bar', value: 'drinks' },
                    { label: 'Breakfast', value: 'coffee' },
                  ],
                },
                { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
                { name: 'text', type: 'textarea', admin: { width: '100%' } },
              ],
            },
            {
              name: 'images',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Photo', plural: 'Photos' },
              admin: {
                description: 'Up to four photos on the home restaurant section. Add several at once.',
                components: {
                  Field: './src/components/payload/MediaGridField/index.jsx#MediaGridField',
                },
              },
              fields: [previewUpload('image')],
            },
            {
              name: 'cta',
              type: 'group',
              label: 'Button',
              admin: { width: '50%', className: 'hero-cta-card' },
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Kitchen & bar', admin: { width: '50%' } },
                { name: 'path', type: 'text', defaultValue: '/bar-restaurant', admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'hours',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'select',
          admin: { width: '25%' },
          options: [
            { label: 'Breakfast', value: 'breakfast' },
            { label: 'Restaurant & Bar', value: 'restaurant-bar' },
          ],
        },
        { name: 'label', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'hours', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'panels',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'description', type: 'richText' },
        previewUpload('backgroundImage', { admin: { width: '50%' } }),
      ],
      admin: { description: 'The stacked parallax panels' },
    },
    {
      name: 'menu',
      type: 'group',
      admin: {
        description: 'Section title only. Dishes are edited under Menu items in the sidebar.',
      },
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'The menu', admin: { width: '25%' } },
        {
          name: 'headline',
          type: 'text',
          defaultValue: 'Eat and drink with us',
          admin: { width: '75%' },
        },
      ],
    },
    {
      name: 'video',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', admin: { width: '25%' } },
        { name: 'headline', type: 'text', admin: { width: '75%' } },
        { name: 'videoUrl', type: 'text', admin: { width: '50%' } },
        previewUpload('backgroundImage', { admin: { width: '50%' } }),
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'headline', type: 'text', defaultValue: 'Ready to reserve your table?', admin: { width: '50%' } },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Reserve a Table', admin: { width: '25%' } },
        { name: 'buttonPath', type: 'text', defaultValue: '/contact', admin: { width: '25%' } },
        { name: 'body', type: 'richText' },
      ],
    },
  ],
}
