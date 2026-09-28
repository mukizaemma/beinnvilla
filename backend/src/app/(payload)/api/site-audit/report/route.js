import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../../payload.config.js'
import { withCors, handleOptions } from '../../../../../core/security/cors.js'
import { buildSiteAuditReport } from '../../../../../core/settings/siteAuditReport.js'

export const OPTIONS = handleOptions

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const report = await buildSiteAuditReport(payload)
    return withCors(NextResponse.json(report))
  } catch (error) {
    return withCors(NextResponse.json({ error: 'Could not build the site audit.' }, { status: 500 }))
  }
}
