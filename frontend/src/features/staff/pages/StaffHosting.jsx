import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import { useStaffAuth } from '../auth/StaffAuthContext'
import { hostingCell, money, roundMoney, supportLabel, totalCell } from './hostingFormat'
import styles from './StaffHosting.module.css'
import '../staff.css'

function facts(profile) {
  if (!profile) return []
  const cards = []
  if (profile.registrar) cards.push({ label: 'Registrar', value: profile.registrar })
  if (profile.host) cards.push({ label: 'Host', value: profile.host })
  if (profile.domain) cards.push({ label: 'Domain', value: profile.domain })
  if (profile.hostingFee != null) {
    cards.push({
      label: 'Annual hosting',
      value: money(profile.hostingFee, profile.hostingCurrency),
      note: profile.serviceLabel,
    })
  }
  if (profile.supportFee != null) {
    cards.push({
      label: 'Annual support',
      value: supportLabel(profile.supportFee, profile.supportCurrency || profile.invoiceCurrency),
    })
  }
  if (profile.reminderEmail) {
    cards.push({
      label: 'Reminder email',
      value: profile.reminderEmail,
      note: 'Reminders go out 30 days before, 15 days before, and on the renewal date.',
    })
  }
  return cards
}

export default function StaffHosting() {
  const { user } = useStaffAuth()
  const [data, setData] = useState(null)
  const [rate, setRate] = useState('')
  const [saving, setSaving] = useState(false)
  const rateRef = useRef(null)
  const canMarkPaid = user?.role === 'superadmin'

  function apply(next) {
    setData(next)
    if (next?.profile?.conversionRate) setRate(String(next.profile.conversionRate))
  }

  useEffect(() => {
    staffClient
      .get('/api/hosting')
      .then((res) => apply(res.data))
      .catch((error) => toast.error(error.response?.data?.error || 'Could not load hosting.'))
  }, [])

  const profile = data?.profile
  const cards = facts(profile)
  const preview = useMemo(() => {
    if (!profile?.needsRate || profile.hostingFee == null || rate === '') return null
    const value = Number(rate)
    if (!Number.isFinite(value) || value <= 0) return null
    const hosting = roundMoney(profile.hostingFee * value, profile.invoiceCurrency)
    const total = profile.supportFee == null ? null : roundMoney(hosting + Number(profile.supportFee), profile.invoiceCurrency)
    return { hosting, total }
  }, [profile, rate])

  async function saveRate(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const res = await staffClient.post('/api/hosting/rate', { rate: Number(rate) })
      apply(res.data)
      toast.success('Rate saved.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not save the rate.')
    } finally {
      setSaving(false)
    }
  }

  async function markPaid(invoice) {
    if (invoice.total == null && profile?.needsRate) {
      toast.error('Enter the current rate first.')
      rateRef.current?.focus()
      return
    }
    if (invoice.total == null) {
      toast.error('The support fee still needs to be confirmed.')
      return
    }
    if (!window.confirm(`Mark invoice ${invoice.number} as paid?`)) return
    try {
      const res = await staffClient.post(`/api/hosting/invoices/${invoice.id}/paid`)
      apply(res.data)
      toast.success(`Invoice ${invoice.number} is paid.`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not mark that invoice paid.')
    }
  }

  const renewal = profile?.renewalLabel
    ? `Renewal is ${profile.renewalLabel}.`
    : 'The renewal date still needs to be confirmed.'

  return (
    <div className="staffPage">
      <h1>Hosting</h1>
      <p className="staffLead">
        {renewal} An unpaid invoice becomes expired on that date until a Super admin confirms payment.
        {!profile?.reminderEmail && profile ? (
          <>
            {' '}
            Reminders go out 30 days before, 15 days before, and on the renewal date. They are sent to{' '}
            {profile.notifyEmail} until a reminder email is set.
          </>
        ) : null}
      </p>

      {cards.length ? (
        <div className="staffStats">
          {cards.map((card) => (
            <div className="staffStat" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              {card.note ? <div className={styles.cardNote}>{card.note}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      {profile?.pending?.length ? (
        <p className={styles.pending}>These still need to be confirmed: {profile.pending.join(', ')}.</p>
      ) : null}

      {profile?.needsRate ? (
        <form className={styles.rate} onSubmit={saveRate}>
          <label className="staffField">
            Current rate, 1 {profile.hostingCurrency} in {profile.invoiceCurrency}
            <input
              ref={rateRef}
              required
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </label>
          <p>
            Hosting in {profile.invoiceCurrency}:{' '}
            {preview ? money(preview.hosting, profile.invoiceCurrency) : 'Enter the rate'}
          </p>
          <p>
            Total:{' '}
            {preview?.total != null
              ? money(preview.total, profile.invoiceCurrency)
              : 'The support fee still needs to be confirmed'}
          </p>
          <button className="staffBtn" type="submit" disabled={saving}>
            Save rate
          </button>
        </form>
      ) : profile?.hostingFee != null ? (
        <p className={styles.direct}>
          Total:{' '}
          {profile.supportFee == null
            ? 'still needs to be confirmed'
            : money(Number(profile.hostingFee) + Number(profile.supportFee), profile.invoiceCurrency)}
        </p>
      ) : null}

      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Period</th>
              <th>Hosting</th>
              <th>Support</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data && !data.invoices.length ? (
              <tr>
                <td colSpan={7}>No invoice yet. The renewal date still needs to be confirmed before a period can be opened.</td>
              </tr>
            ) : null}
            {(data?.invoices || []).map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.number}</td>
                <td>
                  {invoice.periodStart} – {invoice.periodEnd}
                </td>
                <td>{hostingCell(invoice)}</td>
                <td>{supportLabel(invoice.supportAmount, invoice.invoiceCurrency)}</td>
                <td>{totalCell(invoice, profile?.needsRate)}</td>
                <td>
                  <span className={`${styles.badge} ${styles[invoice.status]}`}>
                    {invoice.status === 'paid' ? 'Paid' : invoice.status === 'expired' ? 'Expired' : 'Active'}
                  </span>
                </td>
                <td className="rowActions">
                  <Link to={`/staff/hosting/invoices/${invoice.id}`}>View / print</Link>
                  {canMarkPaid && invoice.status !== 'paid' ? (
                    <button type="button" className="staffBtn" onClick={() => markPaid(invoice)}>
                      Mark paid
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
