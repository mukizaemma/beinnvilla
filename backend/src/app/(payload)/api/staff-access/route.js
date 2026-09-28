import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../payload.config.js'
import { withCors, handleOptions } from '../../../../core/security/cors.js'
import { isValidEmail } from '../../../../core/security/emailAddress.js'

export const OPTIONS = handleOptions

export async function POST(request) {
  try {
    const body = await request.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const firstName = String(body?.firstName || '').trim()
    const lastName = String(body?.lastName || '').trim()

    if (!firstName || !lastName) {
      return withCors(NextResponse.json({ errors: [{ message: 'Enter your first and last name.' }] }, { status: 400 }))
    }
    if (!isValidEmail(email)) {
      return withCors(NextResponse.json({ errors: [{ message: 'Enter a valid email address.' }] }, { status: 400 }))
    }
    if (password.length < 8) {
      return withCors(NextResponse.json({ errors: [{ message: 'Use a password of at least 8 characters.' }] }, { status: 400 }))
    }

    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      return withCors(
        NextResponse.json(
          { errors: [{ message: 'This email is already registered. If it is not approved yet, send it to Ireme Tech.' }] },
          { status: 400 },
        ),
      )
    }

    await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email,
        password,
        firstName,
        lastName,
        role: 'editor',
        status: 'inactive',
      },
    })

    return withCors(NextResponse.json({ ok: true, email }))
  } catch {
    return withCors(NextResponse.json({ errors: [{ message: 'Could not save this account. Try again in a few minutes.' }] }, { status: 500 }))
  }
}
