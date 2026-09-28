export function slugify(value) {
  return (
    String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'item'
  )
}

export function applyAutoSlug({ data, originalDoc }) {
  if (!data) return data
  if (!data.slug) {
    data.slug = slugify(data.name || originalDoc?.name)
  }
  return data
}
