import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDay } from '@features/hotel/availability'
import { staffClient } from '../api/staffClient'
import StaffModal from '../components/StaffModal'
import '../staff.css'

const empty = {
  scope: 'hotel',
  startDate: '',
  reopenDate: '',
  note: '',
  guestMessage: '',
  rooms: [],
}

export default function StaffAvailability() {
  const [rows, setRows] = useState([])
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState(null)

  async function load() {
    const [blocks, roomList] = await Promise.all([
      staffClient.get('/api/availability-blocks?limit=100&depth=1&sort=-startDate'),
      staffClient.get('/api/rooms?limit=50&depth=0'),
    ])
    setRows(blocks.data.docs || [])
    setRooms(roomList.data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load availability.'))
  }, [])

  function toggleRoom(id) {
    setForm((current) => {
      const next = current.rooms.includes(id)
        ? current.rooms.filter((item) => item !== id)
        : [...current.rooms, id]
      return { ...current, rooms: next }
    })
  }

  async function save(event) {
    event.preventDefault()
    const payload = {
      scope: form.scope,
      startDate: form.startDate,
      reopenDate: form.reopenDate,
      note: form.note,
      guestMessage: form.guestMessage,
      active: true,
      rooms: form.scope === 'room' ? form.rooms : [],
    }
    try {
      await staffClient.post('/api/availability-blocks', payload)
      toast.success('Those dates are now closed on the website.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not close those dates.')
    }
  }

  async function reopen(id) {
    try {
      await staffClient.patch(`/api/availability-blocks/${id}`, { active: false })
      toast.success('Opened again — the website can take those dates.')
      load()
    } catch {
      toast.error('Could not open those dates.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Remove this closed-date range?')) return
    try {
      await staffClient.delete(`/api/availability-blocks/${id}`)
      load()
    } catch {
      toast.error('Could not delete.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Availability</h1>
      <p className="staffLead">
        Mark a date range fully booked when the house cannot take more guests. Those nights show as
        crossed on the booking calendar. Open them again when the house is free.
      </p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={() => setForm({ ...empty, rooms: [] })}>
          Close dates
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Closed</th>
              <th>Guests can book from</th>
              <th>What</th>
              <th>Note</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDay(row.startDate)}</td>
                <td>{formatDay(row.reopenDate)}</td>
                <td>
                  {row.scope === 'hotel'
                    ? 'Whole property'
                    : (row.rooms || []).map((room) => room.name || room).join(', ') || 'Rooms'}
                </td>
                <td>{row.note || '—'}</td>
                <td>{row.active === false ? 'Open again' : 'Closed'}</td>
                <td>
                  <div className="rowActions">
                    {row.active !== false && (
                      <button type="button" className="staffBtn" onClick={() => reopen(row.id)}>
                        Open again
                      </button>
                    )}
                    <button type="button" className="staffBtn staffBtnDanger" onClick={() => remove(row.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>No closed dates. The website is taking bookings as usual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffModal title="Close dates" onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-6">
              Close
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
                <option value="hotel">The whole property</option>
                <option value="room">Only some rooms</option>
              </select>
            </label>
            <label className="staffField col-3">
              First full night
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </label>
            <label className="staffField col-3">
              Guests can book from
              <input
                type="date"
                value={form.reopenDate}
                onChange={(e) => setForm({ ...form, reopenDate: e.target.value })}
                required
              />
            </label>
            {form.scope === 'room' && (
              <fieldset className="staffField full">
                <legend>Room types to close</legend>
                <div className="staffCheckRow">
                  {rooms.map((room) => (
                    <label key={room.id} className="staffCheck">
                      <input
                        type="checkbox"
                        checked={form.rooms.includes(room.id)}
                        onChange={() => toggleRoom(room.id)}
                      />
                      {room.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <label className="staffField full">
              Note for staff
              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Football team, Booking.com, wedding…"
              />
            </label>
            <label className="staffField full">
              Message guests see (optional)
              <textarea
                rows={2}
                value={form.guestMessage}
                onChange={(e) => setForm({ ...form, guestMessage: e.target.value })}
                placeholder="The apartment is reserved for a private group until 8 September."
              />
            </label>
            <div className="formActions full">
              <button type="button" className="staffBtn staffBtnGhost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="staffBtn">
                Close these dates
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
