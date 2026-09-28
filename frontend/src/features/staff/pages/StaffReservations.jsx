import { useEffect, useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import StaffModal from '../components/StaffModal'
import '../staff.css'

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

function stayNights(row) {
  if (!row.checkIn || !row.checkOut) return 0
  const nights = Math.round((new Date(row.checkOut) - new Date(row.checkIn)) / 86400000)
  return nights > 0 ? nights : 0
}

function staySummary(row) {
  const rooms = (row.rooms || []).map((room) => room.name).join(', ') || 'room'
  return `${row.guestName || 'Guest'} · ${rooms} · ${day(row.checkIn)} – ${day(row.checkOut)}`
}

function preferredChannel(row) {
  return row.confirmationMethod === 'whatsapp' ? 'whatsapp' : 'email'
}

export default function StaffReservations() {
  const today = new Date().toISOString().slice(0, 10)
  const [rows, setRows] = useState([])
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [channel, setChannel] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [applied, setApplied] = useState({ start: '', end: '', channel: 'all', status: 'all' })
  const [view, setView] = useState(null)
  const [draft, setDraft] = useState('')

  async function load() {
    try {
      const { data } = await staffClient.get('/api/bookings?limit=200&sort=-createdAt')
      setRows(data.docs || [])
    } catch {
      toast.error('Could not load reservations.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (applied.channel !== 'all' && row.confirmationMethod !== applied.channel) return false
      if (applied.status !== 'all' && row.status !== applied.status) return false
      if (applied.start && row.checkOut && String(row.checkOut).slice(0, 10) < applied.start) return false
      if (applied.end && row.checkIn && String(row.checkIn).slice(0, 10) > applied.end) return false
      return true
    })
  }, [rows, applied])

  const stats = {
    total: filtered.length,
    whatsapp: filtered.filter((row) => row.confirmationMethod === 'whatsapp').length,
    email: filtered.filter((row) => row.confirmationMethod === 'email').length,
    confirmed: filtered.filter((row) => row.status === 'confirmed').length,
    pending: filtered.filter((row) => row.status === 'pending').length,
  }

  async function save(id, payload) {
    const { data } = await staffClient.patch(`/api/bookings/${id}`, payload)
    const doc = data.doc || data
    setRows((current) => current.map((row) => (row.id === id ? doc : row)))
    setView(doc)
    return doc
  }

  async function addMessage(row, entry) {
    const communications = [
      ...(row.communications || []),
      { at: new Date().toISOString(), author: 'Staff', ...entry },
    ]
    await save(row.id, { communications })
    setDraft('')
  }

  async function replyToGuest(row) {
    const body = draft.trim()
    if (!body) return
    const channel = preferredChannel(row)
    const text = `BE Inn Villa\n${staySummary(row)}\n\n${body}`

    if (channel === 'whatsapp') {
      const phone = digits(row.guest?.mobile)
      if (!phone) {
        toast.error('This guest has no mobile number for WhatsApp.')
        return
      }
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    } else {
      try {
        const { data } = await staffClient.post('/api/reservations/reply', { bookingId: row.id, body })
        const doc = data.doc || data
        setRows((current) => current.map((item) => (item.id === row.id ? doc : item)))
        setView(doc)
        setDraft('')
        toast.success('Email sent through Resend and saved on this reservation.')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not send that email.')
      }
      return
    }

    await addMessage(row, { direction: 'outbound', channel, body })
    toast.success('WhatsApp opened and reply logged.')
  }

  async function logGuestReply(row) {
    const body = draft.trim()
    if (!body) return
    await addMessage(row, { direction: 'inbound', channel: preferredChannel(row), body })
    toast.success('Guest reply saved on this reservation.')
  }

  async function addNote(row) {
    const body = draft.trim()
    if (!body) return
    await addMessage(row, { direction: 'note', channel: 'internal', body })
    toast.success('Internal note saved.')
  }

  async function setStatus(id, status) {
    try {
      await save(id, { status })
      toast.success(`Marked ${status}.`)
    } catch {
      toast.error('Could not update this booking.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this reservation?')) return
    try {
      await staffClient.delete(`/api/bookings/${id}`)
      toast.success('Reservation deleted.')
      setView(null)
      load()
    } catch {
      toast.error('Could not delete this booking.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Website reservations</h1>

      <div className="staffToolbar noPrint">
        <label className="staffField">
          Confirmed via
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="all">All channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label className="staffField">
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="staffField">
          From date
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="staffField">
          To date
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button
          type="button"
          className="staffBtn"
          onClick={() => setApplied({ start, end, channel, status: statusFilter })}
        >
          Search
        </button>
        <button
          type="button"
          className="staffBtn staffBtnGhost"
          onClick={() => {
            setChannel('all')
            setStatusFilter('all')
            setStart('')
            setEnd('')
            setApplied({ start: '', end: '', channel: 'all', status: 'all' })
          }}
        >
          Clear
        </button>
        <button type="button" className="staffBtn staffBtnGhost" onClick={() => window.print()}>
          Print list
        </button>
      </div>

      <div className="staffStats">
        <div className="staffStat">
          <span>Reservations</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="staffStat">
          <span>WhatsApp</span>
          <strong>{stats.whatsapp}</strong>
        </div>
        <div className="staffStat">
          <span>Email</span>
          <strong>{stats.email}</strong>
        </div>
        <div className="staffStat">
          <span>Confirmed</span>
          <strong>{stats.confirmed}</strong>
          <small>{stats.pending} pending</small>
        </div>
        <div className="staffStat">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
      </div>

      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Channel</th>
              <th>Stay</th>
              <th>Guests</th>
              <th>Facilities</th>
              <th>Status</th>
              <th className="noPrint">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{when(row.createdAt)}</td>
                <td>
                  {row.guestName}
                  <div>
                    <span className={`badge ${row.status === 'confirmed' ? 'badgeConfirmed' : row.status === 'cancelled' ? 'badgeCancelled' : 'badgePending'}`}>
                      {row.status}
                    </span>
                  </div>
                </td>
                <td>{row.guest?.mobile || '—'}</td>
                <td>{row.confirmationMethod || '—'}</td>
                <td>
                  {day(row.checkIn)} – {day(row.checkOut)}
                  <div>{row.rooms?.[0]?.name || '—'}</div>
                </td>
                <td>{row.partySize || row.adults || '—'}</td>
                <td>{(row.facilities || []).map((item) => item.name).join(', ') || '—'}</td>
                <td>
                  <select className="noPrint" value={row.status} onChange={(e) => setStatus(row.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <span className="printOnly">{row.status}</span>
                </td>
                <td className="noPrint">
                  <div className="rowActions">
                    <button
                      type="button"
                      className="iconBtn iconView"
                      onClick={() => {
                        setView(row)
                        setDraft('')
                      }}
                      aria-label="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button type="button" className="iconBtn iconDelete" onClick={() => remove(row.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9}>No reservations in this range.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {view && (
        <StaffModal title="Reservation" wide onClose={() => setView(null)}>
          <div className="detailGrid">
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
            <p>
              <strong>Facilities</strong>
              <br />
              {(view.facilities || []).map((item) => item.name).join(', ') || '—'}
            </p>
            <p className="full preferredNote">
              Guest asked to be contacted by <strong>{preferredChannel(view) === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong>.
              If they reply outside this screen, paste the message below so the conversation stays on this reservation.
            </p>
            {view.guest?.specialRequests && (
              <p className="full">
                <strong>Requests</strong>
                <br />
                {view.guest.specialRequests}
              </p>
            )}
          </div>

          <div className="commThread">
            <strong>Conversation</strong>
            {(view.communications || []).length === 0 && <p>No messages yet.</p>}
            {(view.communications || []).map((item, index) => (
              <article key={item.id || index} className={`commMsg commMsg--${item.direction}`}>
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

          <label className="staffField full">
            Message
            <textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a reply, log a guest message, or add an internal note…"
            />
          </label>

          <div className="formActions">
            <button type="button" className="staffBtn" onClick={() => replyToGuest(view)}>
              {preferredChannel(view) === 'whatsapp' ? 'Reply on WhatsApp' : 'Reply by Email'}
            </button>
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => logGuestReply(view)}>
              Log guest reply
            </button>
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => addNote(view)}>
              Add internal note
            </button>
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => setStatus(view.id, 'pending')}>
              Pending
            </button>
            <button type="button" className="staffBtn" onClick={() => setStatus(view.id, 'confirmed')}>
              Confirm
            </button>
            <button type="button" className="staffBtn staffBtnDanger" onClick={() => remove(view.id)}>
              Delete
            </button>
          </div>
        </StaffModal>
      )}
    </div>
  )
}
