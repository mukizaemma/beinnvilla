export function roomsForGuests(guests, guestsPerRoom = 2) {
  const per = Math.max(1, Number(guestsPerRoom) || 2)
  const count = Math.max(0, Number(guests) || 0)
  return Math.ceil(count / per)
}

export function todayKey() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(value, amount) {
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`)
  date.setDate(date.getDate() + amount)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function eachNight(start, endExclusive) {
  const nights = []
  let cursor = String(start || '').slice(0, 10)
  const end = String(endExclusive || '').slice(0, 10)
  while (cursor && end && cursor < end) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function nightInfo(calendar, date) {
  return (calendar?.nights || []).find((night) => night.date === date) || null
}

export function stayCapacity(calendar, checkIn, checkOut) {
  const nights = eachNight(checkIn, checkOut)
  if (!nights.length) return null
  const days = nights.map((date) => nightInfo(calendar, date))
  if (days.some((day) => !day)) return null
  const guestsLeft = Math.min(...days.map((day) => day.guestsLeft))
  const roomsLeft = Math.min(...days.map((day) => day.roomsLeft))
  const closed = days.some((day) => day.closed)
  return { guestsLeft, roomsLeft, closed, nights }
}

export function facilityOpen(facility, calendar, checkIn, checkOut) {
  if (!facility || facility.available === false) return false
  if (facility.audience !== 'exclusive') return true
  const held = new Set((calendar?.facilities || []).find((row) => row.id === facility.id)?.heldDates || [])
  return !eachNight(checkIn, checkOut).some((date) => held.has(date))
}
