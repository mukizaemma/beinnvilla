import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { useContactPage } from '@lib/queries/useContactPage'
import { useCartActions } from '@lib/cart/CartContext'
import { CONTACT_FORM_LABELS as L } from '@features/hotel/contact/labels'
import { useAvailability } from '@lib/queries/useAvailability'
import { findBlockingClosure, guestClosureMessage } from '@features/hotel/availability'
import StayDatePicker from '@components/hotel/StayDatePicker'
import styles from './ContactForm.module.css'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const IS_CONFIGURED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
const BOOKING_KEY = 'gv-booking-stay'

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const days = Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

function persistBookingDraft({ stay, guest }) {
  try {
    const raw = sessionStorage.getItem(BOOKING_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    sessionStorage.setItem(
      BOOKING_KEY,
      JSON.stringify({
        ...parsed,
        step: 1,
        stay: { ...(parsed.stay || {}), ...stay },
        guest: { ...(parsed.guest || {}), ...guest },
      }),
    )
  } catch {
    /* booking page still works without the draft */
  }
}

export default function ContactForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledRoom = searchParams.get('room') || ''
  const { data: layout } = useSiteLayout()
  const { data: page } = useContactPage()
  const { addRoom } = useCartActions()
  const { data: closures = [] } = useAvailability()
  const company = layout.company
  const rooms = page.rooms || []

  const [intent, setIntent] = useState(prefilledRoom ? 'book' : 'enquiry')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    roomType: prefilledRoom,
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [closedMessage, setClosedMessage] = useState('')

  const nights = useMemo(() => nightsBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut])
  const booking = intent === 'book'

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function guestPayload() {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      specialRequests: form.message.trim(),
    }
  }

  function stayPayload() {
    return {
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: Math.max(1, Number(form.adults) || 1),
      children: Math.max(0, Number(form.children) || 0),
    }
  }

  function goToBooking() {
    const stay = stayPayload()
    if (!stay.checkIn || !stay.checkOut || nights <= 0) {
      setStatus('dates')
      return
    }
    const blocked = findBlockingClosure(closures, {
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      roomSlugs: form.roomType ? [form.roomType] : [],
    })
    if (blocked) {
      setStatus('closed')
      setClosedMessage(guestClosureMessage(blocked))
      return
    }
    persistBookingDraft({ stay, guest: guestPayload() })
    const room = rooms.find((item) => item.id === form.roomType)
    if (room) addRoom(room)
    navigate(room ? '/book' : '/accommodation')
  }

  async function sendEnquiry(event) {
    event.preventDefault()
    if (booking) {
      goToBooking()
      return
    }

    if (!IS_CONFIGURED) {
      setStatus('not-configured')
      return
    }

    setStatus('sending')
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: `${form.firstName} ${form.lastName}`.trim(),
          from_email: form.email,
          phone: form.mobile,
          check_in: form.checkIn || '—',
          check_out: form.checkOut || '—',
          guests: `${form.adults} adults${Number(form.children) ? `, ${form.children} children` : ''}`,
          room_type: rooms.find((item) => item.id === form.roomType)?.name || 'General enquiry',
          message: form.message,
        },
        { publicKey: PUBLIC_KEY },
      )
      setStatus('success')
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        checkIn: '',
        checkOut: '',
        adults: 2,
        children: 0,
        roomType: '',
        message: '',
      })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className={styles.form} onSubmit={sendEnquiry}>
      <div className={styles.heading}>
        <h3>{booking ? L.bookTitle : L.enquiryTitle}</h3>
        <p>{booking ? L.bookLead : L.enquiryLead}</p>
      </div>

      <div className={styles.intent} role="tablist" aria-label="Enquiry or booking">
        <button
          type="button"
          role="tab"
          aria-selected={!booking}
          className={!booking ? styles.intentActive : styles.intentBtn}
          onClick={() => {
            setIntent('enquiry')
            setStatus('idle')
          }}
        >
          {L.intentEnquiry}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={booking}
          className={booking ? styles.intentActive : styles.intentBtn}
          onClick={() => {
            setIntent('book')
            setStatus('idle')
          }}
        >
          {L.intentBook}
        </button>
      </div>

      <div className={styles.row}>
        <label>
          {L.firstName} *
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
        </label>
        <label>
          {L.lastName} *
          <input name="lastName" value={form.lastName} onChange={handleChange} required />
        </label>
      </div>

      <div className={styles.row}>
        <label>
          {L.mobile} *
          <input
            type="tel"
            name="mobile"
            placeholder="+250 7XX XXX XXX"
            value={form.mobile}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          {L.email}
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </label>
      </div>

      <div className={styles.calendar}>
        <StayDatePicker
          checkIn={form.checkIn}
          checkOut={form.checkOut}
          closures={closures}
          roomSlugs={form.roomType ? [form.roomType] : []}
          onChange={(next) => setForm((current) => ({ ...current, ...next }))}
        />
      </div>

      <div className={styles.stay}>
        <label>
          {L.adults}
          {booking ? ' *' : ''}
          <input
            type="number"
            name="adults"
            min="1"
            value={form.adults}
            onChange={handleChange}
            required={booking}
          />
        </label>
        <label>
          {L.children}
          <input type="number" name="children" min="0" value={form.children} onChange={handleChange} />
        </label>
      </div>

      {nights > 0 && (
        <span className={styles.nights}>
          {nights} {nights === 1 ? 'night' : 'nights'}
        </span>
      )}
      {form.checkIn && form.checkOut && nights <= 0 && (
        <p className={styles.dateError}>Check-out must be after check-in.</p>
      )}

      <label>
        {L.roomType}
        {booking ? '' : ' (optional)'}
        <select name="roomType" value={form.roomType} onChange={handleChange}>
          <option value="">{booking ? L.roomTypeDefault : 'No room — just a question'}</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} — from ${room.pricePerNight}/night
            </option>
          ))}
        </select>
      </label>

      <label>
        {booking ? L.requests : `${L.message} *`}
        <textarea
          name="message"
          rows={4}
          required={!booking}
          placeholder={booking ? L.requestsPlaceholder : L.messagePlaceholder}
          value={form.message}
          onChange={handleChange}
        />
      </label>

      {booking ? (
        <button type="submit" className={styles.submit}>
          {L.continueBook}
        </button>
      ) : (
        <button type="submit" className={styles.submit} disabled={status === 'sending'}>
          <Send size={16} />
          {status === 'sending' ? L.submitting : L.submit}
        </button>
      )}

      <button
        type="button"
        className={styles.switch}
        onClick={() => {
          setIntent(booking ? 'enquiry' : 'book')
          setStatus('idle')
        }}
      >
        {booking ? L.switchEnquiry : L.switchBook}
      </button>

      {status === 'dates' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          Choose a check-in and check-out date, then continue.
        </p>
      )}

      {status === 'closed' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          {closedMessage || 'Those dates are fully booked.'}
        </p>
      )}

      {status === 'success' && (
        <p className={styles.statusSuccess}>
          <CheckCircle2 size={16} />
          Thanks — your message is on its way. We will reply within 24 hours.
        </p>
      )}

      {status === 'error' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          Something went wrong sending that. Please try again, or reach us at{' '}
          <a href={`mailto:${company.email}`}>{company.email}</a>
          {company.phone ? (
            <>
              {' '}
              or <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
            </>
          ) : null}
          .
        </p>
      )}

      {status === 'not-configured' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          This form is not connected yet — please reach us at{' '}
          <a href={`mailto:${company.email}`}>{company.email}</a>
          {company.phone ? (
            <>
              {' '}
              or <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
            </>
          ) : null}
          .
        </p>
      )}
    </form>
  )
}
