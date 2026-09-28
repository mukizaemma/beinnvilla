/**
 * CONTACT PAGE
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptRoom, mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'

async function fetchContactPage() {
  const [pageRes, roomsRes] = await Promise.all([
    apiClient.get('/api/globals/contact-page?depth=2'),
    apiClient.get('/api/rooms?limit=100&depth=1'),
  ])

  const page = pageRes.data

  return {
    hero: {
      eyebrow: page.hero?.eyebrow || 'Get In Touch',
      headline: page.hero?.headline || "Let's Plan Your Stay",
      intro: asPlain(
        page.hero?.intro,
        "Questions, special requests, or ready to book — send us a message and we'll reply within 24 hours.",
      ),
      backgroundImage: mediaUrl(page.hero?.backgroundImage),
      cta: page.hero?.cta || {},
      secondaryCta: page.hero?.secondaryCta || {},
    },
    responseNote: page.responseNote || "We'll get back to you within 24 hours.",
    frontDeskNote: page.frontDeskNote || 'Front desk available 24/7',
    rooms: (roomsRes.data.docs || []).map(adaptRoom),
  }
}

export function useContactPage() {
  return useQuery({
    queryKey: ['contact-page'],
    queryFn: fetchContactPage,
    staleTime: 5 * 60 * 1000,
  })
}
