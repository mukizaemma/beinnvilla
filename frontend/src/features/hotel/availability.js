export function dayKey(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export function staysOverlap(checkIn, checkOut, closedFrom, openFrom) {
  const stayStart = dayKey(checkIn)
  const stayEnd = dayKey(checkOut)
  const blockStart = dayKey(closedFrom)
  const blockEnd = dayKey(openFrom)
  if (!stayStart || !stayEnd || !blockStart || !blockEnd) return false
  return stayStart < blockEnd && stayEnd > blockStart
}

function roomKeys(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap(roomKeys)
  if (typeof value === 'object') return [value.slug, value.id, value._id].filter(Boolean).map(String)
  return [String(value)]
}

export function closureBlocksStay(block, { checkIn, checkOut, roomSlugs = [] }) {
  if (!block || block.active === false) return false
  if (!staysOverlap(checkIn, checkOut, block.startDate, block.reopenDate)) return false
  if (block.scope === 'hotel') return true
  const closed = new Set(roomKeys(block.rooms))
  return roomSlugs.some((slug) => closed.has(String(slug)))
}

export function findBlockingClosure(blocks, stay) {
  return (blocks || []).find((block) => closureBlocksStay(block, stay)) || null
}

export function formatDay(value) {
  const key = dayKey(value)
  if (!key) return ''
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function addDays(value, amount) {
  const key = dayKey(value)
  if (!key) return ''
  const date = new Date(`${key}T12:00:00`)
  date.setDate(date.getDate() + amount)
  return date.toISOString().slice(0, 10)
}

export function eachNight(start, endExclusive) {
  const nights = []
  let cursor = dayKey(start)
  const end = dayKey(endExclusive)
  while (cursor && end && cursor < end) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function matchingClosures(blocks, roomSlugs = []) {
  return (blocks || []).filter((block) => {
    if (block.active === false) return false
    if (block.scope === 'hotel') return true
    if (!roomSlugs.length) return false
    const closed = new Set(roomKeys(block.rooms))
    return roomSlugs.some((slug) => closed.has(String(slug)))
  })
}

export function closedNightSet(blocks, roomSlugs = []) {
  const nights = new Set()
  matchingClosures(blocks, roomSlugs).forEach((block) => {
    eachNight(block.startDate, block.reopenDate).forEach((night) => nights.add(night))
  })
  return nights
}

export function isNightClosed(date, blocks, roomSlugs = []) {
  return closedNightSet(blocks, roomSlugs).has(dayKey(date))
}

export function stayHasClosedNight(checkIn, checkOut, blocks, roomSlugs = []) {
  return eachNight(checkIn, checkOut).some((night) => isNightClosed(night, blocks, roomSlugs))
}

export function describeClosure(block) {
  if (!block) return ''
  if (block.guestMessage) return block.guestMessage
  const from = formatDay(block.startDate)
  const last = formatDay(addDays(block.reopenDate, -1))
  const open = formatDay(block.reopenDate)
  const window = last && last !== from ? `${from}–${last}` : from
  return `${window} ${last && last !== from ? 'are' : 'is'} closed. Stay before ${from}, or check in from ${open}.`
}

export function guestClosureMessage(block) {
  return describeClosure(block)
}

export function closureSummaries(blocks, roomSlugs = []) {
  return matchingClosures(blocks, roomSlugs).map(describeClosure).filter(Boolean)
}

export function hotelClosedUntil(blocks) {
  const today = new Date().toISOString().slice(0, 10)
  const current = (blocks || []).filter(
    (block) =>
      block.active !== false &&
      block.scope === 'hotel' &&
      dayKey(block.startDate) <= today &&
      dayKey(block.reopenDate) > today,
  )
  if (!current.length) return null
  return current.sort((a, b) => dayKey(b.reopenDate).localeCompare(dayKey(a.reopenDate)))[0]
}
