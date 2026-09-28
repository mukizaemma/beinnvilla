'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_PAGES } from '../pageNav.js'

const BEFORE_PAGES = [{ href: '/admin/globals/company', label: 'Site setting' }]

const AFTER_PAGES = [
  { href: '/admin/collections/rooms', label: 'Rooms' },
  { href: '/admin/collections/bookings', label: 'Bookings' },
  { href: '/admin/collections/availability-blocks', label: 'Availability' },
  { href: '/admin/collections/experiences', label: 'Activities' },
  { href: '/admin/collections/menu-items', label: 'Menu items' },
  { href: '/admin/collections/amenities', label: 'Amenities' },
  { href: '/admin/collections/gallery-photos', label: 'Site Gallery' },
  { href: '/admin/collections/media', label: 'Media Gallery' },
  { href: '/admin/globals/site-audit', label: 'Site audit' },
  { href: '/admin/globals/user-guide', label: 'User Guide' },
  { href: '/admin/collections/handover-feedback', label: 'Handover notes' },
  { href: '/admin/account', label: 'My account' },
]

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function HotelNav() {
  const pathname = usePathname() || ''
  const pageOpen = ADMIN_PAGES.some((item) => isActive(pathname, item.href))
  const [open, setOpen] = useState(pageOpen)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, margin: '0.25rem 0 0.75rem' }}>
      {BEFORE_PAGES.map((item) => (
        <NavItem key={item.href} item={item} pathname={pathname} />
      ))}

      <button type="button" style={styles.groupBtn} onClick={() => setOpen((value) => !value)}>
        Pages
        <span>{open ? '−' : '+'}</span>
      </button>
      {open &&
        ADMIN_PAGES.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} nested />
        ))}

      {AFTER_PAGES.map((item) => (
        <NavItem key={`${item.label}-${item.href}`} item={item} pathname={pathname} />
      ))}
    </div>
  )
}

function NavItem({ item, pathname, nested = false }) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      style={{
        ...styles.link,
        ...(nested ? styles.nested : null),
        ...(active ? styles.active : null),
      }}
    >
      {item.label}
    </Link>
  )
}

const styles = {
  link: {
    display: 'block',
    padding: '0.5rem 0.7rem',
    borderRadius: 6,
    color: 'var(--theme-elevation-800, #f5efe6)',
    textDecoration: 'none',
    fontSize: 14,
  },
  nested: {
    paddingLeft: '1.25rem',
    fontSize: 13,
  },
  active: {
    color: '#c4a574',
    background: 'rgba(196, 165, 116, 0.16)',
  },
  groupBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    border: 0,
    background: 'transparent',
    color: 'inherit',
    padding: '0.5rem 0.7rem',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'left',
  },
}
