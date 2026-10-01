/**
 * Commercial facts already written for BE Inn Villa.
 * Empty values are not filled from another client. The screen says they still need to be confirmed.
 *
 * The yearly renewal written for this product is $80 for the domain, hosting, and SSL.
 * No registrar, website host, separate support fee, renewal day, invoice sequence, or
 * payment instructions for that renewal are stored.
 */
export const HOSTING_FACTS = {
  product: 'BE Inn Villa',
  client: 'BE Inn Villa',
  issuer: 'Ireme Tech',
  issuerUrl: 'https://iremetech.com',
  issuerEmail: 'useadmin@iremetech.com',
  domain: 'beinnvilla.com',
  registrar: '',
  host: '',
  hostingFee: 80,
  hostingCurrency: 'USD',
  supportFee: null,
  supportCurrency: '',
  invoiceCurrency: 'USD',
  renewalMonth: null,
  renewalDay: null,
  serviceLabel: 'Domain, hosting, and SSL',
  note: 'Paid every year to renew the domain, hosting, and SSL. That renewal is $80.',
  paymentMethods: [],
  preparedBy: 'Ireme Tech',
  termYears: 1,
}

export function notifyAddress() {
  return String(process.env.BOOKING_NOTIFY_EMAIL || HOSTING_FACTS.issuerEmail).trim()
}

export function invoiceUrl(id) {
  const origin = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
  return `${origin}/staff/hosting/invoices/${id}`
}

export function pendingFacts(profile) {
  const missing = []
  if (!profile.registrar) missing.push('registrar')
  if (!profile.host) missing.push('host')
  if (profile.supportFee == null) missing.push('annual support fee')
  if (!profile.renewalMonth || !profile.renewalDay) missing.push('renewal date')
  if (!profile.paymentMethods?.length) missing.push('payment methods')
  return missing
}
