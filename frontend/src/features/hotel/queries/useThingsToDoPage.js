import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'

async function fetchThingsToDoPage() {
  const res = await apiClient.get('/api/globals/things-to-do-page?depth=2')
  const page = res.data
  return {
    eyebrow: page.hero?.eyebrow,
    headline: page.hero?.headline,
    intro: asPlain(page.hero?.intro),
    backgroundImage: mediaUrl(page.hero?.backgroundImage),
    cta: page.hero?.cta || {},
    secondaryCta: page.hero?.secondaryCta || {},
  }
}

export function useThingsToDoPage() {
  return useQuery({
    queryKey: ['things-to-do-page'],
    queryFn: fetchThingsToDoPage,
    staleTime: 5 * 60 * 1000,
  })
}
