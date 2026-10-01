const ZONE = 'Africa/Kigali'

export function todayInKigali(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  }
}

export function isoDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day))
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addYears(iso, years) {
  const [year, month, day] = iso.split('-').map(Number)
  return isoDate(year + years, month, day)
}

export function daysUntil(today, end) {
  const start = Date.parse(`${today}T00:00:00Z`)
  const finish = Date.parse(`${end}T00:00:00Z`)
  return Math.round((finish - start) / 86400000)
}

export function longDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function renewalLabel(month, day) {
  if (!month || !day) return ''
  return longDate(isoDate(2000, month, day)).replace(' 2000', '')
}

/** The one-year period that has not ended, anchored on the renewal day. */
export function openPeriod(today, month, day, termYears = 1) {
  const year = Number(today.slice(0, 4))
  let end = isoDate(year, month, day)
  if (today >= end) {
    const start = end
    end = addYears(start, termYears)
    return { start, end }
  }
  return { start: addYears(end, -termYears), end }
}

export function nextInvoiceNumber(numbers, periodStart) {
  const year = String(periodStart).slice(0, 4)
  let max = 0
  for (const value of numbers) {
    const match = String(value || '').match(/(\d+)$/)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `${year}-${max + 1}`
}

export function milestoneFor(today, periodEnd, status) {
  if (status === 'paid') return ''
  const left = daysUntil(today, periodEnd)
  if (left >= 16 && left <= 30) return '30'
  if (left >= 1 && left <= 15) return '15'
  if (left === 0) return 'renewal'
  if (left < 0) return 'overdue'
  return ''
}

export function statusFor(today, periodEnd, status) {
  if (status === 'paid') return 'paid'
  return today >= periodEnd ? 'expired' : 'active'
}
