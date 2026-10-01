import { isValidEmail } from '../../../core/security/emailAddress.js'
import { HOSTING_FACTS, invoiceUrl, notifyAddress, pendingFacts } from './facts.js'
import { convertHosting, currenciesDiffer, formatMoney, invoiceTotal, roundMoney } from './money.js'
import {
  addYears,
  daysUntil,
  longDate,
  milestoneFor,
  nextInvoiceNumber,
  openPeriod,
  renewalLabel,
  statusFor,
  todayInKigali,
} from './periods.js'

const PROFILE = 'hosting-profile'

function dayKey(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function amountsFor(profile) {
  const differ = currenciesDiffer(profile.hostingCurrency, profile.invoiceCurrency)
  const hostingAmount = profile.hostingFee
  let hostingInvoiceAmount = null
  let rate = null
  if (hostingAmount == null) {
    hostingInvoiceAmount = null
  } else if (!differ) {
    hostingInvoiceAmount = roundMoney(hostingAmount, profile.invoiceCurrency)
  } else if (profile.conversionRate) {
    rate = Number(profile.conversionRate)
    hostingInvoiceAmount = convertHosting(hostingAmount, rate, profile.invoiceCurrency)
  }
  const supportAmount = profile.supportFee
  const total = invoiceTotal(hostingInvoiceAmount, supportAmount, profile.invoiceCurrency)
  return { hostingAmount, hostingInvoiceAmount, supportAmount, rate, total, differ }
}

export async function loadProfile(payload) {
  const current = await payload.findGlobal({ slug: PROFILE, overrideAccess: true })
  const source = {
    registrar: HOSTING_FACTS.registrar,
    host: HOSTING_FACTS.host,
    domain: HOSTING_FACTS.domain,
    hostingFee: HOSTING_FACTS.hostingFee,
    hostingCurrency: HOSTING_FACTS.hostingCurrency,
    supportFee: HOSTING_FACTS.supportFee,
    supportCurrency: HOSTING_FACTS.supportCurrency,
    invoiceCurrency: HOSTING_FACTS.invoiceCurrency,
    renewalMonth: HOSTING_FACTS.renewalMonth,
    renewalDay: HOSTING_FACTS.renewalDay,
    serviceLabel: HOSTING_FACTS.serviceLabel,
    note: HOSTING_FACTS.note,
    preparedBy: HOSTING_FACTS.preparedBy,
  }
  const data = Object.fromEntries(Object.entries(source).filter(([, value]) => value != null && value !== ''))
  const changed = Object.entries(data).some(([key, value]) => current?.[key] !== value)
  if (!changed) return current
  return payload.updateGlobal({ slug: PROFILE, data, overrideAccess: true })
}

async function listInvoices(payload) {
  const result = await payload.find({
    collection: 'hosting-invoices',
    limit: 200,
    depth: 0,
    sort: '-periodEnd',
    overrideAccess: true,
  })
  return result.docs || []
}

function presentInvoice(doc) {
  return {
    id: doc.id,
    number: doc.number,
    periodStart: dayKey(doc.periodStart),
    periodEnd: dayKey(doc.periodEnd),
    issuedOn: dayKey(doc.issuedOn),
    serviceLabel: doc.serviceLabel || '',
    hostingAmount: doc.hostingAmount ?? null,
    hostingCurrency: doc.hostingCurrency || '',
    hostingInvoiceAmount: doc.hostingInvoiceAmount ?? null,
    supportAmount: doc.supportAmount ?? null,
    invoiceCurrency: doc.invoiceCurrency || '',
    rate: doc.rate ?? null,
    total: doc.total ?? null,
    status: doc.status,
    paidOn: dayKey(doc.paidOn),
    preparedBy: doc.preparedBy || HOSTING_FACTS.preparedBy,
  }
}

export function presentProfile(profile) {
  const paymentMethods = HOSTING_FACTS.paymentMethods
  const view = {
    product: HOSTING_FACTS.product,
    client: HOSTING_FACTS.client,
    issuer: HOSTING_FACTS.issuer,
    issuerUrl: HOSTING_FACTS.issuerUrl,
    issuerEmail: HOSTING_FACTS.issuerEmail,
    registrar: profile.registrar || '',
    host: profile.host || '',
    domain: profile.domain || '',
    hostingFee: profile.hostingFee ?? null,
    hostingCurrency: profile.hostingCurrency || '',
    supportFee: profile.supportFee ?? null,
    supportCurrency: profile.supportCurrency || '',
    invoiceCurrency: profile.invoiceCurrency || '',
    conversionRate: profile.conversionRate ?? null,
    reminderEmail: profile.reminderEmail || '',
    renewalMonth: profile.renewalMonth || null,
    renewalDay: profile.renewalDay || null,
    renewalLabel: renewalLabel(profile.renewalMonth, profile.renewalDay),
    serviceLabel: profile.serviceLabel || '',
    note: profile.note || '',
    paymentMethods,
    preparedBy: profile.preparedBy || HOSTING_FACTS.preparedBy,
    notifyEmail: notifyAddress(),
  }
  view.needsRate = currenciesDiffer(view.hostingCurrency, view.invoiceCurrency)
  view.pending = pendingFacts(view)
  return view
}

export async function syncInvoices(payload, now = new Date()) {
  const profile = await loadProfile(payload)
  const today = todayInKigali(now).date
  let docs = await listInvoices(payload)

  for (const doc of docs) {
    if (doc.status === 'paid') continue
    const next = statusFor(today, dayKey(doc.periodEnd), doc.status)
    if (next !== doc.status) {
      await payload.update({
        collection: 'hosting-invoices',
        id: doc.id,
        data: { status: next },
        overrideAccess: true,
      })
    }
  }
  docs = await listInvoices(payload)

  if (!profile.renewalMonth || !profile.renewalDay || profile.hostingFee == null) {
    return { profile, invoices: docs.map(presentInvoice) }
  }

  const numbers = docs.map((doc) => doc.number)
  const createFrom = async (start, end) => {
    const amounts = amountsFor(profile)
    const number = nextInvoiceNumber(numbers, start)
    numbers.push(number)
    const status = statusFor(today, end, 'active')
    await payload.create({
      collection: 'hosting-invoices',
      data: {
        number,
        periodStart: start,
        periodEnd: end,
        issuedOn: today,
        serviceLabel: profile.serviceLabel || HOSTING_FACTS.serviceLabel,
        hostingAmount: amounts.hostingAmount,
        hostingCurrency: profile.hostingCurrency,
        hostingInvoiceAmount: amounts.hostingInvoiceAmount,
        supportAmount: amounts.supportAmount,
        invoiceCurrency: profile.invoiceCurrency,
        rate: amounts.rate,
        total: amounts.total,
        status,
        preparedBy: profile.preparedBy || HOSTING_FACTS.preparedBy,
      },
      overrideAccess: true,
    })
  }

  if (!docs.length) {
    const open = openPeriod(today, profile.renewalMonth, profile.renewalDay, HOSTING_FACTS.termYears)
    await createFrom(open.start, open.end)
  } else {
    let guard = 0
    while (guard < 20) {
      guard += 1
      const latest = docs.map((doc) => dayKey(doc.periodEnd)).sort().at(-1)
      if (!latest || latest > today) break
      const start = latest
      const end = addYears(start, HOSTING_FACTS.termYears)
      const exists = docs.some((doc) => dayKey(doc.periodStart) === start && dayKey(doc.periodEnd) === end)
      if (!exists) await createFrom(start, end)
      docs = await listInvoices(payload)
      if (end > today) break
    }
  }

  docs = await listInvoices(payload)
  return { profile, invoices: docs.map(presentInvoice) }
}

export async function saveConversionRate(payload, rate) {
  const profile = await loadProfile(payload)
  if (!currenciesDiffer(profile.hostingCurrency, profile.invoiceCurrency)) {
    const error = new Error('The hosting fee and the invoice use the same currency.')
    error.status = 400
    throw error
  }
  const value = Number(rate)
  if (!Number.isFinite(value) || value <= 0) {
    const error = new Error('Enter the current rate.')
    error.status = 400
    throw error
  }
  await payload.updateGlobal({
    slug: PROFILE,
    data: { conversionRate: value },
    overrideAccess: true,
  })
  const docs = await listInvoices(payload)
  for (const doc of docs) {
    if (doc.status === 'paid') continue
    if (doc.hostingAmount == null) continue
    const hostingInvoiceAmount = convertHosting(doc.hostingAmount, value, doc.invoiceCurrency || profile.invoiceCurrency)
    const total = invoiceTotal(hostingInvoiceAmount, doc.supportAmount ?? null, doc.invoiceCurrency || profile.invoiceCurrency)
    await payload.update({
      collection: 'hosting-invoices',
      id: doc.id,
      data: { hostingInvoiceAmount, rate: value, total },
      overrideAccess: true,
    })
  }
  return syncInvoices(payload)
}

export async function markInvoicePaid(payload, id, user) {
  if (user?.role !== 'superadmin') {
    const error = new Error('Only a Super admin can mark an invoice paid.')
    error.status = 403
    throw error
  }
  const doc = await payload.findByID({
    collection: 'hosting-invoices',
    id,
    depth: 0,
    overrideAccess: true,
  })
  if (!doc) {
    const error = new Error('That invoice is not on file.')
    error.status = 404
    throw error
  }
  if (doc.status === 'paid') {
    const error = new Error('This invoice is already paid.')
    error.status = 400
    throw error
  }
  const profile = await loadProfile(payload)
  if (currenciesDiffer(profile.hostingCurrency, profile.invoiceCurrency) && doc.hostingInvoiceAmount == null) {
    const error = new Error('Enter the current rate first.')
    error.status = 400
    throw error
  }
  if (doc.total == null) {
    const error = new Error(
      doc.supportAmount == null
        ? 'The support fee still needs to be confirmed.'
        : 'Enter the current rate first.',
    )
    error.status = 400
    throw error
  }
  const today = todayInKigali().date
  await payload.update({
    collection: 'hosting-invoices',
    id,
    data: { status: 'paid', paidOn: today },
    overrideAccess: true,
  })
  return syncInvoices(payload)
}

function subjectFor(product, milestone) {
  if (milestone === '30') return `${product} hosting renewal — 30 days left`
  if (milestone === '15') return `${product} hosting renewal — 15 days left`
  if (milestone === 'renewal') return `${product} hosting renewal is due today`
  return `${product} hosting renewal is overdue`
}

function amountLine(invoice) {
  if (invoice.total != null) return formatMoney(invoice.total, invoice.invoiceCurrency)
  if (invoice.hostingInvoiceAmount == null && invoice.hostingAmount != null && invoice.hostingCurrency && invoice.invoiceCurrency && invoice.hostingCurrency !== invoice.invoiceCurrency) {
    return 'the rate is not set yet'
  }
  if (invoice.total == null) return 'the amount still needs to be confirmed'
  return 'the rate is not set yet'
}

function reminderText(invoice) {
  const payment = HOSTING_FACTS.paymentMethods.length
    ? HOSTING_FACTS.paymentMethods.join('\n')
    : 'Payment methods still need to be confirmed.'
  return [
    HOSTING_FACTS.issuer,
    `Invoice ${invoice.number}`,
    `Period: ${longDate(invoice.periodStart)} to ${longDate(invoice.periodEnd)}`,
    `End date: ${longDate(invoice.periodEnd)}`,
    `Amount: ${amountLine(invoice)}`,
    '',
    payment,
    '',
    invoiceUrl(invoice.id),
    '',
    `An unpaid invoice stays expired until ${HOSTING_FACTS.issuer} confirms payment.`,
  ].join('\n')
}

export async function sendDueReminders(payload, now = new Date()) {
  const { invoices } = await syncInvoices(payload, now)
  const profile = await loadProfile(payload)
  const today = todayInKigali(now).date
  const reminderEmail = String(profile.reminderEmail || '').trim()
  const to = reminderEmail || notifyAddress()
  if (!isValidEmail(to)) {
    payload.logger?.warn?.(`Hosting reminder skipped. ${to || 'No address'} is not a valid email.`)
    return { sent: 0 }
  }

  const existing = await payload.find({
    collection: 'hosting-reminders',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const sentKeys = new Set(
    (existing.docs || []).map((doc) => `${typeof doc.invoice === 'object' ? doc.invoice?.id : doc.invoice}:${doc.milestone}`),
  )

  let sent = 0
  for (const invoice of invoices) {
    const milestone = milestoneFor(today, invoice.periodEnd, invoice.status)
    if (!milestone) continue
    const key = `${invoice.id}:${milestone}`
    if (sentKeys.has(key)) continue
    const subject = subjectFor(HOSTING_FACTS.product, milestone)
    const text = reminderText(invoice)
    try {
      await payload.sendEmail({
        to,
        subject,
        text,
        html: text
        .split('\n')
        .map((line) => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;') || '&nbsp;'}</p>`)
        .join(''),
      })
    } catch (error) {
      payload.logger?.warn?.(`Hosting reminder was not accepted for invoice ${invoice.number}.`)
      payload.logger?.error?.(error)
      continue
    }
    await payload.create({
      collection: 'hosting-reminders',
      data: { invoice: invoice.id, milestone, sentAt: new Date().toISOString() },
      overrideAccess: true,
    })
    sentKeys.add(key)
    sent += 1
  }
  return { sent }
}

export async function runMorningSweep(payload, now = new Date()) {
  const { date, hour } = todayInKigali(now)
  if (hour < 7 || hour >= 11) return { skipped: true }
  const profile = await loadProfile(payload)
  if (profile.lastReminderSweep === date) return { skipped: true }
  const result = await sendDueReminders(payload, now)
  await payload.updateGlobal({
    slug: PROFILE,
    data: { lastReminderSweep: date },
    overrideAccess: true,
  })
  return result
}

export function daysLeft(invoice, now = new Date()) {
  return daysUntil(todayInKigali(now).date, invoice.periodEnd)
}
