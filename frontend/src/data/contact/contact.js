/**
 * CONTACT PAGE DATA
 * ─────────────────────────────────────────────────────────────
 * Address/phone/email/map link are NOT duplicated here — they live in
 * @data/company.js (shared with Footer and HomeCTA) and ContactInfo.jsx
 * imports them directly. This file only holds content specific to the
 * Contact page itself.
 * ─────────────────────────────────────────────────────────────
 */

export const contactHero = {
  eyebrow: 'Get In Touch',
  headline: "Let's Plan Your Stay",
  intro:
    "Questions, special requests, or ready to book — send us a message and we'll reply within 24 hours.",
}

export const contactInfo = {
  responseNote: "We'll get back to you within 24 hours.",
  frontDeskNote: 'Front desk available 24/7',
}

export const contactFormLabels = {
  name: 'Your Name',
  email: 'Email Address',
  phone: 'Phone Number (optional)',
  checkIn: 'Check-In Date',
  checkOut: 'Check-Out Date',
  guests: 'Number of Guests',
  roomType: 'Room Type',
  roomTypeDefault: 'No preference / not sure yet',
  message: 'Your Message',
  messagePlaceholder: 'Tell us about your stay, questions, or special requests\u2026',
  submit: 'Send Inquiry',
  submitting: 'Sending\u2026',
}