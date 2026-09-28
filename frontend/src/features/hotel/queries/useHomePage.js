/**
 * HOME PAGE
 * One hook for the whole Home page. HomePage.jsx gates loading/error;
 * each section calls it again — same query key, so React Query serves
 * it from cache.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptRoom, mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'
import { DEFAULT_HOME_FEATURES } from '../homeFeatures'
import {
  DESTINATION,
  EXPERIENCES_SECTION,
  HOME_CTA,
  LOCATION_HIGHLIGHTS,
  ROOMS_SECTION,
} from '../lakeStay'

const LEGACY_WELCOME_HEADLINE = 'A private apartment for your whole group'
const LEGACY_ROOMS_HEADLINE = 'One villa. Your whole group.'
const LEGACY_FEATURE_TITLES = new Set([
  'The whole villa',
  'Kitchen & private bar',
  'Boat for your stay',
  'Air-con and hot water',
])

function preferFresh(value, stale, fresh) {
  if (!value || value === stale) return fresh
  return value
}

function adaptFeatures(rows) {
  const features = (rows || [])
    .map((item) => ({
      id: item.id,
      icon: item.icon,
      title: item.title,
      text: item.text,
    }))
    .filter((item) => item.title)
  const looksLegacy =
    features.length > 0 && features.every((item) => LEGACY_FEATURE_TITLES.has(item.title))
  return looksLegacy || !features.length ? DEFAULT_HOME_FEATURES : features
}

function welcomeBody(raw) {
  const text = asPlain(raw)
  if (!text) return DESTINATION.body
  if (/six bedrooms, six bathrooms, a kitchen, and a private bar/i.test(text)) return DESTINATION.body
  return text
}

function adaptHighlights(rows) {
  const highlights = (rows || []).map((item) => item.text).filter(Boolean)
  const repeatsVilla = highlights.some((text) => /six bedrooms|in-house bar/i.test(text))
  return repeatsVilla || !highlights.length ? LOCATION_HIGHLIGHTS : highlights
}

async function fetchHomePage() {
  const [pageRes, roomsRes] = await Promise.all([
    apiClient.get('/api/globals/home-page?depth=2'),
    apiClient.get('/api/rooms?limit=100&depth=2'),
  ])

  const page = pageRes.data
  const rooms = roomsRes.data.docs.map(adaptRoom)

  return {
    hero: {
      slides: (page.hero?.slides || []).map((slide) => ({
        id: slide.id,
        eyebrow: slide.eyebrow,
        headline: slide.headline,
        subline: asPlain(slide.subline),
        image: mediaUrl(slide.image),
      })),
      cta: {
        label: page.hero?.cta?.label || 'Book the apartment',
        link: page.hero?.cta?.link || '/book',
      },
      secondaryCta: {
        label: page.hero?.secondaryCta?.label || 'Explore the lake',
        link: page.hero?.secondaryCta?.link || '/things-to-do',
      },
    },

    features: adaptFeatures(page.features),
    gallery: (page.homeGallery || []).map((item) => mediaUrl(item.photo)).filter(Boolean).slice(0, 5),

    destination: {
      eyebrow: page.welcome?.eyebrow || DESTINATION.eyebrow,
      headline: preferFresh(page.welcome?.headline, LEGACY_WELCOME_HEADLINE, DESTINATION.headline),
      body: welcomeBody(page.welcome?.body),
      cta: {
        label: page.welcome?.cta?.label === 'See the apartment' ? DESTINATION.cta.label : page.welcome?.cta?.label || DESTINATION.cta.label,
        path: page.welcome?.cta?.path === '/accommodation' ? DESTINATION.cta.path : page.welcome?.cta?.path || DESTINATION.cta.path,
      },
      images: {
        primary: mediaUrl(page.welcome?.primaryImage),
        secondary: mediaUrl(page.welcome?.secondaryImage),
      },
      facts: DESTINATION.facts,
    },

    welcome: {
      eyebrow: page.welcome?.eyebrow,
      headline: page.welcome?.headline,
      body: asPlain(page.welcome?.body),
      cta: page.welcome?.cta || {},
      images: {
        primary: mediaUrl(page.welcome?.primaryImage),
        secondary: mediaUrl(page.welcome?.secondaryImage),
      },
      reviewBadges: (page.welcome?.reviewBadges || []).map((badge) => ({
        id: badge.id,
        source: badge.source,
        score: badge.score,
        tier: badge.tier,
        reviewCount: badge.reviewCount,
      })),
    },

    roomsSection: {
      eyebrow: preferFresh(page.roomsSection?.eyebrow, 'The apartment', ROOMS_SECTION.eyebrow),
      headline: preferFresh(page.roomsSection?.headline, LEGACY_ROOMS_HEADLINE, ROOMS_SECTION.headline),
      intro: preferFresh(
        page.roomsSection?.intro,
        'Six bedrooms, six bathrooms, a kitchen, a private bar, air conditioning, and hot water. Take the building for the lake — $150 a night without breakfast, $200 with breakfast, or $2,500 a month.',
        ROOMS_SECTION.intro,
      ),
    },

    experiencesSection: {
      eyebrow: page.experiencesSection?.eyebrow || EXPERIENCES_SECTION.eyebrow,
      headline: page.experiencesSection?.headline || EXPERIENCES_SECTION.headline,
      intro: page.experiencesSection?.intro || EXPERIENCES_SECTION.intro,
    },

    barRestaurant: {
      eyebrow: page.barRestaurantSpotlight?.eyebrow,
      headline: page.barRestaurantSpotlight?.headline,
      body: asPlain(page.barRestaurantSpotlight?.body),
      cta: page.barRestaurantSpotlight?.cta || {},
      highlights: (page.barRestaurantSpotlight?.highlights || []).map((item) => ({
        ...item,
        description: asPlain(item.description),
      })),
      images: {
        primary: mediaUrl(page.barRestaurantSpotlight?.images?.primary),
        secondary: mediaUrl(page.barRestaurantSpotlight?.images?.secondary),
      },
      captions: {
        primary: page.barRestaurantSpotlight?.captions?.primary,
        secondary: page.barRestaurantSpotlight?.captions?.secondary,
      },
    },

    location: {
      eyebrow: page.location?.eyebrow || 'Karongi',
      headline: page.location?.headline || 'On the western shore of Lake Kivu',
      body: asPlain(page.location?.body),
      highlights: adaptHighlights(page.location?.highlights),
      highlightFallback: LOCATION_HIGHLIGHTS,
      cta: {
        label: page.location?.cta?.label || 'Get directions',
        path: page.location?.cta?.path || '/contact',
      },
      image: mediaUrl(page.location?.image),
    },

    cta: {
      eyebrow: page.cta?.eyebrow || HOME_CTA.eyebrow,
      headline: page.cta?.headline || HOME_CTA.headline,
      body: asPlain(page.cta?.body) || HOME_CTA.body,
      cta: {
        label: page.cta?.cta?.label || HOME_CTA.cta.label,
        path: page.cta?.cta?.path || HOME_CTA.cta.path,
      },
      backgroundImage: mediaUrl(page.cta?.backgroundImage),
    },

    rooms,
  }
}

export function useHomePage() {
  return useQuery({
    queryKey: ['home-page'],
    queryFn: fetchHomePage,
    staleTime: 5 * 60 * 1000,
  })
}
