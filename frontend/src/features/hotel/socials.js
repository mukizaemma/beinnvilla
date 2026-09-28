export const SOCIAL_PLATFORMS = [
  { name: 'instagram', label: 'Instagram' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'tripadvisor', label: 'TripAdvisor' },
  { name: 'tiktok', label: 'TikTok' },
  { name: 'youtube', label: 'YouTube' },
  { name: 'x', label: 'X (Twitter)' },
  { name: 'linkedin', label: 'LinkedIn' },
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
  return null
}

export function emptySocials() {
  return Object.fromEntries(SOCIAL_PLATFORMS.map(({ name }) => [name, '']))
}

export function normalizeSocials(value) {
  const next = emptySocials()
  if (Array.isArray(value)) {
    for (const row of value) {
      const platform = row.platform || platformFromLabel(row.label)
      if (platform && row.href) next[platform] = row.href
    }
    return next
  }
  if (value && typeof value === 'object') {
    for (const { name } of SOCIAL_PLATFORMS) {
      if (value[name]) next[name] = value[name]
    }
  }
  return next
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

export function visibleSocials(socials) {
  return SOCIAL_PLATFORMS.flatMap(({ name, label }) => {
    const href = publicSocialUrl(socials?.[name])
    if (!href) return []
    return [{ name, label, href }]
  })
}
