export function textContentBlock(fields = pageCopyFields) {
  return {
    type: 'collapsible',
    label: 'Text content',
    admin: { initCollapsed: false },
    fields,
  }
}

export function headerImageBlock(field = pageImageField) {
  return {
    type: 'collapsible',
    label: 'Header image',
    admin: { initCollapsed: false },
    fields: [field],
  }
}

export function buttonsBlock(fields = pageCtaFields) {
  return {
    type: 'collapsible',
    label: 'Buttons',
    admin: { initCollapsed: false },
    fields,
  }
}

export const pageCtaFields = [
  {
    name: 'cta',
    type: 'group',
    label: 'Primary button',
    admin: { width: '50%', className: 'hero-cta-card' },
    fields: [
      { name: 'label', type: 'text', admin: { width: '50%' } },
      { name: 'path', type: 'text', admin: { width: '50%' } },
    ],
  },
  {
    name: 'secondaryCta',
    type: 'group',
    label: 'Secondary button',
    admin: { width: '50%', className: 'hero-cta-card' },
    fields: [
      { name: 'label', type: 'text', admin: { width: '50%' } },
      { name: 'path', type: 'text', admin: { width: '50%' } },
    ],
  },
]

export const pageCopyFields = [
  { name: 'eyebrow', type: 'text', admin: { width: '25%' } },
  {
    name: 'headline',
    type: 'text',
    admin: { width: '75%', className: 'hero-headline' },
  },
  { name: 'intro', type: 'richText' },
]

export function previewUpload(name, extra = {}) {
  const { admin: adminExtra, ...rest } = extra
  return {
    name,
    type: 'upload',
    relationTo: 'media',
    displayPreview: true,
    admin: {
      width: '50%',
      className: 'hero-image-upload',
      description: 'Full-screen header. Upload a new picture or choose one from the library.',
      components: {
        Field: './src/components/payload/HeroImageField/index.jsx#HeroImageField',
      },
      ...adminExtra,
    },
    ...rest,
  }
}

export const pageImageField = previewUpload('backgroundImage')

export const pageHeroFields = [
  textContentBlock(),
  headerImageBlock(),
  buttonsBlock(),
]

export const pageCopyImageFields = [textContentBlock(), headerImageBlock()]
