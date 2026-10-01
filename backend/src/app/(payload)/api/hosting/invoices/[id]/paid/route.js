import { handleOptions } from '../../../../../../../core/security/cors.js'
import { hostingError, hostingJson, hostingPayload, requireOperator } from '../../../../../../../modules/hotel/hosting/http.js'
import { markInvoicePaid, presentProfile } from '../../../../../../../modules/hotel/hosting/service.js'

export const OPTIONS = handleOptions

export async function POST(request, { params }) {
  try {
    const payload = await hostingPayload()
    const user = await requireOperator(request, payload)
    const { id } = await params
    const { profile, invoices } = await markInvoicePaid(payload, id, user)
    return hostingJson({ profile: presentProfile(profile), invoices })
  } catch (error) {
    return hostingError(error)
  }
}
