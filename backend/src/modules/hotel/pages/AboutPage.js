import { pageCopyImageFields, previewUpload, textContentBlock } from '../../../core/fields/pageHero.js'

export const AboutPage = {
  slug: 'about-page',
  label: 'About',
  admin: { group: false },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: pageCopyImageFields,
    },
    {
      name: 'story',
      type: 'group',
      fields: [
        textContentBlock([
          { name: 'eyebrow', type: 'text', admin: { width: '25%' } },
          {
            name: 'headline',
            type: 'text',
            admin: { width: '75%', className: 'hero-headline' },
          },
        ]),
        {
          name: 'paragraphs',
          type: 'array',
          minRows: 1,
          fields: [{ name: 'text', type: 'richText', required: true }],
        },
        { name: 'quote', type: 'text', admin: { width: '50%' } },
        previewUpload('image'),
      ],
    },
    {
      name: 'values',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          admin: { width: '25%' },
          options: [
            'heart', 'wallet', 'sparkles', 'handshake', 'home', 'sunrise',
          ].map((v) => ({ label: v, value: v })),
        },
        { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
        { name: 'description', type: 'richText' },
      ],
      admin: { description: 'The "What We Believe" value cards' },
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', admin: { width: '25%' } },
        { name: 'headline', type: 'text', admin: { width: '75%' } },
        { name: 'body', type: 'richText' },
        {
          name: 'button',
          type: 'group',
          label: 'Primary button',
          admin: { width: '50%', className: 'hero-cta-card' },
          fields: [
            { name: 'label', type: 'text', admin: { width: '50%' } },
            { name: 'path', type: 'text', admin: { width: '50%' } },
          ],
        },
        previewUpload('backgroundImage'),
      ],
    },
  ],
}