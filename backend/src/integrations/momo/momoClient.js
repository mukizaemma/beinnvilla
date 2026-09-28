// MTN Mobile Money Collections API. Base URL is configurable because it
// differs by environment/country — sandbox is
// https://sandbox.momodeveloper.mtn.com, but production in Rwanda
// specifically is https://proxy.momoapi.mtn.co.rw (confirmed against
// MTN's own docs) — other markets may differ again.
//
// Requires MOMO_SUBSCRIPTION_KEY, MOMO_API_USER, MOMO_API_KEY,
// MOMO_TARGET_ENVIRONMENT ('sandbox' or your production env name), and
// MOMO_BASE_URL in your .env. Until all are set, MOMO_CONFIGURED is
// false and the routes below return an honest "not configured" response.
const MOMO_BASE_URL = process.env.MOMO_BASE_URL
const MOMO_SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY
const MOMO_API_USER = process.env.MOMO_API_USER
const MOMO_API_KEY = process.env.MOMO_API_KEY
const MOMO_TARGET_ENVIRONMENT = process.env.MOMO_TARGET_ENVIRONMENT

export const MOMO_CONFIGURED = Boolean(
  MOMO_BASE_URL && MOMO_SUBSCRIPTION_KEY && MOMO_API_USER && MOMO_API_KEY && MOMO_TARGET_ENVIRONMENT,
)

async function getMomoToken() {
  const credentials = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString('base64')
  const res = await fetch(`${MOMO_BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    },
  })
  if (!res.ok) throw new Error(`MoMo token request failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

/**
 * Kicks off a Request to Pay — the guest gets a USSD prompt on their
 * phone to approve. Returns the referenceId used to poll status
 * afterwards (see checkRequestToPayStatus).
 */
export async function requestToPay({ referenceId, amount, currency, externalId, phoneNumber }) {
  const token = await getMomoToken()

  const res = await fetch(`${MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': MOMO_TARGET_ENVIRONMENT,
      'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(amount),
      currency,
      externalId,
      payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
      payerMessage: 'BE Inn Villa booking payment',
      payeeNote: `Booking ${externalId}`,
    }),
  })

  // MoMo returns 202 Accepted with an empty body on success — there's
  // nothing else to read from a successful response.
  if (!res.ok) throw new Error(`MoMo requestToPay failed: ${res.status}`)
}

/** status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' */
export async function checkRequestToPayStatus(referenceId) {
  const token = await getMomoToken()

  const res = await fetch(`${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Target-Environment': MOMO_TARGET_ENVIRONMENT,
      'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    },
  })
  if (!res.ok) throw new Error(`MoMo status check failed: ${res.status}`)
  const data = await res.json()
  return data.status
}