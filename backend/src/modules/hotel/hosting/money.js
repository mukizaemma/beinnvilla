export function currencyDigits(currency) {
  return String(currency || '').toUpperCase() === 'RWF' ? 0 : 2
}

export function roundMoney(amount, currency) {
  const digits = currencyDigits(currency)
  const factor = 10 ** digits
  return Math.round((Number(amount) + Number.EPSILON) * factor) / factor
}

export function formatMoney(amount, currency) {
  if (amount == null || amount === '' || Number.isNaN(Number(amount))) return ''
  const digits = currencyDigits(currency)
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return currency ? `${currency} ${formatted}` : formatted
}

export function currenciesDiffer(hostingCurrency, invoiceCurrency) {
  if (!hostingCurrency || !invoiceCurrency) return false
  return hostingCurrency.toUpperCase() !== invoiceCurrency.toUpperCase()
}

export function convertHosting(amount, rate, invoiceCurrency) {
  if (amount == null || rate == null || rate === '' || Number(rate) <= 0) return null
  return roundMoney(Number(amount) * Number(rate), invoiceCurrency)
}

export function invoiceTotal(hostingInvoiceAmount, supportAmount, currency) {
  if (hostingInvoiceAmount == null || supportAmount == null) return null
  return roundMoney(Number(hostingInvoiceAmount) + Number(supportAmount), currency)
}
