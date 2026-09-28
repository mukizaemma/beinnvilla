'use client'

import React from 'react'

const HOME = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'

export function UserGuideNote() {
  return (
    <div
      style={{
        background: '#faf7f0',
        border: '1px solid #e8dfd0',
        borderRadius: 12,
        padding: '1.1rem 1.2rem',
        color: '#1a2b4b',
      }}
    >
      <p style={{ margin: '0 0 0.65rem' }}>
        The hotel handbook lives on the public site so the team can open it without hunting through
        admin screens. It covers what was built, where to sign in, and how to manage each feature.
      </p>
      <p style={{ margin: 0 }}>
        <a href={`${HOME}/handover`} target="_blank" rel="noreferrer" style={{ color: '#1a2b4b', fontWeight: 700 }}>
          Open /handover
        </a>
        {' · '}
        <a href="/admin/collections/handover-feedback" style={{ color: '#c4a574', fontWeight: 700 }}>
          Read feedback
        </a>
      </p>
    </div>
  )
}
