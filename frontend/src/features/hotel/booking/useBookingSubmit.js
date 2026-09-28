/**
 * BOOKING SUBMISSION
 * ─────────────────────────────────────────────────────────────
 * Two things happen for every booking, in order:
 *   1. The reservation is written to Payload — POST /api/bookings.
 *      This is the source of truth; nothing else matters if this fails.
 *   2. The guest is handed a receipt — either a pre-filled WhatsApp
 *      message to the hotel, or an EmailJS email (same service/template
 *      envs ContactForm already uses).
 *
 * Split into standalone pieces (createBookingRequest / sendReceipt)
 * rather than one monolithic submit(), because online payment methods
 * (Stripe/MoMo — see useStripePayment.js / useMomoPayment.js) need to
 * create the booking FIRST, then run a payment step against its id,
 * THEN send the receipt — only "pay at hotel" can do all of this in one
 * shot, which is what useBookingSubmit() below still does.
 *
 * Deliberately NOT using the shared `apiClient` for the POST: its
 * response interceptor toasts a generic "Could not reach the CMS —
 * some content may be out of date" on every failure, which is fine for
 * a read but actively misleading for a failed booking write. This uses
 * a plain axios call against the same CMS_URL so error states can show
 * copy that's actually accurate for a submission.
 *
 * `/api/bookings` likely doesn't exist yet on a fresh setup — a 404
 * here is treated as "not configured," same honest-failure pattern as
 * ContactForm, never a faked success.
 * ─────────────────────────────────────────────────────────────
 */
import { useState } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { CMS_URL } from '@lib/apiClient';
import { useSiteLayout } from '@lib/queries/useSiteLayout';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAIL_CONFIGURED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export function buildSummaryText({ rooms, experiences, stay, nights, guest, total }) {
  const roomLines = rooms
    .map((r) => `- ${r.name} (${stay.includeBreakfast ? 'with breakfast' : 'without breakfast'})`)
    .join('\n');
  const experienceLines = experiences.length
    ? `\nExperiences:\n${experiences.map((e) => `- ${e.name} ($${e.price})`).join('\n')}`
    : '';

  return [
    `New booking request — ${guest.firstName} ${guest.lastName}`,
    `Dates: ${stay.checkIn} → ${stay.checkOut} (${nights} night(s))`,
    `Stay:\n${roomLines}${experienceLines}`,
    `Total: $${total.toFixed(2)}`,
    `Mobile: ${guest.mobile}`,
    guest.email ? `Email: ${guest.email}` : null,
    guest.specialRequests ? `Special requests: ${guest.specialRequests}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * POSTs the reservation to Payload. Returns the created booking's id
 * on success. Throws an Error with `.code` set to 'not-configured' or
 * 'error' on failure — callers decide how to surface that.
 */
export async function createBookingRequest({ rooms, experiences, stay, guest, details, total }) {
  const payload = {
    rooms: rooms.map((r) => ({
      roomId: r.roomId,
      name: r.name,
      pricePerNight: r.pricePerNight,
    })),
    experiences: experiences.map((e) => ({
      experienceId: e.experienceId,
      name: e.name,
      price: e.price,
    })),
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: stay.adults,
    children: stay.children,
    includeBreakfast: Boolean(stay.includeBreakfast),
    guest: {
      firstName: guest.firstName,
      lastName: guest.lastName,
      mobile: guest.mobile,
      email: guest.email,
      country: guest.country,
      specialRequests: guest.specialRequests,
    },
    paymentMethod: details.paymentMethod,
    confirmationMethod: details.confirmationMethod,
    total,
    currency: 'USD',
  };

  try {
    const res = await axios.post(`${CMS_URL}/api/bookings`, payload, { timeout: 10000 });
    return res.data.doc.id;
  } catch (err) {
    const code = err.response?.status === 404 ? 'not-configured' : 'error';
    const wrapped = new Error(
      err.response?.data?.errors?.[0]?.message || `Booking submission failed (${code})`,
    );
    wrapped.code = code;
    throw wrapped;
  }
}

/**
 * Sends the guest a receipt via WhatsApp deep-link or EmailJS.
 * Returns true if it actually sent, false if it silently couldn't
 * (missing hotel WhatsApp number, EmailJS not configured, EmailJS
 * failure) — the booking is already saved either way, so this is
 * never treated as a submission failure, just a "no receipt" note.
 */
export async function sendReceipt({ company, confirmationMethod, summaryText, guest }) {
  if (confirmationMethod === 'whatsapp') {
    const hotelWhatsApp = (company?.phone || '').replace(/[^\d]/g, '');
    if (!hotelWhatsApp) return false;
    const url = `https://wa.me/${hotelWhatsApp}?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  if (!EMAIL_CONFIGURED) return false;
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: `${guest.firstName} ${guest.lastName}`,
        from_email: guest.email,
        message: summaryText,
      },
      { publicKey: PUBLIC_KEY },
    );
    return true;
  } catch {
    return false;
  }
}

// 'idle' | 'submitting' | 'success' | 'success-no-receipt' | 'error' | 'not-configured'
// Used for the simple "pay at hotel" path — create + receipt in one call.
// Stripe/MoMo drive createBookingRequest/sendReceipt directly instead,
// since they need a payment step in between.
export function useBookingSubmit() {
  const [status, setStatus] = useState('idle');
  const { data: layout } = useSiteLayout();
  const company = layout?.company;

  async function submit({ rooms, experiences, stay, nights, guest, details, total }) {
    setStatus('submitting');

    let bookingId;
    try {
      bookingId = await createBookingRequest({ rooms, experiences, stay, guest, details, total });
    } catch (err) {
      setStatus(err.code);
      return;
    }

    const summaryText = buildSummaryText({ rooms, experiences, stay, nights, guest, total });
    const sent = await sendReceipt({
      company,
      confirmationMethod: details.confirmationMethod,
      summaryText,
      guest,
    });
    setStatus(sent ? 'success' : 'success-no-receipt');
    return bookingId;
  }

  return { status, submit };
}