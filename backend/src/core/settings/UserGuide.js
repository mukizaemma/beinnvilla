export const UserGuide = {
  slug: 'user-guide',
  label: 'User Guide',
  admin: {
    group: false,
    description: 'Handover handbook for the Grand Villa team.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'handover',
      type: 'ui',
      admin: {
        components: {
          Field: './src/components/payload/UserGuideNote/index.jsx#UserGuideNote',
        },
      },
    },
  ],
}
