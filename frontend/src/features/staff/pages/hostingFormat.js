export function money(amount, currency) {
  if (amount == null || amount === '' || Number.isNaN(Number(amount))) return ''
  const digits = String(currency || '').toUpperCase() === 'RWF' ? 0 : 2
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return currency ? `${currency} ${formatted}` : formatted
}

export function roundMoney(amount, currency) {
  const digits = String(currency || '').toUpperCase() === 'RWF' ? 0 : 2
  const factor = 10 ** digits
  return Math.round((Number(amount) + Number.EPSILON) * factor) / factor
}

export function longDate(iso) {
  if (!iso) return ''
  const [year, month, day] = String(iso).slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function supportLabel(amount, currency) {
  if (amount == null || amount === '') return 'Still needs to be confirmed'
  return money(amount, currency)
}

export function hostingCell(invoice) {
  if (invoice.hostingInvoiceAmount != null) return money(invoice.hostingInvoiceAmount, invoice.invoiceCurrency)
  if (invoice.hostingAmount == null) return 'Still needs to be confirmed'
  return `${money(invoice.hostingAmount, invoice.hostingCurrency)} — the rate is still needed`
}

export function totalCell(invoice, needsRate) {
  if (invoice.total != null) return money(invoice.total, invoice.invoiceCurrency)
  if (needsRate && invoice.hostingInvoiceAmount == null) return 'Enter the current rate'
  return 'Still needs to be confirmed'
}
