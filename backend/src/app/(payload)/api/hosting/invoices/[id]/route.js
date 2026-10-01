import { handleOptions } from '../../../../../../core/security/cors.js'
import { hostingError, hostingJson, hostingPayload, requireOperator } from '../../../../../../modules/hotel/hosting/http.js'
import { presentProfile, syncInvoices } from '../../../../../../modules/hotel/hosting/service.js'

export const OPTIONS = handleOptions

export async function GET(request, { params }) {
  try {
    const payload = await hostingPayload()
    await requireOperator(request, payload)
    const { id } = await params
    const { profile, invoices } = await syncInvoices(payload)
    const invoice = invoices.find((item) => String(item.id) === String(id))
    if (!invoice) return hostingJson({ error: 'That invoice is not on file.' }, 404)
    return hostingJson({ profile: presentProfile(profile), invoice })
  } catch (error) {
    return hostingError(error)
  }
}
