import { useMemo, useState } from 'react'
import styles from './SiteAuditBoard.module.css'

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
    <svg className={styles.ring} viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="48" cy="48" r={radius} />
      <circle
        className={styles.ringFill}
        cx="48"
        cy="48"
        r={radius}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export default function SiteAuditBoard({ report, fixKey = 'staff' }) {
  const [openGroup, setOpenGroup] = useState('all')
  const [showReady, setShowReady] = useState(false)

  const groups = useMemo(() => {
    if (!report) return []
    if (openGroup === 'all') return report.groups
    return report.groups.filter((group) => group.id === openGroup)
  }, [openGroup, report])

  if (!report) return <p>Checking website content…</p>

  const missing = report.missing?.length ?? report.total - report.passed

  return (
    <div className={styles.board}>
      <div className={styles.hero}>
        <div className={styles.score}>
          <ScoreRing score={report.score} />
          <div>
            <b>{report.score}%</b>
            <span>complete</span>
          </div>
        </div>
        <div className={styles.summary}>
          <p className={styles.grade}>{report.grade.label}</p>
          <p>{report.grade.hint}</p>
          <small>
            {missing === 0
              ? 'Every checked item is in place.'
              : `${missing} item${missing === 1 ? '' : 's'} still need attention · ${report.passed} ready`}
          </small>
        </div>
      </div>

      <div className={styles.tiles}>
        <button
          type="button"
          className={`${styles.tile} ${openGroup === 'all' ? styles.tileOn : ''}`}
          onClick={() => setOpenGroup('all')}
        >
          <span>All areas</span>
          <strong>{report.score}%</strong>
          <i className={styles.bar} style={{ width: `${report.score}%` }} />
        </button>
        {report.groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`${styles.tile} ${styles[tone(group.score)]} ${openGroup === group.id ? styles.tileOn : ''}`}
            onClick={() => setOpenGroup(group.id === openGroup ? 'all' : group.id)}
          >
            <span>{group.label}</span>
            <strong>{group.score}%</strong>
            <small>
              {group.passed}/{group.total} ready
            </small>
            <i className={styles.bar} style={{ width: `${group.score}%` }} />
          </button>
        ))}
      </div>

      {groups.map((group) => {
        const gaps = group.items.filter((item) => !item.pass)
        const ready = group.items.filter((item) => item.pass)
        return (
          <article key={group.id} className={styles.section}>
            <header>
              <div>
                <h3>{group.label}</h3>
                <p>
                  {gaps.length
                    ? `${gaps.length} to finish`
                    : 'This area is complete'}
                </p>
              </div>
              <b className={styles[tone(group.score)]}>{group.score}%</b>
            </header>

            {gaps.length > 0 && (
              <ul className={styles.gaps}>
                {gaps.map((item) => (
                  <li key={item.id}>
                    <div>
                      <p>{item.label}</p>
                      {item.detail && <small>{item.detail}</small>}
                    </div>
                    {item.fix?.[fixKey] && (
                      <a href={item.fix[fixKey]}>Fix this</a>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {ready.length > 0 && (
              <details className={styles.ready} {...(showReady ? { open: true } : {})}>
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
        <button type="button" className={styles.toggle} onClick={() => setShowReady((value) => !value)}>
          {showReady ? 'Hide completed items' : 'Show completed items'}
        </button>
      )}
    </div>
  )
}
