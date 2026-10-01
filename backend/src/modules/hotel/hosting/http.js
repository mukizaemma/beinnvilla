import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config.js'
import { withCors } from '../../../core/security/cors.js'

export async function hostingPayload() {
  return getPayload({ config })
}

export async function requireOperator(request, payload) {
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.status === 'inactive') {
    const error = new Error('Sign in to continue.')
    error.status = 401
    throw error
  }
  return user
}

export function hostingJson(body, status = 200) {
  return withCors(NextResponse.json(body, { status }))
}

export function hostingError(error) {
  const status = error?.status || 500
  const message = status === 500 ? 'Could not complete that hosting request.' : error.message
  return hostingJson({ error: message }, status)
}
