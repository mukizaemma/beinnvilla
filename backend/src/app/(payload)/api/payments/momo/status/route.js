import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../../payload.config.js'
import { checkRequestToPayStatus, MOMO_CONFIGURED } from '../../../../../../integrations/momo/momoClient.js'
import { withCors, handleOptions } from '../../../../../../core/security/cors.js'
import { loadBookingForPayment } from '../../../../../../modules/hotel/payments/loadBooking.js'

export const OPTIONS = handleOptions

export async function GET(request) {
  if (!MOMO_CONFIGURED) {
    return withCors(NextResponse.json({ error: 'not-configured' }, { status: 501 }))
  }

  const { searchParams } = new URL(request.url)
  const referenceId = searchParams.get('referenceId')
  const bookingId = searchParams.get('bookingId')
  if (!referenceId || !bookingId) {
    return withCors(
      NextResponse.json({ error: 'referenceId and bookingId are required' }, { status: 400 }),
    )
  }

  const payload = await getPayload({ config })
  const booking = await loadBookingForPayment(payload, bookingId, 'momo')
  if (!booking || booking.paymentMeta?.momoReferenceId !== referenceId) {
    return withCors(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
  }

  let status
  try {
    status = await checkRequestToPayStatus(referenceId)
  } catch {
    return withCors(
      NextResponse.json({ error: 'MoMo status check failed' }, { status: 502 }),
    )
  }

  if (status === 'SUCCESSFUL' || status === 'FAILED') {
    await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: { paymentStatus: status === 'SUCCESSFUL' ? 'paid' : 'failed' },
      overrideAccess: true,
    })
  }

  return withCors(NextResponse.json({ status }))
}
