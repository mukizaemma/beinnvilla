import { handleOptions } from '../../../../core/security/cors.js'
import { hostingError, hostingJson, hostingPayload, requireOperator } from '../../../../modules/hotel/hosting/http.js'
import { presentProfile, syncInvoices } from '../../../../modules/hotel/hosting/service.js'

export const OPTIONS = handleOptions

export async function GET(request) {
  try {
    const payload = await hostingPayload()
    await requireOperator(request, payload)
    const { profile, invoices } = await syncInvoices(payload)
    return hostingJson({ profile: presentProfile(profile), invoices })
  } catch (error) {
    return hostingError(error)
  }
}
