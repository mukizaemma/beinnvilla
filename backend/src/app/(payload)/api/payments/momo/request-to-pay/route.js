import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../../payload.config.js'
import { requestToPay, MOMO_CONFIGURED } from '../../../../../../integrations/momo/momoClient.js'
import { withCors, handleOptions } from '../../../../../../core/security/cors.js'
import { loadBookingForPayment, momoChargeAmount } from '../../../../../../modules/hotel/payments/loadBooking.js'

export const OPTIONS = handleOptions

export async function POST(request) {
  if (!MOMO_CONFIGURED) {
    return withCors(
      NextResponse.json(
        { error: 'not-configured', message: 'Mobile Money is not connected yet.' },
        { status: 501 },
      ),
    )
  }

  const { bookingId, phoneNumber } = await request.json()
  if (!bookingId || !phoneNumber) {
    return withCors(
      NextResponse.json({ error: 'bookingId and phoneNumber are required' }, { status: 400 }),
    )
  }

  const payload = await getPayload({ config })
  const booking = await loadBookingForPayment(payload, bookingId, 'momo')
  if (!booking) {
    return withCors(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
  }

  const charge = momoChargeAmount(booking)
  if (charge.error) {
    return withCors(NextResponse.json({ error: 'not-configured', message: charge.error }, { status: 501 }))
  }

  const referenceId = randomUUID()

  try {
    await requestToPay({
      referenceId,
      amount: charge.amount,
      currency: charge.currency,
      externalId: bookingId,
      phoneNumber,
    })
  } catch (err) {
    return withCors(
      NextResponse.json({ error: 'MoMo request failed' }, { status: 502 }),
    )
  }

  await payload.update({
    collection: 'bookings',
    id: bookingId,
    data: { paymentMeta: { momoReferenceId: referenceId } },
    overrideAccess: true,
  })

  return withCors(NextResponse.json({ referenceId }))
}
