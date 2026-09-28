'use client'

import React, { useEffect, useMemo, useState } from 'react'
import './bookingsDashboard.css'

function day(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function when(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function digits(phone) {
  return String(phone || '').replace(/[^\d]/g, '')
}

function inRange(iso, start, end) {
  if (!iso) return false
  const time = new Date(iso).setHours(0, 0, 0, 0)
  if (start && time < new Date(start).setHours(0, 0, 0, 0)) return false
  if (end && time > new Date(end).setHours(0, 0, 0, 0)) return false
  return true
}

function stayNights(row) {
  if (!row.checkIn || !row.checkOut) return 0
  const nights = Math.round((new Date(row.checkOut) - new Date(row.checkIn)) / 86400000)
  return nights > 0 ? nights : 0
}

function money(amount, currency = 'USD') {
  const value = Number(amount) || 0
  return `${currency} ${value.toFixed(2)}`
}

function sumAmount(list) {
  return list.reduce((sum, row) => (row.status === 'cancelled' ? sum : sum + Number(row.total || 0)), 0)
}

function sumNights(list) {
  return list.reduce((sum, row) => (row.status === 'cancelled' ? sum : sum + stayNights(row)), 0)
}

function staySummary(row) {
  const rooms = (row.rooms || []).map((room) => room.name).join(', ') || 'room'
  return `${row.guestName || 'Guest'} · ${rooms} · ${day(row.checkIn)} – ${day(row.checkOut)}`
}

function badgeClass(status) {
  if (status === 'confirmed') return 'bookings-dash__badge bookings-dash__badge--confirmed'
  if (status === 'cancelled') return 'bookings-dash__badge bookings-dash__badge--cancelled'
  return 'bookings-dash__badge bookings-dash__badge--pending'
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) throw new Error('request failed')
  return res.json()
}

export function BookingsDashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const [rows, setRows] = useState([])
  const [staffName, setStaffName] = useState('Staff')
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [applied, setApplied] = useState({ start: '', end: '' })
  const [view, setView] = useState(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const data = await api('/api/bookings?limit=200&sort=-createdAt&depth=0')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => setError('Could not load reservations.'))
    api('/api/users/me')
      .then((data) => {
        const user = data.user || data
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
        setStaffName(name || user.name || user.email || 'Staff')
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!applied.start && !applied.end) return rows
    return rows.filter((row) => inRange(row.createdAt, applied.start, applied.end))
  }, [rows, applied])

  const rangeAmount = sumAmount(filtered)
  const rangeNights = sumNights(filtered)
  const allAmount = sumAmount(rows)
  const currency = rows[0]?.currency || filtered[0]?.currency || 'USD'

  const stats = {
    total: filtered.length,
    whatsapp: filtered.filter((row) => row.confirmationMethod === 'whatsapp').length,
    email: filtered.filter((row) => row.confirmationMethod === 'email').length,
    confirmed: filtered.filter((row) => row.status === 'confirmed').length,
    pending: filtered.filter((row) => row.status === 'pending').length,
    allAmount,
  }

  async function saveBooking(id, data) {
    const next = await api(`/api/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    const doc = next.doc || next
    setRows((current) => current.map((row) => (row.id === id ? doc : row)))
    setView(doc)
    return doc
  }

  async function addMessage(row, entry) {
    const communications = [
      ...(row.communications || []),
      {
        at: new Date().toISOString(),
        author: staffName,
        ...entry,
      },
    ]
    await saveBooking(row.id, { communications })
    setDraft('')
  }

  function preferredChannel(row) {
    return row.confirmationMethod === 'whatsapp' ? 'whatsapp' : 'email'
  }

  async function replyToGuest(row) {
    const body = draft.trim()
    if (!body) return
    const channel = preferredChannel(row)
    const text = `BE Inn Villa\n${staySummary(row)}\n\n${body}`

    if (channel === 'whatsapp') {
      const phone = digits(row.guest?.mobile)
      if (!phone) {
        setError('This guest has no mobile number for WhatsApp.')
        return
      }
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    } else {
      try {
        const next = await api('/api/reservations/reply', {
          method: 'POST',
          body: JSON.stringify({ bookingId: row.id, body }),
        })
        const doc = next.doc || next
        setRows((current) => current.map((item) => (item.id === row.id ? doc : item)))
        setView(doc)
        setDraft('')
        setError('')
      } catch {
        setError('Could not send that email. Check that Resend is configured.')
      }
      return
    }

    setError('')
    await addMessage(row, { direction: 'outbound', channel, body })
  }

  async function logGuestReply(row) {
    const body = draft.trim()
    if (!body) return
    setError('')
    await addMessage(row, {
      direction: 'inbound',
      channel: preferredChannel(row),
      body,
    })
  }

  async function addNote(row) {
    const body = draft.trim()
    if (!body) return
    setError('')
    await addMessage(row, { direction: 'note', channel: 'internal', body })
  }

  async function setStatus(row, status) {
    await saveBooking(row.id, { status })
  }

  async function remove(id) {
    if (!window.confirm('Delete this reservation?')) return
    await api(`/api/bookings/${id}`, { method: 'DELETE' })
    setRows((current) => current.filter((row) => row.id !== id))
    setView(null)
  }

  return (
    <div className="bookings-dash">
      <h1>Recent Bookings</h1>

      <div className="bookings-dash__toolbar">
        <label className="bookings-dash__field">
          Start date
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="bookings-dash__field">
          End date
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button type="button" className="bookings-dash__btn" onClick={() => setApplied({ start, end })}>
          Search
        </button>
        <button type="button" className="bookings-dash__btn bookings-dash__btn--ghost" onClick={() => setApplied({ start: '', end: '' })}>
          All bookings
        </button>
        <button type="button" className="bookings-dash__btn bookings-dash__btn--ghost" onClick={() => window.print()}>
          Print list
        </button>
      </div>

      {error && !view && <p className="bookings-dash__error">{error}</p>}

      <div className="bookings-dash__stats">
        <div className="bookings-dash__stat">
          <span>Reservations</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="bookings-dash__stat">
          <span>WhatsApp</span>
          <strong>{stats.whatsapp}</strong>
        </div>
        <div className="bookings-dash__stat">
          <span>Email</span>
          <strong>{stats.email}</strong>
        </div>
        <div className="bookings-dash__stat">
          <span>Confirmed</span>
          <strong>{stats.confirmed}</strong>
          <small>{stats.pending} pending</small>
        </div>
        <div className="bookings-dash__stat">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
      </div>

      <div className="bookings-dash__card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Channel</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Days</th>
              <th>Guests</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{when(row.createdAt)}</td>
                <td>
                  {row.guestName}
                  <div>
                    <span className={badgeClass(row.status)}>{row.status}</span>
                  </div>
                </td>
                <td>{row.guest?.mobile || '—'}</td>
                <td>{row.confirmationMethod || '—'}</td>
                <td>{row.rooms?.[0]?.name || '—'}</td>
                <td>{day(row.checkIn)}</td>
                <td>{day(row.checkOut)}</td>
                <td>{stayNights(row)}</td>
                <td>{row.partySize || row.adults || '—'}</td>
                <td>
                  <div className="bookings-dash__actions">
                    <button
                      type="button"
                      className="bookings-dash__icon bookings-dash__icon--view"
                      onClick={() => {
                        setView(row)
                        setDraft('')
                        setError('')
                      }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="bookings-dash__icon bookings-dash__icon--delete"
                      onClick={() => remove(row.id)}
                    >
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10}>No reservations in this range.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {view && (
        <div className="bookings-dash__overlay" role="dialog" aria-modal="true">
          <div className="bookings-dash__modal">
            <h2>Reservation</h2>
            <div className="bookings-dash__grid">
              <p>
                <strong>Guest</strong>
                <br />
                {view.guestName}
              </p>
              <p>
                <strong>Contact</strong>
                <br />
                {view.guest?.mobile || '—'}
                <br />
                {view.guest?.email || '—'}
              </p>
              <p>
                <strong>Room</strong>
                <br />
                {view.rooms?.map((room) => room.name).join(', ') || '—'}
              </p>
              <p>
                <strong>Stay</strong>
                <br />
                {day(view.checkIn)} – {day(view.checkOut)} · {stayNights(view)} night
                {stayNights(view) === 1 ? '' : 's'}
              </p>
              <p>
                <strong>Guests</strong>
                <br />
                {view.partySize || view.adults || '—'} · pay at the hotel
              </p>
              <p className="bookings-dash__preferred">
                Guest asked to be contacted by{' '}
                <strong>{preferredChannel(view) === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong>.
                Replies use that channel. If they answer outside this screen, paste the reply below so
                the conversation stays on this reservation.
              </p>
            </div>

            <h3>Conversation</h3>
            <div className="bookings-dash__thread">
              {(view.communications || []).length === 0 && <p>No messages yet.</p>}
              {(view.communications || []).map((item, index) => (
                <article key={item.id || index} className={`bookings-dash__msg bookings-dash__msg--${item.direction}`}>
                  <header>
                    <span>
                      {item.direction === 'outbound'
                        ? 'Sent to guest'
                        : item.direction === 'inbound'
                          ? 'Guest reply'
                          : 'Internal note'}{' '}
                      · {item.channel} · {item.author || 'Staff'}
                    </span>
                    <span>{when(item.at)}</span>
                  </header>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>

            <div className="bookings-dash__compose">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a reply, log a guest message, or add an internal note…"
              />
              {error && <p className="bookings-dash__error">{error}</p>}
              <div className="bookings-dash__row">
                <button type="button" className="bookings-dash__btn bookings-dash__btn--navy" onClick={() => replyToGuest(view)}>
                  {preferredChannel(view) === 'whatsapp' ? 'Reply on WhatsApp' : 'Reply by Email'}
                </button>
                <button type="button" className="bookings-dash__btn" onClick={() => logGuestReply(view)}>
                  Log guest reply
                </button>
                <button type="button" className="bookings-dash__btn bookings-dash__btn--ghost" onClick={() => addNote(view)}>
                  Add internal note
                </button>
              </div>
            </div>

            <div className="bookings-dash__row">
              <button type="button" className="bookings-dash__btn bookings-dash__btn--ghost" onClick={() => setStatus(view, 'pending')}>
                Pending
              </button>
              <button type="button" className="bookings-dash__btn bookings-dash__btn--navy" onClick={() => setStatus(view, 'confirmed')}>
                Confirm
              </button>
              <button type="button" className="bookings-dash__btn bookings-dash__btn--danger" onClick={() => remove(view.id)}>
                Delete
              </button>
              <button type="button" className="bookings-dash__btn bookings-dash__btn--ghost" onClick={() => setView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingsDashboard
