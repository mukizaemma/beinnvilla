import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { staffClient } from '../api/staffClient'
import { useStaffAuth } from '../auth/StaffAuthContext'
import { hostingCell, longDate, money, supportLabel } from './hostingFormat'
import './StaffInvoicePage.css'

export default function StaffInvoicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, ready } = useStaffAuth()
  const [data, setData] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    document.title = 'Website hosting renewal invoice'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  useEffect(() => {
    if (ready && !user) navigate('/staff/login', { replace: true })
  }, [ready, user, navigate])

  useEffect(() => {
    if (!user) return
    staffClient
      .get(`/api/hosting/invoices/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setMissing(true))
  }, [user, id])

  if (!ready || !user) return null

  const profile = data?.profile
  const invoice = data?.invoice
  const status = invoice?.status === 'paid' ? 'Paid' : invoice?.status === 'expired' ? 'Expired' : 'Active'

  return (
    <div className="hostingInvoice">
      <div className="hostingInvoiceBar">
        <Link to="/staff/hosting">Back</Link>
        <button type="button" onClick={() => window.print()}>Print</button>
        <button type="button" onClick={() => window.print()}>Download PDF</button>
      </div>

      {!invoice && missing ? (
        <article className="hostingSheet">
          <p>That invoice is not on file.</p>
        </article>
      ) : null}

      {invoice && profile ? (
        <article className="hostingSheet">
          <header>
            <strong>{profile.issuer}</strong>
            <p><a href={profile.issuerUrl}>{profile.issuerUrl}</a></p>
            <p><a href={`mailto:${profile.issuerEmail}`}>{profile.issuerEmail}</a></p>
          </header>
          <h1>Website hosting renewal invoice</h1>
          <p>Invoice {invoice.number}</p>
          <p>Billed to {profile.client}</p>
          <p>Status: {status}</p>
          {profile.note ? <p className="hostingNote">{profile.note}</p> : <p className="hostingNote">The invoice note still needs to be confirmed.</p>}
          <table>
            <tbody>
              <tr>
                <th>{invoice.serviceLabel || profile.serviceLabel || 'Hosting'}</th>
                <td>{hostingCell(invoice)}</td>
              </tr>
              <tr>
                <th>Support</th>
                <td>{supportLabel(invoice.supportAmount, invoice.invoiceCurrency)}</td>
              </tr>
              <tr>
                <th>Period</th>
                <td>
                  {longDate(invoice.periodStart)} – {longDate(invoice.periodEnd)}
                </td>
              </tr>
              <tr className="hostingTotal">
                <th>Total</th>
                <td>
                  {invoice.total != null
                    ? money(invoice.total, invoice.invoiceCurrency)
                    : invoice.hostingInvoiceAmount == null && profile.needsRate
                      ? 'Enter the current rate'
                      : 'Still needs to be confirmed'}
                </td>
              </tr>
            </tbody>
          </table>
          <section>
            <h2>Payment</h2>
            {profile.paymentMethods?.length ? (
              profile.paymentMethods.map((line) => <p key={line}>{line}</p>)
            ) : (
              <p>Payment methods still need to be confirmed.</p>
            )}
          </section>
          <footer>
            <p>Prepared by {invoice.preparedBy}</p>
            <p>Issued {longDate(invoice.issuedOn)}</p>
          </footer>
        </article>
      ) : null}
    </div>
  )
}
