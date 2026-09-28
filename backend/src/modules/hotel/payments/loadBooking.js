const UNPAID_STATUSES = new Set(['unpaid', 'awaiting-manual-confirmation', 'failed'])

export async function loadBookingForPayment(payload, bookingId, expectedMethod) {
  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingId,
    overrideAccess: true,
  })

  if (!booking) return null

  if (expectedMethod && booking.paymentMethod !== expectedMethod) {
    // Guest may have started with a method that isn't connected yet
    // (Stripe/MoMo 501) and then switched. Allow that on unpaid
    // bookings so we don't force a second reservation.
    if (!UNPAID_STATUSES.has(booking.paymentStatus || 'unpaid')) return null
    await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: { paymentMethod: expectedMethod },
      overrideAccess: true,
    })
    booking.paymentMethod = expectedMethod
  }

  return booking
}

export function momoChargeAmount(booking) {
  const currency = (process.env.MOMO_CURRENCY || 'RWF').toUpperCase()
  const bookingCurrency = (booking.currency || 'USD').toUpperCase()
  if (currency === bookingCurrency) return { amount: booking.total, currency }

  const rate = Number(process.env.USD_TO_RWF)
  if (bookingCurrency === 'USD' && currency === 'RWF' && rate > 0) {
    return { amount: Math.round(booking.total * rate), currency: 'RWF' }
  }

  return { error: 'MoMo currency conversion is not configured (set USD_TO_RWF).' }
}
