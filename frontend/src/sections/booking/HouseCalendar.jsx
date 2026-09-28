import { useEffect, useMemo, useState } from 'react'
import { todayKey } from '@features/hotel/house'
import styles from './HouseCalendar.module.css'

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function keyFor(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addMonth(cursor, amount) {
  const next = new Date(cursor.year, cursor.month + amount, 1)
  return { year: next.getFullYear(), month: next.getMonth() }
}

function Month({ cursor, today, byDate, checkIn, checkOut, onPick }) {
  const cells = []
  const first = new Date(cursor.year, cursor.month, 1)
  const lead = (first.getDay() + 6) % 7
  const count = new Date(cursor.year, cursor.month + 1, 0).getDate()
  for (let i = 0; i < lead; i += 1) cells.push(null)
  for (let day = 1; day <= count; day += 1) {
    const key = keyFor(cursor.year, cursor.month, day)
    cells.push(key < today ? null : key)
  }
  const label = first.toLocaleString('en', { month: 'long', year: 'numeric' })

  return (
    <section className={styles.month} aria-label={label}>
      <strong>{label}</strong>
      <div className={styles.week}>
        {WEEK.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${cursor.year}-${cursor.month}-${index}`} />
          const info = byDate.get(date)
          const closed = Boolean(info?.closed)
          const inStay = checkOut && date >= checkIn && date < checkOut
          const edge = date === checkIn || date === checkOut
          return (
            <button
              key={date}
              type="button"
              disabled={closed && !(checkIn && !checkOut && date > checkIn)}
              className={`${styles.day} ${closed ? styles.closed : ''} ${inStay ? styles.inStay : ''} ${edge ? styles.edge : ''}`}
              aria-pressed={edge || inStay}
              onClick={() => onPick(date)}
            >
              <span className={closed ? styles.cross : undefined}>{Number(date.slice(8))}</span>
              {!closed && info ? <small>{info.guestsLeft}</small> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function HouseCalendar({ nights = [], checkIn, checkOut, onChange }) {
  const today = todayKey()
  const now = new Date()
  const start = { year: now.getFullYear(), month: now.getMonth() }
  const [cursor, setCursor] = useState(start)
  const byDate = useMemo(() => new Map((nights || []).map((night) => [night.date, night])), [nights])
  const atStart = cursor.year === start.year && cursor.month === start.month
  const following = addMonth(cursor, 1)

  useEffect(() => {
    const target = checkOut || checkIn
    if (!target) return
    const [year, month] = target.split('-').map(Number)
    const targetMonth = { year, month: month - 1 }
    setCursor((current) => {
      const nextMonth = addMonth(current, 1)
      const visible =
        (current.year === targetMonth.year && current.month === targetMonth.month) ||
        (nextMonth.year === targetMonth.year && nextMonth.month === targetMonth.month)
      if (visible) return current
      const prev = addMonth(targetMonth, -1)
      if (prev.year < start.year || (prev.year === start.year && prev.month < start.month)) return start
      return prev
    })
  }, [checkIn, checkOut, start.year, start.month])

  function shift(amount) {
    const next = addMonth(cursor, amount)
    if (next.year < start.year || (next.year === start.year && next.month < start.month)) return
    setCursor(next)
  }

  function pick(date) {
    const info = byDate.get(date)
    if (!checkIn || checkOut || date <= checkIn) {
      if (info?.closed) return
      onChange({ checkIn: date, checkOut: '' })
      return
    }
    onChange({ checkIn, checkOut: date })
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <button type="button" onClick={() => shift(-1)} disabled={atStart} aria-label="Previous month">
          ‹
        </button>
        <button type="button" onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className={styles.months}>
        <Month cursor={cursor} today={today} byDate={byDate} checkIn={checkIn} checkOut={checkOut} onPick={pick} />
        <Month cursor={following} today={today} byDate={byDate} checkIn={checkIn} checkOut={checkOut} onPick={pick} />
      </div>
      <p className={styles.legend}>
        <span>Open numbers are guests we can still host.</span>
        <span className={styles.legendClosed}>Crossed dates are fully booked.</span>
      </p>
    </div>
  )
}
