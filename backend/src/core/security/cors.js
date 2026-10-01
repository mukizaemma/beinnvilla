// Payload's own REST handlers (used by the [...slug] catch-all) apply
// CORS automatically from the `cors: []` array in payload.config.js.
// These custom payment routes are plain Next.js route handlers, though —
// nothing wraps them with that behavior, so without this they get no
// CORS headers at all and the browser blocks every request at the
// preflight OPTIONS step before it even reaches the route body.
//
// Same FRONTEND_URL fallback as payload.config.js, so this stays in
// sync with whatever origin Payload itself already allows.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

/** Wrap a NextResponse so it carries the CORS headers back to the browser. */
export function withCors(response) {
  const headers = corsHeaders()
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
  return response
}

/** Re-export this directly as `OPTIONS` in each route file — answers the preflight request. */
export function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}