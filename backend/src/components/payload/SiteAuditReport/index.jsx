'use client'

import React, { useEffect, useMemo, useState } from 'react'
import './siteAuditReport.css'

const HOME = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'

function tone(score) {
  if (score >= 90) return 'good'
  if (score >= 70) return 'ok'
  return 'low'
}

function ScoreRing({ score }) {
  const radius = 38
  const circ = 2 * Math.PI * radius
  const offset = circ - (Math.max(0, Math.min(score, 100)) / 100) * circ
  return (
    <svg className="audit-board__ring" viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="48" cy="48" r={radius} />
      <circle
        className="audit-board__ring-fill"
        cx="48"
        cy="48"
        r={radius}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export function SiteAuditReport() {
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [openGroup, setOpenGroup] = useState('all')
  const [showReady, setShowReady] = useState(false)

  useEffect(() => {
    fetch('/api/site-audit/report', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then(setReport)
      .catch(() => setError('Could not load the live content score.'))
  }, [])

  const groups = useMemo(() => {
    if (!report) return []
    if (openGroup === 'all') return report.groups
    return report.groups.filter((group) => group.id === openGroup)
  }, [openGroup, report])

  if (error) return <p className="audit-board__error">{error}</p>
  if (!report) return <p>Checking website content…</p>

  const missing = report.missing?.length ?? report.total - report.passed

  return (
    <div className="audit-board">
      <div className="audit-board__hero">
        <div className="audit-board__score">
          <ScoreRing score={report.score} />
          <div>
            <b>{report.score}%</b>
            <span>complete</span>
          </div>
        </div>
        <div className="audit-board__summary">
          <p className="audit-board__grade">{report.grade.label}</p>
          <p>{report.grade.hint}</p>
          <small>
            {missing === 0
              ? 'Every checked item is in place.'
              : `${missing} item${missing === 1 ? '' : 's'} still need attention · ${report.passed} ready`}
          </small>
        </div>
      </div>

      <div className="audit-board__tiles">
        <button
          type="button"
          className={`audit-board__tile${openGroup === 'all' ? ' is-on' : ''}`}
          onClick={() => setOpenGroup('all')}
        >
          <span>All areas</span>
          <strong>{report.score}%</strong>
          <i style={{ width: `${report.score}%` }} />
        </button>
        {report.groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`audit-board__tile is-${tone(group.score)}${openGroup === group.id ? ' is-on' : ''}`}
            onClick={() => setOpenGroup(group.id === openGroup ? 'all' : group.id)}
          >
            <span>{group.label}</span>
            <strong>{group.score}%</strong>
            <small>
              {group.passed}/{group.total} ready
            </small>
            <i style={{ width: `${group.score}%` }} />
          </button>
        ))}
      </div>

      {groups.map((group) => {
        const gaps = group.items.filter((item) => !item.pass)
        const ready = group.items.filter((item) => item.pass)
        return (
          <article key={group.id} className="audit-board__section">
            <header>
              <div>
                <h3>{group.label}</h3>
                <p>{gaps.length ? `${gaps.length} to finish` : 'This area is complete'}</p>
              </div>
              <b className={`is-${tone(group.score)}`}>{group.score}%</b>
            </header>

            {gaps.length > 0 && (
              <ul className="audit-board__gaps">
                {gaps.map((item) => (
                  <li key={item.id}>
                    <div>
                      <p>{item.label}</p>
                      {item.detail && <small>{item.detail}</small>}
                    </div>
                    {item.fix?.admin && <a href={item.fix.admin}>Fix this</a>}
                  </li>
                ))}
              </ul>
            )}

            {ready.length > 0 && (
              <details className="audit-board__ready" {...(showReady ? { open: true } : {})}>
                <summary>
                  {ready.length} ready item{ready.length === 1 ? '' : 's'}
                </summary>
                <ul>
                  {ready.map((item) => (
                    <li key={item.id}>
                      <p>{item.label}</p>
                      {item.detail && <small>{item.detail}</small>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        )
      })}

      {missing > 0 && (
        <button type="button" className="audit-board__toggle" onClick={() => setShowReady((value) => !value)}>
          {showReady ? 'Hide completed items' : 'Show completed items'}
        </button>
      )}

      <p className="audit-board__handover">
        Property handbook:{' '}
        <a href={`${HOME}/handover`} target="_blank" rel="noreferrer">
          Open /handover
        </a>
      </p>
    </div>
  )
}
