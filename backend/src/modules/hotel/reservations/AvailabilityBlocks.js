import { APIError } from 'payload'
import { dayKey } from './availability.js'

export const AvailabilityBlocks = {
  slug: 'availability-blocks',
  labels: {
    singular: 'Closed dates',
    plural: 'Availability',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'label',
    defaultColumns: ['label', 'scope', 'startDate', 'reopenDate', 'active'],
    description: 'Stop website bookings when the property or a room type is full (groups, OTAs). One range is enough — you can open it again later.',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const start = dayKey(data.startDate)
        const reopen = dayKey(data.reopenDate)
        if (start && reopen && reopen <= start) {
          throw new APIError('“Guests can book from” must be after the first closed night.', 400)
        }
        if (data.scope === 'room' && !(data.rooms || []).length) {
          throw new APIError('Choose at least one room type to close.', 400)
        }
        const who = data.scope === 'hotel' ? 'Whole property' : 'Selected rooms'
        data.label = data.note?.trim() ? `${who} — ${data.note.trim()}` : who
        return data
      },
    ],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'hotel',
      admin: { width: '25%' },
      options: [
        { label: 'Whole property', value: 'hotel' },
        { label: 'Selected rooms', value: 'room' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        width: '25%',
        description: 'First night that is full.',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
    },
    {
      name: 'reopenDate',
      type: 'date',
      required: true,
      admin: {
        width: '25%',
        description: 'First check-in you will take again.',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Closed (website will not take these dates)',
    },
    {
      name: 'rooms',
      type: 'relationship',
      relationTo: 'rooms',
      hasMany: true,
      admin: {
        condition: (_, sibling) => sibling?.scope === 'room',
        description: 'Leave empty only when closing the whole hotel.',
      },
    },
    {
      name: 'note',
      type: 'text',
      admin: { width: '50%', description: 'Staff only, e.g. Football team / Booking.com' },
    },
    {
      name: 'guestMessage',
      type: 'textarea',
      admin: {
        description: 'Optional public line. If empty, guests see a simple “fully booked until…” message.',
      },
    },
  ],
}
