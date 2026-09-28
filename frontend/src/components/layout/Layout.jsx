import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { BRAND } from '@features/hotel/brand'
import PageLoader from '@components/ui/PageLoader'
import FloatingCartBar from '@components/cart/FloatingCartBar'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './Layout.module.css'

const PAGE_TITLES = {
  '/': BRAND.name,
  '/book': `Book your Stay — ${BRAND.name}`,
  '/accommodation': `Accommodation — ${BRAND.name}`,
  '/facilities': `Facilities — ${BRAND.name}`,
  '/gallery': `Gallery — ${BRAND.name}`,
  '/visit': `Visit — ${BRAND.name}`,
  '/policy': `Booking policy — ${BRAND.name}`,
}

export default function Layout({ hasHero = false }) {
  const { pathname } = useLocation()
  const { data, isLoading, isError } = useSiteLayout()
  const company = data?.company

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    const brand = brandFromCompany(company).name
    const roomMatch = pathname.startsWith('/accommodation/') && pathname !== '/accommodation'
    const seoTitle = company?.seoTitle && !/grand villa|karongi|lake kivu/i.test(company.seoTitle)
      ? company.seoTitle
      : ''
    document.title = pathname === '/' && seoTitle
      ? seoTitle
      : roomMatch
        ? `Room — ${brand}`
        : PAGE_TITLES[pathname] || seoTitle || brand

    const description = company?.seoDescription && !/grand villa|karongi|lake kivu/i.test(company.seoDescription)
      ? company.seoDescription
      : ''
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    const keywords = company?.seoKeywords
    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'keywords')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', keywords)
    }

    applyCompanyFavicon(brandFromCompany(company).icon)
  }, [pathname, company])

  if (isLoading) {
    return <PageLoader />
  }

  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load site content. Please refresh, or try again shortly.
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar hasHero={hasHero} />
      <main className={`${styles.main} ${!hasHero ? styles.withOffset : ''}`}>
        <Outlet />
      </main>
      <Footer />
      <FloatingCartBar />
    </div>
  )
}
