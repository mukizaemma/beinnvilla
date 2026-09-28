import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../payload.config.js'
import { withCors, handleOptions } from '../../../../../core/security/cors.js'
import { isValidEmail } from '../../../../../core/security/emailAddress.js'
import { sendStayEmail } from '../../../../../modules/hotel/reservations/notify.js'

export const OPTIONS = handleOptions

export async function POST(request) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return withCors(NextResponse.json({ error: 'Sign in required.' }, { status: 401 }))
    }

    const body = await request.json()
    const message = String(body.body || '').trim()
    if (!message) {
      return withCors(NextResponse.json({ error: 'Write a message first.' }, { status: 400 }))
    }

    const booking = await payload.findByID({
      collection: 'bookings',
      id: body.bookingId,
      depth: 0,
      overrideAccess: false,
      user,
    })
    const email = booking.guest?.email
    if (!isValidEmail(email)) {
      return withCors(NextResponse.json({ error: 'This guest has no valid email address.' }, { status: 400 }))
    }
    if (!process.env.RESEND_API_KEY) {
      return withCors(NextResponse.json({ error: 'Resend is not configured yet.' }, { status: 503 }))
    }

    const author = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Staff'
    const text = `BE Inn Villa\n\n${message}`
    await sendStayEmail(payload, {
      to: email,
      subject: `Your stay at BE Inn Villa — ${booking.guestName || 'reservation'}`,
      text,
    })

    const updated = await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        communications: [
          ...(booking.communications || []),
          {
            at: new Date().toISOString(),
            direction: 'outbound',
            channel: 'email',
            author,
            body: message,
          },
        ],
      },
      overrideAccess: false,
      user,
    })

    return withCors(NextResponse.json({ doc: updated }))
  } catch (error) {
    const message = error?.message || 'Could not send that email.'
    return withCors(NextResponse.json({ error: message }, { status: 500 }))
  }
}
