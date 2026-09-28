import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { CMS_URL } from '@lib/apiClient'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { useFacilities } from '@features/hotel/queries/useFacilities'
import { useHouseCalendar } from '@features/hotel/queries/useHouseCalendar'
import { isValidEmail } from '@features/hotel/email'
import { addDays, facilityOpen, roomsForGuests, stayCapacity } from '@features/hotel/house'
import { clearStayDraft, draftFromSearch, emptyStayDraft, readStayDraft, writeStayDraft } from '@features/hotel/stayDraft'
import HouseCalendar from './HouseCalendar'
import styles from './HouseStayForm.module.css'

function formatStayDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function stayNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const [y1, m1, d1] = checkIn.split('-').map(Number)
  const [y2, m2, d2] = checkOut.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}

export default function HouseStayForm({ anchor = '', showHeading = true }) {
  const [params, setParams] = useSearchParams()
  const layout = useSiteLayout()
  const facilitiesQuery = useFacilities()
  const calendarQuery = useHouseCalendar()
  const calendar = calendarQuery.data
  const facilities = facilitiesQuery.data || []
  const initial = useMemo(() => draftFromSearch(params, readStayDraft()), [params])
  const [checkIn, setCheckIn] = useState(initial.checkIn)
  const [checkOut, setCheckOut] = useState(initial.checkOut)
  const [guests, setGuests] = useState(initial.guests)
  const [children, setChildren] = useState(initial.children || 0)
  const [picked, setPicked] = useState(initial.picked)
  const [guest, setGuest] = useState(initial.guest)
  const [channel, setChannel] = useState(initial.channel)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [emailAlert, setEmailAlert] = useState('')
  const emailRef = useRef(null)
  const edited = useRef(false)

  useEffect(() => {
    const draft = {
      checkIn,
      checkOut,
      guests,
      children,
      picked,
      guest,
      channel,
      channelChosen: channel === 'whatsapp' || channel === 'email',
    }
    writeStayDraft(draft)
    if (!edited.current || !anchor) return
    if (window.location.hash === `#${anchor}`) return
    const next = `${window.location.pathname}${window.location.search}#${anchor}`
    window.history.replaceState(null, '', next)
  }, [anchor, checkIn, checkOut, guests, children, picked, guest, channel])

  const capacity = useMemo(() => stayCapacity(calendar, checkIn, checkOut), [calendar, checkIn, checkOut])
  const perRoom = calendar?.guestsPerRoom || 2
  const roomCount = calendar?.roomCount || 20
  const maxGuests = calendar?.maxGuests || roomCount * perRoom
  const people = guests + children
  const needed = roomsForGuests(guests, perRoom)
  const showSharing = guests > perRoom || children > 0
  const fits = Boolean(capacity && !capacity.closed && people <= capacity.guestsLeft && needed <= roomCount)
  const emailOk = isValidEmail(guest.email)

  const chosen = facilities.filter((item) => picked.includes(item.id))
  const blockedFacility = chosen.find((item) => !facilityOpen(item, calendar, checkIn, checkOut))

  function touch() {
    edited.current = true
  }

  function changeNights(delta) {
    if (!checkIn) return
    touch()
    const next = Math.min(90, Math.max(0, nights + delta))
    setCheckOut(next === 0 ? '' : addDays(checkIn, next))
  }

  function toggleFacility(id) {
    touch()
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function clearFields() {
    edited.current = false
    clearStayDraft()
    const blank = emptyStayDraft()
    setCheckIn(blank.checkIn)
    setCheckOut(blank.checkOut)
    setGuests(blank.guests)
    setChildren(0)
    setPicked(blank.picked)
    setGuest(blank.guest)
    setChannel(blank.channel)
    setError('')
    setEmailAlert('')
    setStatus('idle')
    setParams({}, { replace: true })
  }

  const nights = stayNights(checkIn, checkOut)

  async function submit(event) {
    event.preventDefault()
    if (!emailOk) {
      setEmailAlert('Enter a valid email address.')
      emailRef.current?.focus()
      return
    }
    setEmailAlert('')
    if (!channel || !fits || blockedFacility) return
    setStatus('submitting')
    setError('')
    const summary = [
      `Stay request — ${guest.firstName} ${guest.lastName}`,
      `Dates: ${formatStayDate(checkIn)} to ${formatStayDate(checkOut)} (${nights} night${nights === 1 ? '' : 's'})`,
      `People: ${guests}${children ? `, children: ${children}` : ''}`,
      needed >= roomCount ? 'Space: the whole house' : `Space: ${needed} room${needed === 1 ? '' : 's'}`,
      chosen.length ? `Facilities: ${chosen.map((item) => item.name).join(', ')}` : null,
      `Email: ${guest.email}`,
      `Mobile: ${guest.mobile}`,
      guest.specialRequests ? `Notes: ${guest.specialRequests}` : null,
      'Payment is at the hotel.',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await axios.post(`${CMS_URL}/api/bookings`, {
        rooms: [],
        partySize: people,
        adults: guests,
        children,
        facilities: chosen.map((item) => ({
          facilityId: item.id,
          name: item.name,
          audience: item.audience,
        })),
        checkIn,
        checkOut,
        guest,
        paymentMethod: 'pay-at-hotel',
        confirmationMethod: channel,
        total: 0,
        currency: 'USD',
      })
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.errors?.[0]?.message || 'Could not save this request.')
      return
    }

    if (channel === 'whatsapp') {
      const phone = String(layout.data?.company?.whatsapp || layout.data?.company?.phone || '').replace(/[^\d]/g, '')
      if (phone) {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(summary)}`, '_blank', 'noopener,noreferrer')
      }
    }
    clearStayDraft()
    setStatus('success')
  }

  const spaceLine = !capacity
    ? 'Choose arrival, then departure. Past dates stay hidden. A crossed date is fully booked.'
    : capacity.closed
      ? 'Those dates are fully booked. Pick another arrival.'
      : people > capacity.guestsLeft
        ? `We can host ${capacity.guestsLeft} guests on those dates.`
        : !showSharing
          ? `${capacity.guestsLeft} guests can still be hosted.`
          : needed >= roomCount
            ? `This takes the whole house — ${roomCount} rooms for ${people} people.`
            : `${needed} room${needed === 1 ? '' : 's'} for ${people} people. ${capacity.guestsLeft} guests can still be hosted.`

  if (status === 'success') {
    return (
      <div className={styles.done}>
        <p className={styles.kicker}>Request received</p>
        <h2>We have your stay.</h2>
        <p>
          {channel === 'whatsapp'
            ? 'Continue on WhatsApp if it opened. A copy is on its way to your email, and the desk has the same request. You pay at the hotel when you arrive.'
            : 'A confirmation is on its way to your email, and the desk has the same request. You pay at the hotel when you arrive.'}
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.grid}>
        <section className={styles.panel}>
          {showHeading ? (
            <>
              <p className={styles.kicker}>The house</p>
              <h2>When are you coming?</h2>
            </>
          ) : null}
          <HouseCalendar
            nights={calendar?.nights}
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={({ checkIn: nextIn, checkOut: nextOut }) => {
              touch()
              setCheckIn(nextIn)
              setCheckOut(nextOut)
            }}
          />
          <p className={fits ? styles.ready : styles.note}>
            {calendarQuery.isError ? 'Availability will show once the desk is connected.' : spaceLine}
          </p>
        </section>

        <section className={styles.panel}>
          <div className={styles.guestRow}>
            <span>People</span>
            <div className={styles.stepper}>
              <button type="button" onClick={() => { touch(); setGuests((count) => Math.max(1, count - 1)) }} aria-label="Fewer people">
                −
              </button>
              <strong>{guests}</strong>
              <button
                type="button"
                onClick={() => { touch(); setGuests((count) => Math.min(maxGuests, count + 1)) }}
                aria-label="More people"
              >
                +
              </button>
            </div>
          </div>
          <div className={styles.guestRow}>
            <span>Children</span>
            <div className={styles.stepper}>
              <button type="button" onClick={() => { touch(); setChildren((count) => Math.max(0, count - 1)) }} aria-label="Fewer children">
                −
              </button>
              <strong>{children}</strong>
              <button
                type="button"
                onClick={() => { touch(); setChildren((count) => Math.min(maxGuests, count + 1)) }}
                aria-label="More children"
              >
                +
              </button>
            </div>
          </div>
          {checkIn ? (
            <div className={styles.stayBoard}>
              <p>
                <span>Check-in</span>
                <strong>{formatStayDate(checkIn)}</strong>
              </p>
              <p className={styles.nightsCol}>
                <span>Nights</span>
                <span className={styles.stepper}>
                  <button type="button" onClick={() => changeNights(-1)} disabled={nights < 1} aria-label="Fewer nights">
                    −
                  </button>
                  <strong>{nights}</strong>
                  <button type="button" onClick={() => changeNights(1)} disabled={nights >= 90} aria-label="More nights">
                    +
                  </button>
                </span>
              </p>
              <p>
                <span>Check-out</span>
                {checkOut ? <strong>{formatStayDate(checkOut)}</strong> : <em>Add nights</em>}
              </p>
            </div>
          ) : null}
          {showSharing ? (
            <p className={styles.note}>
              {guests} {guests === 1 ? 'person' : 'people'}
              {children ? ` and ${children} ${children === 1 ? 'child' : 'children'}` : ''}.{' '}
              {perRoom} share a room
              {children ? ', and children stay with them' : ''}, so this needs {needed} {needed === 1 ? 'room' : 'rooms'}.
            </p>
          ) : null}

          <h3>Add a facility</h3>
          <ul className={styles.facilities}>
            {facilities.map((item) => {
              const open = !checkOut || facilityOpen(item, calendar, checkIn, checkOut)
              return (
                <li key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={picked.includes(item.id)}
                      disabled={!open}
                      onChange={() => toggleFacility(item.id)}
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {item.audience === 'exclusive' ? 'Held until checkout' : 'Also open to visitors'}
                        {!open ? ' · not free on these dates' : ''}
                      </small>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>

          <div className={styles.names}>
            <label className={styles.field}>
              First name
              <input
                value={guest.firstName}
                onChange={(event) => { touch(); setGuest({ ...guest, firstName: event.target.value }) }}
                required
              />
            </label>
            <label className={styles.field}>
              Last name
              <input
                value={guest.lastName}
                onChange={(event) => { touch(); setGuest({ ...guest, lastName: event.target.value }) }}
                required
              />
            </label>
          </div>
          <div className={styles.names}>
            <label className={styles.field}>
              Mobile
              <input
                value={guest.mobile}
                onChange={(event) => { touch(); setGuest({ ...guest, mobile: event.target.value }) }}
                required
              />
            </label>
            <label className={styles.field}>
              Email
              <input
                ref={emailRef}
                type="text"
                inputMode="email"
                autoComplete="email"
                value={guest.email}
                aria-invalid={emailAlert ? true : undefined}
                onChange={(event) => {
                  touch()
                  setEmailAlert('')
                  setGuest({ ...guest, email: event.target.value })
                }}
              />
            </label>
          </div>
          {emailAlert ? (
            <p className={styles.alert} role="alert">
              {emailAlert}
            </p>
          ) : null}
          <label className={styles.field}>
            Notes
            <textarea
              rows={3}
              value={guest.specialRequests}
              onChange={(event) => { touch(); setGuest({ ...guest, specialRequests: event.target.value }) }}
            />
          </label>

          <div className={styles.channels} role="group" aria-label="How should we confirm">
            <button
              type="button"
              className={channel === 'whatsapp' ? styles.channelOn : ''}
              aria-pressed={channel === 'whatsapp'}
              onClick={() => { touch(); setChannel((current) => (current === 'whatsapp' ? '' : 'whatsapp')) }}
            >
              WhatsApp
            </button>
            <button
              type="button"
              className={channel === 'email' ? styles.channelOn : ''}
              aria-pressed={channel === 'email'}
              onClick={() => { touch(); setChannel((current) => (current === 'email' ? '' : 'email')) }}
            >
              Email
            </button>
          </div>
          <p className={styles.note}>Same request either way. You and the desk both get an email. You pay at the hotel.</p>
          {error ? (
            <p className={styles.alert} role="alert">
              {error}
            </p>
          ) : null}
          {blockedFacility ? <p className={styles.warn}>{blockedFacility.name} is not free for those dates.</p> : null}
          <div className={styles.actions}>
            <button className={styles.clear} type="button" onClick={clearFields}>
              Clear
            </button>
            <button
              className={styles.submit}
              type="submit"
              disabled={!channel || !fits || Boolean(blockedFacility) || status === 'submitting'}
            >
              {status === 'submitting'
                ? 'Sending…'
                : channel === 'whatsapp'
                  ? 'Send on WhatsApp'
                  : channel === 'email'
                    ? 'Send by email'
                    : 'Choose how to send'}
            </button>
          </div>
        </section>
      </div>
    </form>
  )
}
