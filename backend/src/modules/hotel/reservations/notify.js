import { isValidEmail } from '../../../core/security/emailAddress.js'
import { dayKey } from './availability.js'

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function stayLines(booking) {
  const guest = booking.guest || {}
  const name = booking.guestName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim()
  const rooms = booking.roomsNeeded
    ? booking.roomsNeeded >= 20
      ? 'Whole house'
      : `${booking.roomsNeeded} room${booking.roomsNeeded === 1 ? '' : 's'}`
    : (booking.rooms || []).map((room) => room.name).join(', ')
  const facilities = (booking.facilities || []).map((row) => row.name).filter(Boolean)
  return [
    `Guest: ${name}`,
    `Email: ${guest.email || '—'}`,
    `Mobile: ${guest.mobile || '—'}`,
    `Stay: ${dayKey(booking.checkIn)} to ${dayKey(booking.checkOut)}`,
    `Guests: ${booking.partySize || booking.adults || '—'}`,
    `Space: ${rooms || '—'}`,
    facilities.length ? `Facilities: ${facilities.join(', ')}` : null,
    'Payment: at the hotel',
    guest.specialRequests ? `Notes: ${guest.specialRequests}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

function uniqueEmails(values) {
  const seen = new Set()
  const emails = []
  for (const value of values) {
    const email = String(value || '').trim()
    const key = email.toLowerCase()
    if (!isValidEmail(email) || seen.has(key)) continue
    seen.add(key)
    emails.push(email)
  }
  return emails
}

export async function sendStayEmail(payload, { to, subject, text }) {
  if (!isValidEmail(to)) return false
  const html = escapeHtml(text)
    .split('\n')
    .map((line) => `<p>${line || '&nbsp;'}</p>`)
    .join('')
  await payload.sendEmail({
    to,
    subject,
    text,
    html,
  })
  return true
}

export async function notifyStayRequest(payload, booking) {
  if (!process.env.RESEND_API_KEY) {
    payload.logger.warn('Reservation saved. RESEND_API_KEY is not set, so no email was sent.')
    return
  }

  const guestEmail = String(booking.guest?.email || '').trim()
  const text = stayLines(booking)
  const company = await payload.findGlobal({ slug: 'company', overrideAccess: true }).catch(() => null)
  const tasks = []

  if (isValidEmail(guestEmail)) {
    tasks.push(
      sendStayEmail(payload, {
        to: guestEmail,
        subject: 'Your stay request — BE Inn Villa',
        text: `We have your stay request at BE Inn Villa. Staff will confirm it. You pay at the hotel.\n\n${text}`,
      }),
    )
  }

  const adminEmails = uniqueEmails([process.env.BOOKING_NOTIFY_EMAIL, company?.email]).filter(
    (email) => email.toLowerCase() !== guestEmail.toLowerCase(),
  )
  for (const to of adminEmails) {
    tasks.push(
      sendStayEmail(payload, {
        to,
        subject: `New stay request — ${booking.guestName || 'Guest'}`,
        text: `A guest placed a stay request on the website.\n\n${text}`,
      }),
    )
  }

  if (!adminEmails.length) {
    payload.logger.warn('Reservation saved. No admin email is set on the company or BOOKING_NOTIFY_EMAIL.')
  }

  const results = await Promise.allSettled(tasks)
  const failed = results.filter((result) => result.status === 'rejected')
  if (failed.length) {
    payload.logger.error(
      `Stay email failed: ${failed.map((result) => result.reason?.message || 'unknown error').join('; ')}`,
    )
  }
}
