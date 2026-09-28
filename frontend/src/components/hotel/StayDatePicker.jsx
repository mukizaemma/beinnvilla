import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { closedNightSet, closureSummaries, dayKey, eachNight, formatDay } from '@features/hotel/availability'
import { useRoomCalendars } from '@lib/queries/useRoomCalendar'
import styles from './StayDatePicker.module.css'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function monthStart(value) {
  const date = new Date(`${dayKey(value) || new Date().toISOString().slice(0, 10)}T12:00:00`)
  date.setDate(1)
  return date
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function shiftMonth(date, amount) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

function daysInMonth(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const startPad = (first.getDay() + 6) % 7
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let day = 1; day <= last; day += 1) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push(key)
  }
  return cells
}

export default function StayDatePicker({ checkIn, checkOut, onChange, closures = [], roomSlugs = [] }) {
  const today = new Date().toISOString().slice(0, 10)
  const [month, setMonth] = useState(() => monthStart(checkIn || today))
  const [hint, setHint] = useState('')
  const calendar = useRoomCalendars(roomSlugs)
  const closed = useMemo(() => {
    const nights = new Set(calendar.closed)
    closedNightSet(closures, roomSlugs).forEach((night) => nights.add(night))
    return nights
  }, [calendar.closed, closures, roomSlugs])
  const summaries = useMemo(() => {
    const lines = [...calendar.notes, ...closureSummaries(closures, roomSlugs)]
    return [...new Set(lines)]
  }, [calendar.notes, closures, roomSlugs])
  const cells = daysInMonth(month)

  function rangeHitsClosed(start, end) {
    return eachNight(start, end).some((night) => closed.has(night))
  }

  function pick(day) {
    if (!day || day < today) return

    const startingFresh = !checkIn || (checkIn && checkOut)
    if (startingFresh || day <= checkIn) {
      if (closed.has(day)) {
        setHint(summaries[0] || 'That night is not available.')
        return
      }
      setHint('')
      onChange({ checkIn: day, checkOut: '' })
      return
    }

    if (rangeHitsClosed(checkIn, day)) {
      setHint(summaries[0] || 'That stay crosses nights that are not available.')
      return
    }

    setHint('')
    onChange({ checkIn, checkOut: day })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.selected}>
        <span>
          <strong>Check-in</strong>
          {checkIn ? formatDay(checkIn) : 'Choose a night'}
        </span>
        <span>
          <strong>Check-out</strong>
          {checkOut ? formatDay(checkOut) : checkIn ? 'Choose the morning you leave' : '—'}
        </span>
      </div>

      <div className={styles.nav}>
        <button type="button" onClick={() => setMonth((current) => shiftMonth(current, -1))} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <strong>{monthLabel(month)}</strong>
        <button type="button" onClick={() => setMonth((current) => shiftMonth(current, 1))} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.week}>
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <span key={`pad-${index}`} />
          const isClosed = closed.has(day)
          const isPast = day < today
          const inStay = checkIn && checkOut && day >= checkIn && day < checkOut
          const isStart = day === checkIn
          const isEnd = day === checkOut
          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              className={[
                styles.day,
                isPast ? styles.past : '',
                isClosed ? styles.closed : '',
                inStay ? styles.inStay : '',
                isStart || isEnd ? styles.edge : '',
              ].join(' ')}
              onClick={() => pick(day)}
            >
              {Number(day.slice(-2))}
            </button>
          )
        })}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendOpen}>Open</span>
        <span className={styles.legendClosed}>Closed</span>
        <span className={styles.legendPick}>Your stay</span>
      </div>

      {summaries.map((line) => (
        <p key={line} className={styles.summary}>
          {line}
        </p>
      ))}
      {hint && <p className={styles.hint}>{hint}</p>}
      {checkIn && checkOut && (
        <p className={styles.nights}>
          {eachNight(checkIn, checkOut).length} {eachNight(checkIn, checkOut).length === 1 ? 'night' : 'nights'}
        </p>
      )}
    </div>
  )
}
