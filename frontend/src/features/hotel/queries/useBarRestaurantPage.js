/**
 * BAR & RESTAURANT PAGE
 * ─────────────────────────────────────────────────────────────
 * One hook for /bar-restaurant. Every section on that page
 * (BarRestaurantHero, BarRestaurantHours, BarRestaurantPanels,
 * BarRestaurantMenu headline, BarRestaurantVideo) calls this directly — same
 * query key, so only one request happens; the rest are cache hits.
 * BarRestaurantCTA is hardcoded copy with no CMS content, so it isn't
 * wired to anything here.
 * ─────────────────────────────────────────────────────────────
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'
import { DEFAULT_RESTAURANT_FEATURES } from '../restaurantSpotlight'

async function fetchBarRestaurantPage() {
  const res = await apiClient.get('/api/globals/bar-restaurant-page?depth=2')
  const page = res.data

  return {
    hero: {
      eyebrow: page.hero?.eyebrow,
      headline: page.hero?.headline,
      intro: asPlain(page.hero?.intro),
      cta: page.hero?.cta || {},
      videoUrl: mediaUrl(page.hero?.videoUrl),
      backgroundImage: mediaUrl(page.hero?.backgroundImage),
    },

    homeSpotlight: {
      eyebrow: page.homeSpotlight?.eyebrow || 'In-house',
      headline: page.homeSpotlight?.headline || 'Kitchen and a private bar',
      intro: page.homeSpotlight?.intro || 'Cook in the apartment kitchen. The bar is for your group staying in the villa — not a public hotel restaurant.',
      features: (page.homeSpotlight?.features || []).filter((item) => item.title).length
        ? page.homeSpotlight.features.map((item) => ({
            id: item.id,
            icon: item.icon,
            title: item.title,
            text: item.text,
          }))
        : DEFAULT_RESTAURANT_FEATURES,
      images: (page.homeSpotlight?.images || []).map((item) => mediaUrl(item.image)).filter(Boolean),
      cta: {
        label: page.homeSpotlight?.cta?.label || 'View menu',
        path: page.homeSpotlight?.cta?.path || '/bar-restaurant',
      },
    },

    hours: (page.hours || []).map((item) => ({
      id: item.id,
      icon: item.icon,
      label: item.label,
      hours: item.hours,
    })),

    panels: (page.panels || []).map((panel) => ({
      id: panel.id,
      title: panel.title,
      description: asPlain(panel.description),
      backgroundImage: mediaUrl(panel.backgroundImage),
    })),

    menu: {
      eyebrow: page.menu?.eyebrow || 'The menu',
      headline: page.menu?.headline || 'Eat and drink with us',
    },

    video: {
      eyebrow: page.video?.eyebrow,
      headline: page.video?.headline,
      videoUrl: page.video?.videoUrl || '',
      backgroundImage: mediaUrl(page.video?.backgroundImage),
    },

    cta: {
      headline: page.cta?.headline || 'Ready to reserve your table?',
      body: asPlain(page.cta?.body, "Send us your date and party size — we'll confirm within the day."),
      buttonLabel: page.cta?.buttonLabel || 'Reserve a Table',
      buttonPath: page.cta?.buttonPath || '/contact',
    },
  }
}

export function useBarRestaurantPage() {
  return useQuery({
    queryKey: ['bar-restaurant-page'],
    queryFn: fetchBarRestaurantPage,
    staleTime: 5 * 60 * 1000,
  })
}
