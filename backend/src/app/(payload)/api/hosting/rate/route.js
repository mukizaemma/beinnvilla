import { handleOptions } from '../../../../../core/security/cors.js'
import { hostingError, hostingJson, hostingPayload, requireOperator } from '../../../../../modules/hotel/hosting/http.js'
import { presentProfile, saveConversionRate } from '../../../../../modules/hotel/hosting/service.js'

export const OPTIONS = handleOptions

export async function POST(request) {
  try {
    const payload = await hostingPayload()
    await requireOperator(request, payload)
    const body = await request.json()
    const { profile, invoices } = await saveConversionRate(payload, body?.rate)
    return hostingJson({ profile: presentProfile(profile), invoices })
  } catch (error) {
    return hostingError(error)
  }
}
