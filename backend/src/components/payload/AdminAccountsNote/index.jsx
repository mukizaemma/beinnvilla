import React from 'react'

export function AdminAccountsNote() {
  return (
    <div
      style={{
        padding: '1rem 1.15rem',
        background: '#f3ecdd',
        border: '1px solid #d8cdbe',
        borderRadius: 8,
        color: '#2b2b28',
        lineHeight: 1.5,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 6 }}>Admin accounts</strong>
      Staff emails and passwords are not stored in Site Settings. Open{' '}
      <a href="/admin/collections/users" style={{ color: '#15302e', fontWeight: 600 }}>
        Admin accounts
      </a>{' '}
      in the sidebar to create, edit, or deactivate users. The first account was created
      from the server; add more editors there.
    </div>
  )
}
