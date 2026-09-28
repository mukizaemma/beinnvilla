'use client'

import React, { useEffect, useState } from 'react'

function logoUrl(company) {
  const file = company?.logo
  if (!file) return ''
  const url = typeof file === 'string' ? file : file.url || file.thumbnailURL
  return url || ''
}

function initials(name) {
  return (
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'GV'
  )
}

export function Logo() {
  const [company, setCompany] = useState(null)

  useEffect(() => {
    fetch('/api/globals/company?depth=1', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setCompany)
      .catch(() => {})
  }, [])

  const name = company?.name || ''
  const src = logoUrl(company)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 0 1rem',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          width="72"
          height="72"
          style={{
            width: 72,
            height: 72,
            objectFit: 'contain',
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #c4a574',
            padding: 6,
          }}
        />
      ) : null}
      {name ? (
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.45rem',
            fontStyle: 'italic',
            color: '#1a2b4b',
            letterSpacing: '0.01em',
            textAlign: 'center',
          }}
        >
          {name}
        </span>
      ) : null}
    </div>
  )
}

export function CompanyMark() {
  const [company, setCompany] = useState(null)

  useEffect(() => {
    fetch('/api/globals/company?depth=1', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setCompany)
      .catch(() => {})
  }, [])

  const name = company?.name || ''
  const src = logoUrl(company)
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width="32"
        height="32"
        style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%', background: '#fff' }}
      />
    )
  }

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15.5" fill="#15302e" stroke="#d4af6a" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Fraunces', Georgia, serif"
        fontSize="11"
        fill="#f5efe6"
      >
        {initials(name)}
      </text>
    </svg>
  )
}
