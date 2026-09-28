export const APARTMENT_GALLERY_CATEGORY = 'rooms'

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: APARTMENT_GALLERY_CATEGORY, label: 'The apartment' },
  { id: 'bar-restaurant', label: 'Kitchen & bar' },
  { id: 'lake-grounds', label: 'Property & views' },
  { id: 'amenities', label: 'Amenities' },
]

function byNewest(a, b) {
  const left = Date.parse(a?.createdAt || '')
  const right = Date.parse(b?.createdAt || '')
  const leftTime = Number.isFinite(left) ? left : 0
  const rightTime = Number.isFinite(right) ? right : 0
  return rightTime - leftTime
}

/** Latest apartment photos first, then extras, then the rest of the gallery. */
export function latestGalleryPreview(images, extras = [], limit = 4) {
  const seen = new Set()
  const collected = []

  function take(list) {
    for (const item of list || []) {
      if (!item?.image || seen.has(item.image)) continue
      seen.add(item.image)
      collected.push(item)
      if (collected.length >= limit) return
    }
  }

  const fromCms = (images || []).filter((item) => item?.image)
  take(fromCms.filter((item) => item.category === APARTMENT_GALLERY_CATEGORY).sort(byNewest))
  take((extras || []).slice().sort(byNewest))
  take(fromCms.filter((item) => item.category !== APARTMENT_GALLERY_CATEGORY).sort(byNewest))
  return collected.slice(0, limit)
}
