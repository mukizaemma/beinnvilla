import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import SiteAuditBoard from '@features/handover/SiteAuditBoard'
import { staffClient } from '../api/staffClient'
import '../staff.css'

export default function StaffAudit() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    staffClient
      .get('/api/site-audit/report')
      .then((res) => setReport(res.data))
      .catch(() => toast.error('Could not load the site audit.'))
  }, [])

  return (
    <div className="staffPage">
      <h1>Site audit</h1>
      <p className="staffLead">
        Live score of company details, rooms, facilities, gallery photos, and page content. Open{' '}
        <Link to="/handover">/handover</Link> for the full hotel handbook.
      </p>
      <SiteAuditBoard report={report} />
    </div>
  )
}
