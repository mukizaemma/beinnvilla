'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_PAGES, isAdminPagePath } from '../pageNav.js'
import './pageSwitcher.css'

export function PageSwitcher() {
  const pathname = usePathname() || ''

  return (
    <nav className="page-switcher" aria-label="Pages">
      {ADMIN_PAGES.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link key={item.href} href={item.href} className={active ? 'is-active' : undefined}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function PageSwitcherMenu() {
  const pathname = usePathname() || ''
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const onPage = isAdminPagePath(pathname)

  useEffect(() => {
    function onPointer(event) {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  return (
    <div className="page-switcher-menu" ref={root}>
      <button
        type="button"
        className={onPage ? 'is-current' : undefined}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Pages
      </button>
      {open && (
        <div className="page-switcher-menu__list" role="menu">
          {ADMIN_PAGES.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={active ? 'is-active' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
