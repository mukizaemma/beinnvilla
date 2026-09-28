/**
 * ABOUT PAGE
 * ─────────────────────────────────────────────────────────────
 * One hook for /about. Every section on that page (AboutHero,
 * AboutStory, AboutValues) calls this directly — same query key, so
 * only one request happens; the rest are cache hits. AboutCTA follows
 * the same pattern too, unlike BarRestaurantCTA — About's CTA group has
 * real CMS content (eyebrow/headline/body/button/backgroundImage), it
 * isn't hardcoded copy.
 * ─────────────────────────────────────────────────────────────
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'

async function fetchAboutPage() {
  const res = await apiClient.get('/api/globals/about-page?depth=2')
  const page = res.data

  return {
    hero: {
      eyebrow: page.hero?.eyebrow,
      headline: page.hero?.headline,
      intro: asPlain(page.hero?.intro),
      backgroundImage: mediaUrl(page.hero?.backgroundImage),
    },

    story: {
      eyebrow: page.story?.eyebrow,
      headline: page.story?.headline,
      paragraphs: (page.story?.paragraphs || []).map((p) => asPlain(p.text)),
      quote: page.story?.quote,
      image: mediaUrl(page.story?.image),
    },

    values: (page.values || []).map((v) => ({
      id: v.id,
      icon: v.icon,
      title: v.title,
      description: asPlain(v.description),
    })),

    cta: {
      eyebrow: page.cta?.eyebrow,
      headline: page.cta?.headline,
      body: asPlain(page.cta?.body),
      button: page.cta?.button || {},
      backgroundImage: mediaUrl(page.cta?.backgroundImage),
    },
  }
}

export function useAboutPage() {
  return useQuery({
    queryKey: ['about-page'],
    queryFn: fetchAboutPage,
    staleTime: 5 * 60 * 1000,
  })
}