export const mediaPickerAdmin = {
  description: 'Create New to upload, or Choose from existing to pick from the Media library.',
}

export function mediaUpload(name, extra = {}) {
  const { admin: adminExtra, ...rest } = extra
  return {
    name,
    type: 'upload',
    relationTo: 'media',
    displayPreview: true,
    admin: { ...mediaPickerAdmin, ...adminExtra },
    ...rest,
  }
}

export function richTextField(name, extra = {}) {
  const { admin: adminExtra, ...rest } = extra
  return {
    name,
    type: 'richText',
    admin: {
      description: 'Formatted text — headings, bold, lists, and links.',
      ...adminExtra,
    },
    ...rest,
  }
}
