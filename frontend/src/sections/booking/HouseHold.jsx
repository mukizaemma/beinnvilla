import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHouseCalendar } from '@features/hotel/queries/useHouseCalendar'
import { roomsForGuests, stayCapacity } from '@features/hotel/house'
import { readStayDraft, writeStayDraft } from '@features/hotel/stayDraft'
import HouseCalendar from './HouseCalendar'
import styles from './HouseHold.module.css'

export default function HouseHold({ facilityId = '' }) {
  const saved = readStayDraft()
  const { data } = useHouseCalendar()
  const [checkIn, setCheckIn] = useState(saved?.checkIn || '')
  const [checkOut, setCheckOut] = useState(saved?.checkOut || '')
  const [guests, setGuests] = useState(saved?.guests || 2)

  useEffect(() => {
    const current = readStayDraft() || {}
    writeStayDraft({
      ...current,
      checkIn,
      checkOut,
      guests,
      picked: current.picked || [],
      guest: current.guest,
      channel: current.channel === 'email' || current.channel === 'whatsapp' ? current.channel : '',
    })
  }, [checkIn, checkOut, guests])
  const capacity = stayCapacity(data, checkIn, checkOut)
  const needed = roomsForGuests(guests, data?.guestsPerRoom || 2)
  const query = new URLSearchParams({
    ...(checkIn ? { checkIn } : {}),
    ...(checkOut ? { checkOut } : {}),
    guests: String(guests),
    ...(facilityId ? { facility: facilityId } : {}),
  })

  let note = 'The calendar is for the whole house. Crossed dates are fully booked.'
  if (capacity?.closed) note = 'The house is fully booked on those dates.'
  else if (capacity && guests > capacity.guestsLeft) note = `We can still host ${capacity.guestsLeft} guests then.`
  else if (capacity) {
    note =
      needed >= (data?.roomCount || 20)
        ? 'This party would take the whole house.'
        : `${capacity.guestsLeft} guests can still be hosted. This party needs ${needed} room${needed === 1 ? '' : 's'}.`
  }

  return (
    <aside className={styles.card}>
      <h2>Book your stay</h2>
      <p>Choose dates for the house, then tell us how many guests.</p>
      <HouseCalendar
        nights={data?.nights}
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={({ checkIn: nextIn, checkOut: nextOut }) => {
          setCheckIn(nextIn)
          setCheckOut(nextOut)
        }}
      />
      <label>
        Guests
        <input type="number" min="1" value={guests} onChange={(event) => setGuests(Number(event.target.value))} />
      </label>
      <p className={styles.note}>{note}</p>
      <Link
        to={`/book?${query.toString()}`}
        onClick={() => {
          const current = readStayDraft() || {}
          const picked = new Set(current.picked || [])
          if (facilityId) picked.add(facilityId)
          writeStayDraft({
            ...current,
            checkIn,
            checkOut,
            guests,
            picked: [...picked],
            guest: current.guest,
            channel: current.channel === 'email' || current.channel === 'whatsapp' ? current.channel : '',
          })
        }}
      >
        Book this stay
      </Link>
    </aside>
  )
}
