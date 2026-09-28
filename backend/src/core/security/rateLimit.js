const WINDOW_MS = 10 * 60 * 1000
const MAX_CREATE = 8
const hits = new Map()

function clientIp(req) {
  const forwarded = req.headers?.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim()
  return req.ip || 'unknown'
}

function allow(ip, max) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((ts) => now - ts < WINDOW_MS)
  if (recent.length >= max) return false
  recent.push(now)
  hits.set(ip, recent)
  return true
}

/** Very small in-memory limiter for public booking creates. Not for multi-instance production. */
export function assertBookingCreateRateLimit(req) {
  return allow(clientIp(req), MAX_CREATE)
}

export function assertPublicFormRateLimit(req) {
  return allow(clientIp(req), 6)
}
