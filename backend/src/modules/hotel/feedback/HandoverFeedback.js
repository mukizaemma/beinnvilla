import { APIError } from 'payload'
import { assertPublicFormRateLimit } from '../../../core/security/rateLimit.js'

export const HandoverFeedback = {
  slug: 'handover-feedback',
  labels: {
    singular: 'Handover note',
    plural: 'Handover feedback',
  },
  admin: {
    group: false,
    useAsTitle: 'section',
    defaultColumns: ['section', 'name', 'createdAt'],
    description: 'Notes sent from the /handover guide.',
  },
  hooks: {
    beforeValidate: [
      ({ req, operation, data }) => {
        if (operation === 'create' && !req.user && !assertPublicFormRateLimit(req)) {
          throw new APIError('Please wait a few minutes before sending another note.', 429)
        }
        return data
      },
    ],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '25%' } },
    { name: 'email', type: 'email', required: true, admin: { width: '25%' } },
    {
      name: 'section',
      type: 'select',
      required: true,
      admin: { width: '25%' },
      options: [
        { label: 'Overall', value: 'overview' },
        { label: 'Sign in', value: 'access' },
        { label: 'Site setting', value: 'settings' },
        { label: 'Pages', value: 'pages' },
        { label: 'Rooms', value: 'rooms' },
        { label: 'Facilities', value: 'amenities' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Bookings', value: 'bookings' },
        { label: 'Site audit', value: 'audit' },
        { label: 'Feedback', value: 'feedback' },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
  ],
}
