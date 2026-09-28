import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../payload.config.js'
import { withCors, handleOptions } from '../../../../../core/security/cors.js'
import { addDays, buildHouseCalendar, dayKey } from '../../../../../modules/hotel/reservations/availability.js'

export const OPTIONS = handleOptions

export async function GET(request) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(request.url)
    const today = dayKey(new Date())
    const from = dayKey(url.searchParams.get('from')) || today
    const start = from < today ? today : from
    const to = dayKey(url.searchParams.get('to')) || addDays(start, 120)
    const calendar = await buildHouseCalendar(payload, { from: start, to })
    return withCors(NextResponse.json(calendar))
  } catch {
    return withCors(NextResponse.json({ error: 'Could not load availability.' }, { status: 500 }))
  }
}
