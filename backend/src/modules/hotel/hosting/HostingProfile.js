export const HostingProfile = {
  slug: 'hosting-profile',
  label: 'Hosting',
  admin: {
    hidden: true,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: () => false,
  },
  fields: [
    { name: 'registrar', type: 'text' },
    { name: 'host', type: 'text' },
    { name: 'domain', type: 'text' },
    { name: 'hostingFee', type: 'number' },
    { name: 'hostingCurrency', type: 'text' },
    { name: 'supportFee', type: 'number' },
    { name: 'supportCurrency', type: 'text' },
    { name: 'invoiceCurrency', type: 'text' },
    { name: 'conversionRate', type: 'number' },
    { name: 'reminderEmail', type: 'text' },
    { name: 'renewalMonth', type: 'number' },
    { name: 'renewalDay', type: 'number' },
    { name: 'serviceLabel', type: 'text' },
    { name: 'note', type: 'textarea' },
    { name: 'preparedBy', type: 'text' },
    { name: 'lastReminderSweep', type: 'text' },
  ],
}
