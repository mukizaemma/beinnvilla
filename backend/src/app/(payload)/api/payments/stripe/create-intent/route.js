import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../../payload.config.js'
import { stripe, STRIPE_CONFIGURED } from '../../../../../../integrations/stripe/stripeClient.js'
import { withCors, handleOptions } from '../../../../../../core/security/cors.js'
import { loadBookingForPayment } from '../../../../../../modules/hotel/payments/loadBooking.js'

export const OPTIONS = handleOptions

export async function POST(request) {
  if (!STRIPE_CONFIGURED) {
    return withCors(
      NextResponse.json(
        { error: 'not-configured', message: 'Stripe is not connected yet.' },
        { status: 501 },
      ),
    )
  }

  const { bookingId } = await request.json()
  if (!bookingId) {
    return withCors(NextResponse.json({ error: 'bookingId is required' }, { status: 400 }))
  }

  const payload = await getPayload({ config })
  const booking = await loadBookingForPayment(payload, bookingId, 'stripe')
  if (!booking) {
    return withCors(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.total * 100),
    currency: (booking.currency || 'usd').toLowerCase(),
    metadata: { bookingId: String(bookingId) },
  })

  await payload.update({
    collection: 'bookings',
    id: bookingId,
    data: { paymentMeta: { stripePaymentIntentId: paymentIntent.id } },
    overrideAccess: true,
  })

  return withCors(NextResponse.json({ clientSecret: paymentIntent.client_secret }))
}
