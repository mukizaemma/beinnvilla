// Stripe POSTs here directly (not the frontend) on payment_intent events.
// Signature verification needs the raw request body — request.text()
// in an App Router route handler reads the unparsed body, which is
// exactly what stripe.webhooks.constructEvent expects.
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../../payload.config.js'
import { stripe, STRIPE_CONFIGURED } from '../../../../../../integrations/stripe/stripeClient.js'

export async function POST(request) {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json({ error: 'not-configured' }, { status: 501 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    // Signature didn't verify — never trust an unverified payload,
    // regardless of what it claims.
    return NextResponse.json({ error: `Webhook signature invalid: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object
    const bookingId = paymentIntent.metadata?.bookingId

    if (bookingId) {
      const payload = await getPayload({ config })
      await payload.update({
        collection: 'bookings',
        id: bookingId,
        data: {
          paymentStatus: event.type === 'payment_intent.succeeded' ? 'paid' : 'failed',
        },
        overrideAccess: true,
      })
    }
  }

  // Ack quickly regardless of event type — Stripe retries on non-2xx,
  // and there's nothing else here worth reacting to yet.
  return NextResponse.json({ received: true })
}