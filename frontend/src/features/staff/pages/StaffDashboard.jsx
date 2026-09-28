import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import '../staff.css'

function day(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    staffClient
      .get('/api/bookings?limit=8&sort=-createdAt')
      .then((res) => setBookings(res.data.docs || []))
      .catch(() => toast.error('Could not load reservations.'))
  }, [])

  const confirmed = bookings.filter((row) => row.status === 'confirmed').length
  const pending = bookings.filter((row) => row.status === 'pending').length

  return (
    <div className="staffPage">
      <h1>Dashboard</h1>
      <div className="staffStats">
        <div className="staffStat">
          <span>RESERVATIONS</span>
          <strong>{bookings.length}</strong>
          <small>Latest 8 loaded</small>
        </div>
        <div className="staffStat">
          <span>CONFIRMED</span>
          <strong>{confirmed}</strong>
        </div>
        <div className="staffStat">
          <span>PENDING</span>
          <strong>{pending}</strong>
        </div>
        <div className="staffStat">
          <span>PUBLIC SITE</span>
          <strong style={{ fontSize: '1rem', marginTop: '0.7rem' }}>
            <Link to="/" target="_blank" rel="noreferrer">
              Open website
            </Link>
          </strong>
        </div>
      </div>

      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((row) => (
              <tr key={row.id}>
                <td>{row.guestName || 'Guest'}</td>
                <td>{row.rooms?.[0]?.name || '—'}</td>
                <td>{day(row.checkIn)}</td>
                <td>{row.status}</td>
                <td>
                  {row.currency || 'USD'} {row.total}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5}>No reservations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '0.85rem' }}>
        <Link to="/staff/reservations">View all reservations →</Link>
      </p>
    </div>
  )
}
