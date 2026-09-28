/**
 * SITE LAYOUT
 * ─────────────────────────────────────────────────────────────
 * Shared across every page — Navbar, Footer, MobileDrawer, and any page
 * section that needs company details (e.g. HomeCTA, RoomInfo). Not tied
 * to one route, so it isn't a "page" hook, but it follows the same
 * pattern: one hook, one query, cached and shared everywhere it's used.
 * ─────────────────────────────────────────────────────────────
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'

async function fetchSiteLayout() {
  const [companyRes, navigationRes] = await Promise.all([
    apiClient.get('/api/globals/company?depth=2'),
    apiClient.get('/api/globals/navigation?depth=2'),
  ])

  return {
    company: companyRes.data,
    navigation: navigationRes.data,
  }
}

export function useSiteLayout() {
  return useQuery({
    queryKey: ['site-layout'],
    queryFn: fetchSiteLayout,
    staleTime: 5 * 60 * 1000,
  })
}
