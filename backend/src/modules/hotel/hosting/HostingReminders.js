export const HostingReminders = {
  slug: 'hosting-reminders',
  labels: {
    singular: 'Hosting reminder',
    plural: 'Hosting reminders',
  },
  admin: {
    hidden: true,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'invoice', type: 'relationship', relationTo: 'hosting-invoices', required: true },
    {
      name: 'milestone',
      type: 'select',
      required: true,
      options: [
        { label: '30 days', value: '30' },
        { label: '15 days', value: '15' },
        { label: 'Renewal day', value: 'renewal' },
        { label: 'Overdue', value: 'overdue' },
      ],
    },
    { name: 'sentAt', type: 'date', required: true },
  ],
}
