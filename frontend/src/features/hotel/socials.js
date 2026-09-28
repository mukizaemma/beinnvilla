export const SOCIAL_PLATFORMS = [
  { name: 'instagram', label: 'Instagram' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'tripadvisor', label: 'TripAdvisor' },
  { name: 'tiktok', label: 'TikTok' },
  { name: 'youtube', label: 'YouTube' },
  { name: 'x', label: 'X (Twitter)' },
  { name: 'linkedin', label: 'LinkedIn' },
]

export const OTA_PLATFORMS = [
  { name: 'booking', label: 'Booking.com' },
  { name: 'expedia', label: 'Expedia' },
  { name: 'airbnb', label: 'Airbnb' },
  { name: 'agoda', label: 'Agoda' },
  { name: 'hotels', label: 'Hotels.com' },
]

function platformFromLabel(label) {
  const value = String(label || '').toLowerCase().trim()
  if (['ig', 'insta', 'instagram'].includes(value)) return 'instagram'
  if (['fb', 'facebook'].includes(value)) return 'facebook'
  if (value.includes('trip')) return 'tripadvisor'
  if (value.includes('tiktok') || value === 'tt') return 'tiktok'
  if (value.includes('you') || value === 'yt') return 'youtube'
  if (value === 'x' || value.includes('twitter')) return 'x'
  if (value.includes('linked')) return 'linkedin'
  if (value.includes('booking')) return 'booking'
  if (value.includes('expedia')) return 'expedia'
  if (value.includes('airbnb')) return 'airbnb'
  if (value.includes('agoda')) return 'agoda'
  if (value.includes('hotels')) return 'hotels'
  return null
}

function emptyLinks(platforms) {
  return Object.fromEntries(platforms.map(({ name }) => [name, '']))
}

function normalizeLinks(platforms, value) {
  const next = emptyLinks(platforms)
  if (Array.isArray(value)) {
    for (const row of value) {
      const platform = row.platform || platformFromLabel(row.label)
      if (platform && platforms.some((item) => item.name === platform) && row.href) next[platform] = row.href
    }
    return next
  }
  if (value && typeof value === 'object') {
    for (const { name } of platforms) {
      if (value[name]) next[name] = value[name]
    }
  }
  return next
}

export function emptySocials() {
  return emptyLinks(SOCIAL_PLATFORMS)
}

export function emptyOtas() {
  return emptyLinks(OTA_PLATFORMS)
}

export function normalizeSocials(value) {
  return normalizeLinks(SOCIAL_PLATFORMS, value)
}

export function normalizeOtas(value) {
  return normalizeLinks(OTA_PLATFORMS, value)
}

export function isPublicSocialUrl(value) {
  if (!value || typeof value !== 'string') return false
  const href = value.trim()
  if (!href || href === '#' || href === '/') return false
  try {
    const url = new URL(href.includes('://') ? href : `https://${href}`)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function publicSocialUrl(value) {
  if (!isPublicSocialUrl(value)) return ''
  const href = value.trim()
  return href.includes('://') ? href : `https://${href}`
}

function visibleLinks(platforms, values) {
  return platforms.flatMap(({ name, label }) => {
    const href = publicSocialUrl(values?.[name])
    if (!href) return []
    return [{ name, label, href }]
  })
}

export function visibleSocials(socials) {
  return visibleLinks(SOCIAL_PLATFORMS, socials)
}

export function visibleOtas(otas) {
  return visibleLinks(OTA_PLATFORMS, otas)
}
