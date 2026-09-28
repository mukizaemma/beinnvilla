export const Navigation = {
  slug: 'navigation',
  admin: {
    hidden: true,
    group: 'Settings',
    description: 'Unused on the public site — header links come from the Grand Villa nav.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'primaryNav',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'path', type: 'text', required: true, admin: { width: '75%' } },
      ],
    },
    {
      name: 'navCTA',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'path', type: 'text', required: true, admin: { width: '75%' } },
      ],
    },
  ],
}
