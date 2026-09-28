export const SiteAudit = {
  slug: 'site-audit',
  label: 'Site audit',
  admin: {
    group: false,
    description: 'Live score of rooms, photos, facilities, company details, and page content.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'report',
      type: 'ui',
      admin: {
        components: {
          Field: './src/components/payload/SiteAuditReport/index.jsx#SiteAuditReport',
        },
      },
    },
  ],
}
