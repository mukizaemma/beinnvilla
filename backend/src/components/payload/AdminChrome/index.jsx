'use client'

import React, { useEffect } from 'react'
import './adminChrome.css'

const HOME_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'

function isAuthScreen() {
  return /\/admin\/(login|forgot|reset)/.test(window.location.pathname)
}

function placeLoginChrome() {
  if (!isAuthScreen()) {
    document.body.classList.remove('ireme-login')
    document.getElementById('ireme-back-home')?.remove()
    return
  }

  document.body.classList.add('ireme-login')

  if (!document.getElementById('ireme-back-home')) {
    const link = document.createElement('a')
    link.id = 'ireme-back-home'
    link.href = HOME_URL
    link.textContent = '← Back to home'
    document.body.appendChild(link)
  }

  if (!document.getElementById('ireme-login-copy')) {
    const brand = document.querySelector('.login__brand')
    if (brand) {
      const copy = document.createElement('p')
      copy.id = 'ireme-login-copy'
      copy.textContent = 'Property staff access'
      brand.insertAdjacentElement('afterend', copy)
    }
  }
}

function applyCompanyFavicon(url) {
  if (!url) return
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'icon')
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') === url) return
  link.setAttribute('href', url)
}

function loadCompanyFavicon() {
  fetch('/api/globals/company?depth=1', { credentials: 'include' })
    .then((res) => (res.ok ? res.json() : null))
    .then((company) => {
      const file = company?.logo
      const url = typeof file === 'string' ? file : file?.url || file?.thumbnailURL
      applyCompanyFavicon(url)
    })
    .catch(() => {})
}

function removeExtraSave() {
  document.querySelectorAll('.ireme-form-save').forEach((node) => node.remove())
}

export function AdminChrome({ children }) {
  useEffect(() => {
    loadCompanyFavicon()
    const id = window.setInterval(() => {
      removeExtraSave()
      placeLoginChrome()
    }, 700)
    removeExtraSave()
    placeLoginChrome()
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      {children}
      <footer className="ireme-admin-footer">
        Developed by{' '}
        <a href="https://iremetech.com" target="_blank" rel="noopener noreferrer">
          Ireme Tech
        </a>
      </footer>
    </>
  )
}
