import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../payload.config.js'
import { withCors, handleOptions } from '../../../../../core/security/cors.js'
import { addDays, buildRoomCalendar, dayKey } from '../../../../../modules/hotel/reservations/availability.js'

export const OPTIONS = handleOptions

export async function GET(request) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(request.url)
    const room = url.searchParams.get('room') || ''
    const from = dayKey(url.searchParams.get('from')) || dayKey(new Date())
    const to = dayKey(url.searchParams.get('to')) || addDays(from, 180)
    const calendar = await buildRoomCalendar(payload, { roomSlug: room, from, to })
    return withCors(NextResponse.json(calendar))
  } catch {
    return withCors(NextResponse.json({ error: 'Could not load availability.' }, { status: 500 }))
  }
}
