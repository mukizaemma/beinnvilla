import React from 'react'

const staffUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'

export function StaffDeskNote() {
  return (
    <div
      style={{
        padding: '1rem 1.15rem',
        background: '#1a2b4b',
        color: '#f5efe6',
        borderRadius: 8,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 6, color: '#c4a574' }}>Property staff desk</strong>
      Add and edit rooms, activities, gallery, and page copy in simple modals at{' '}
      <a href={`${staffUrl}/staff`} target="_blank" rel="noreferrer" style={{ color: '#c4a574', fontWeight: 600 }}>
        {staffUrl}/staff
      </a>
      . Slugs are created automatically from the name.
    </div>
  )
}
