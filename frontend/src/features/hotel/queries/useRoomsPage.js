/**
 * ROOMS PAGE
 * ─────────────────────────────────────────────────────────────
 * One hook for /rooms (RoomsHero, RoomsHighlights, RoomsList) — and
 * reused as-is by RoomDetailPage (/rooms/:roomId), since that page just
 * needs to find one room by slug out of the same list rather than
 * warranting its own endpoint/hook.
 * ─────────────────────────────────────────────────────────────
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptRoom, mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'

async function fetchRoomsPage() {
  const [pageRes, roomsRes] = await Promise.all([
    apiClient.get('/api/globals/rooms-page?depth=2'),
    apiClient.get('/api/rooms?limit=100&depth=2'),
  ])

  const page = pageRes.data

  return {
    hero: {
      eyebrow: page.hero?.eyebrow,
      headline: page.hero?.headline,
      intro: asPlain(page.hero?.intro),
      backgroundImage: mediaUrl(page.hero?.backgroundImage),
      cta: page.hero?.cta || {},
      secondaryCta: page.hero?.secondaryCta || {},
    },
    highlights: (page.highlights || []).map((item) => ({
      id: item.id,
      icon: item.icon,
      label: item.label,
    })),
    rooms: roomsRes.data.docs.map(adaptRoom),
  }
}

export function useRoomsPage() {
  return useQuery({
    queryKey: ['rooms-page'],
    queryFn: fetchRoomsPage,
    staleTime: 5 * 60 * 1000,
  })
}
