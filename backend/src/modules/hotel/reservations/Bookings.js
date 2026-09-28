import { APIError } from 'payload'
import { isValidEmail } from '../../../core/security/emailAddress.js'
import { assertBookingCreateRateLimit } from '../../../core/security/rateLimit.js'
import {
  buildHouseCalendar,
  dayKey,
  eachNight,
  findUnavailableStay,
  loadHouse,
  roomsForGuests,
} from './availability.js'
import { notifyStayRequest } from './notify.js'
import { calcStayTotal, nightlyRate, nightsBetween } from './pricing.js'

// Receives POST /api/bookings from the frontend's booking flow
// (see useBookingSubmit.js). Rooms are snapshotted (roomId/name/
// pricePerNight) rather than related, so a booking's historical price
// stays correct even if the room's live rate changes later.
//
// Unlike every other collection here, guests submitting a booking are
// NOT authenticated — so `create` is public, but `read`/`update`/
// `delete` are restricted to logged-in staff (Users). `status` is
// separately locked down at the field level so a guest's own request
// can't set itself to "confirmed."
export const Bookings = {
  slug: 'bookings',
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: false,
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'confirmationMethod', 'checkIn', 'checkOut', 'status'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'create' && !req.user && !assertBookingCreateRateLimit(req)) {
          throw new APIError('Too many booking attempts. Please wait a few minutes and try again.', 429)
        }

        const checkIn = data.checkIn ?? originalDoc?.checkIn
        const checkOut = data.checkOut ?? originalDoc?.checkOut
        const nights = nightsBetween(checkIn, checkOut)
        if (checkIn && checkOut && nights < 1) {
          throw new APIError('Check-out must be after check-in.', 400)
        }

        const guestEmail = String(data.guest?.email ?? originalDoc?.guest?.email ?? '').trim()
        const publicCreate = operation === 'create' && !req.user
        if (publicCreate) {
          if (!isValidEmail(guestEmail)) {
            throw new APIError('Enter a valid email address.', 400)
          }
          if (dayKey(checkIn) < dayKey(new Date())) {
            throw new APIError('Choose a date from today onward.', 400)
          }
          data.paymentMethod = 'pay-at-hotel'
          data.guest = { ...(data.guest || {}), email: guestEmail }
        }

        const incomingRooms = data.rooms ?? originalDoc?.rooms ?? []
        const houseStay = !incomingRooms.length || incomingRooms.every((row) => !row.roomId || row.roomId === 'house')

        if (houseStay && checkIn && checkOut) {
          const house = await loadHouse(req.payload)
          const guests = Number(data.partySize ?? originalDoc?.partySize ?? data.adults ?? originalDoc?.adults) || 0
          if (guests < 1) {
            if (publicCreate) throw new APIError('Tell us how many guests are staying.', 400)
            return data
          }
          const needed = roomsForGuests(guests, house.guestsPerRoom)
          if (needed > house.roomCount) {
            throw new APIError(`The house can host ${house.maxGuests} guests.`, 409)
          }
          const calendar = await buildHouseCalendar(req.payload, {
            from: checkIn,
            to: checkOut,
            ignoreBookingId: originalDoc?.id,
          })
          const blocked = eachNight(checkIn, checkOut).find((night) => {
            const day = calendar.nights.find((row) => row.date === night)
            return !day || day.closed || day.guestsLeft < guests
          })
          if (blocked) {
            throw new APIError('The house cannot host that many guests on those dates.', 409)
          }

          const requested = data.facilities ?? originalDoc?.facilities ?? []
          let liveFacilities = { docs: [] }
          try {
            liveFacilities = await req.payload.find({
              collection: 'facilities',
              limit: 100,
              depth: 0,
              overrideAccess: true,
            })
          } catch {
            liveFacilities = { docs: [] }
          }
          const bySlug = new Map((liveFacilities.docs || []).map((doc) => [doc.slug, doc]))
          if (bySlug.size) {
            data.facilities = requested.map((row) => {
              const live = bySlug.get(row.facilityId)
              if (!live || live.available === false) {
                throw new APIError(`${row.name || row.facilityId} is not available for those dates.`, 409)
              }
              return { facilityId: live.slug, name: live.name, audience: live.audience || 'visitors' }
            })
            const held = calendar.facilities || []
            for (const row of data.facilities) {
              if (row.audience !== 'exclusive') continue
              const info = held.find((item) => item.id === row.facilityId)
              const clash = eachNight(checkIn, checkOut).find((night) => info?.heldDates?.includes(night))
              if (clash) {
                throw new APIError(`${row.name} is already held until that group checks out.`, 409)
              }
            }
          } else {
            data.facilities = requested.map((row) => ({
              facilityId: row.facilityId,
              name: row.name,
              audience: row.audience === 'exclusive' ? 'exclusive' : 'visitors',
            }))
          }

          data.partySize = guests
          data.roomsNeeded = needed
          data.adults = Number(data.adults || guests)
          data.children = Number(data.children || 0)
          data.rooms = [
            {
              roomId: 'house',
              name: needed >= house.roomCount ? 'Whole house' : `${needed} room${needed === 1 ? '' : 's'}`,
              pricePerNight: 0,
            },
          ]
          data.total = Number(data.total) || 0
          data.currency = data.currency || 'USD'
          return data
        }

        if (!incomingRooms.length) return data

        const slugs = incomingRooms.map((row) => row.roomId).filter((slug) => slug && slug !== 'house')
        if (checkIn && checkOut && slugs.length) {
          const unavailable = await findUnavailableStay(req.payload, {
            checkIn,
            checkOut,
            roomSlugs: slugs,
          })
          if (unavailable) {
            throw new APIError(unavailable, 409)
          }
        }
        const liveRooms = await req.payload.find({
          collection: 'rooms',
          where: { slug: { in: slugs } },
          limit: 100,
          overrideAccess: true,
        })
        const roomBySlug = new Map(liveRooms.docs.map((doc) => [doc.slug, doc]))

        data.rooms = incomingRooms.map((row) => {
          const live = roomBySlug.get(row.roomId)
          if (!live) {
            throw new APIError(`Apartment "${row.roomId}" is not available.`, 400)
          }
          return {
            ...row,
            name: live.name,
            pricePerNight: nightlyRate(live, Boolean(data.includeBreakfast)),
          }
        })

        const incomingExperiences = data.experiences ?? originalDoc?.experiences ?? []
        if (incomingExperiences.length) {
          const expSlugs = incomingExperiences.map((row) => row.experienceId).filter(Boolean)
          const liveExperiences = await req.payload.find({
            collection: 'experiences',
            where: { slug: { in: expSlugs } },
            limit: 100,
            overrideAccess: true,
          })
          const expBySlug = new Map(liveExperiences.docs.map((doc) => [doc.slug, doc]))
          data.experiences = incomingExperiences.map((row) => {
            const live = expBySlug.get(row.experienceId)
            if (!live) {
              throw new APIError(`Experience "${row.experienceId}" is not available.`, 400)
            }
            return {
              ...row,
              name: live.name,
              price: live.price,
            }
          })
        }

        if (nights > 0) {
          data.includeBreakfast = Boolean(data.includeBreakfast)
          data.total = calcStayTotal(
            liveRooms.docs.map((doc) => ({
              pricePerNight: doc.pricePerNight,
              priceWithBreakfast: doc.priceWithBreakfast,
              monthlyRate: doc.monthlyRate,
            })),
            nights,
            data.experiences || [],
            { includeBreakfast: data.includeBreakfast },
          )
          data.currency = data.currency || 'USD'
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        // Computed display title for the admin list — Payload's
        // useAsTitle needs a real stored field, not a nested group path.
        const first = data.guest?.firstName || ''
        const last = data.guest?.lastName || ''
        data.guestName = `${first} ${last}`.trim() || 'Guest'

        // Western Union has no real-time confirmation (see the
        // paymentMethod options below) — a fresh WU booking should read
        // as "waiting on staff to verify," not the generic "unpaid"
        // every other method starts as. Only applied on create, so a
        // staff member manually setting paymentStatus afterwards is
        // never silently overwritten by this hook.
        if (operation === 'create' && data.paymentMethod === 'western-union') {
          data.paymentStatus = 'awaiting-manual-confirmation'
        }

        if (Array.isArray(data.communications)) {
          data.communications = data.communications.map((row) => ({
            ...row,
            at: row.at || new Date().toISOString(),
            author: row.author || req.user?.email || 'Staff',
          }))
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || req.user) return doc
        try {
          await notifyStayRequest(req.payload, doc)
        } catch (error) {
          req.payload.logger.error(`Stay notification failed: ${error?.message || 'unknown error'}`)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'guestName',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true, // shown as the row title instead — see useAsTitle above
      },
    },
    {
      name: 'rooms',
      type: 'array',
      admin: {
        description: 'House stays are stored as one line: the whole house, or the rooms the group needs.',
      },
      fields: [
        { name: 'roomId', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'pricePerNight', type: 'number', required: true, admin: { width: '25%' } },
      ],
    },
    {
      name: 'includeBreakfast',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        width: '25%',
        description: 'Uses the with-breakfast nightly rate when the stay is shorter than a month.',
      },
    },
    {
      name: 'experiences',
      type: 'array',
      admin: {
        description: 'Snapshotted at booking time — not a live relation to Experiences.',
      },
      fields: [
        { name: 'experienceId', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'price', type: 'number', required: true, admin: { width: '25%' } },
      ],
    },
    {
      name: 'checkIn',
      type: 'date',
      required: true,
      admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'checkOut',
      type: 'date',
      required: true,
      admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'adults',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
      admin: { width: '25%' },
    },
    {
      name: 'children',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { width: '25%' },
    },
    {
      name: 'partySize',
      type: 'number',
      min: 1,
      admin: { width: '25%', description: 'Guests in this stay. Rooms are worked out from this number.' },
    },
    {
      name: 'roomsNeeded',
      type: 'number',
      min: 1,
      admin: { width: '25%', description: 'Rooms this party needs. The whole house when this matches the room count.' },
    },
    {
      name: 'facilities',
      type: 'array',
      admin: { description: 'Facilities the guest asked to use during the stay.' },
      fields: [
        { name: 'facilityId', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'audience',
          type: 'select',
          admin: { width: '25%' },
          options: [
            { label: 'Held with the stay', value: 'exclusive' },
            { label: 'Also open to visitors', value: 'visitors' },
          ],
        },
      ],
    },
    {
      name: 'guest',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text', admin: { width: '25%' } },
        { name: 'lastName', type: 'text', admin: { width: '25%' } },
        { name: 'mobile', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'email', type: 'text', admin: { width: '25%' } },
        { name: 'country', type: 'text', admin: { width: '25%' } },
        { name: 'specialRequests', type: 'textarea', admin: { width: '75%' } },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'pay-at-hotel',
      admin: { width: '25%' },
      options: [
        { label: 'Pay on arrival', value: 'pay-at-hotel' },
        { label: 'Card (Stripe)', value: 'stripe' },
        { label: 'Mobile Money (MTN MoMo)', value: 'momo' },
        { label: 'Western Union', value: 'western-union' },
      ],
    },
    {
      name: 'confirmationMethod',
      type: 'select',
      required: true,
      admin: { width: '25%' },
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Email', value: 'email' },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        width: '25%',
        description: 'Recalculated on the server from live room/experience prices × nights.',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      admin: {
        width: '25%',
        description: 'Display/charge currency. Stripe uses USD; MoMo uses RWF with USD_TO_RWF when set.',
      },
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'RWF', value: 'RWF' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      access: {
        // A guest's own create request can never set this — Payload
        // falls back to defaultValue ('pending') whenever this returns
        // false, regardless of what the client sent. Staff can still
        // change it afterwards through the admin UI (update access
        // below is unrestricted for logged-in users).
        create: () => false,
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      access: {
        // Same reasoning as `status` — a guest's request can never mark
        // its own payment as "paid." Stripe/MoMo only ever get flipped
        // to 'paid' by their respective webhook/status routes, which use
        // Payload's Local API (payload.update(...)) and so bypass this
        // access check by design — see the payments API routes.
        create: () => false,
      },
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        // Western Union only — see paymentMethod notes above.
        { label: 'Awaiting Manual Confirmation', value: 'awaiting-manual-confirmation' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentMeta',
      type: 'group',
      access: {
        create: () => false,
      },
      admin: {
        position: 'sidebar',
        description: 'Provider references — filled in by the payment routes, not the booking form.',
      },
      fields: [
        { name: 'stripePaymentIntentId', type: 'text', admin: { readOnly: true } },
        { name: 'momoReferenceId', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'communications',
      type: 'array',
      labels: { singular: 'Message', plural: 'Conversation' },
      access: {
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
      },
      admin: {
        description:
          'Replies and notes for this reservation. Log guest WhatsApp/email replies here so management can review the full conversation.',
      },
      fields: [
        {
          name: 'at',
          type: 'date',
          admin: { width: '25%', date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'direction',
          type: 'select',
          required: true,
          defaultValue: 'note',
          admin: { width: '25%' },
          options: [
            { label: 'Sent to guest', value: 'outbound' },
            { label: 'Guest reply', value: 'inbound' },
            { label: 'Internal note', value: 'note' },
          ],
        },
        {
          name: 'channel',
          type: 'select',
          required: true,
          defaultValue: 'internal',
          admin: { width: '25%' },
          options: [
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Email', value: 'email' },
            { label: 'Internal', value: 'internal' },
          ],
        },
        { name: 'author', type: 'text', admin: { width: '25%' } },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
  ],
}