function text(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  if (value.root) return lexicalText(value.root)
  return ''
}

function lexicalText(node) {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.children)) return ''
  return node.children.map(lexicalText).join(' ').trim()
}

function filled(value) {
  return text(value).length > 0
}

function hasMedia(value) {
  if (!value) return false
  if (typeof value === 'object') return Boolean(value.id || value.url || value.filename)
  return String(value).length > 0
}

function check(id, label, pass, fix, detail = '') {
  return { id, label, pass: Boolean(pass), fix, detail }
}

function scoreOf(items) {
  if (!items.length) return 0
  return Math.round((items.filter((item) => item.pass).length / items.length) * 100)
}

function grade(score) {
  if (score >= 90) return { label: 'Ready', hint: 'Content looks complete. Review photos and wording when you like.' }
  if (score >= 70) return { label: 'Almost there', hint: 'A few gaps remain. Focus on the failed checks below.' }
  if (score >= 45) return { label: 'Needs work', hint: 'Guests will notice missing rooms, photos, or contact details.' }
  return { label: 'Incomplete', hint: 'Fill the failed items first so the public site has the basics.' }
}

function pageHeadline(doc) {
  return filled(doc?.hero?.headline) || filled(doc?.headline)
}

function pageImage(doc) {
  return (
    hasMedia(doc?.hero?.backgroundImage) ||
    hasMedia(doc?.backgroundImage) ||
    hasMedia(doc?.hero?.image)
  )
}

const PAGES = [
  { slug: 'home-page', label: 'Home', staff: '/staff/pages?open=home-page', admin: '/admin/globals/home-page' },
  { slug: 'about-page', label: 'About', staff: '/staff/pages?open=about-page', admin: '/admin/globals/about-page' },
  { slug: 'rooms-page', label: 'Accommodation', staff: '/staff/pages?open=rooms-page', admin: '/admin/globals/rooms-page' },
  { slug: 'bar-restaurant-page', label: 'Bar & Restaurant', staff: '/staff/pages?open=bar-restaurant-page', admin: '/admin/globals/bar-restaurant-page' },
  { slug: 'things-to-do-page', label: 'Things to do', staff: '/staff/pages?open=things-to-do-page', admin: '/admin/globals/things-to-do-page' },
  { slug: 'gallery-page', label: 'Gallery page', staff: '/staff/pages?open=gallery-page', admin: '/admin/globals/gallery-page' },
  { slug: 'contact-page', label: 'Contact', staff: '/staff/pages?open=contact-page', admin: '/admin/globals/contact-page' },
  { slug: 'booking-page', label: 'Booking', staff: '/staff/pages?open=booking-page', admin: '/admin/globals/booking-page' },
  { slug: 'policy-page', label: 'Booking policy', staff: '/staff/pages?open=policy-page', admin: '/admin/globals/policy-page' },
]

export async function buildSiteAuditReport(payload) {
  const [company, rooms, amenities, media, experiences, menuItems, ...pageDocs] = await Promise.all([
    payload.findGlobal({ slug: 'company', depth: 0, overrideAccess: true }),
    payload.find({ collection: 'rooms', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'amenities', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({
      collection: 'media',
      limit: 300,
      depth: 0,
      overrideAccess: true,
      where: { showOnGallery: { equals: true } },
    }),
    payload.find({ collection: 'experiences', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'menu-items', limit: 200, depth: 0, overrideAccess: true }),
    ...PAGES.map((page) => payload.findGlobal({ slug: page.slug, depth: 0, overrideAccess: true })),
  ])

  const companyItems = [
    check('company-name', 'Property name', filled(company?.name), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check('company-logo', 'Logo', hasMedia(company?.logo), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check('company-phone', 'Phone', filled(company?.phone), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check('company-email', 'Email', filled(company?.email), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check('company-whatsapp', 'WhatsApp number', filled(company?.whatsapp), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check('company-address', 'Address', filled(company?.address), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check(
      'company-map',
      'Map link or embed',
      filled(company?.mapUrl) || filled(company?.mapEmbed),
      { staff: '/staff/settings', admin: '/admin/globals/company' },
    ),
    check('company-seo-title', 'SEO title', filled(company?.seoTitle), { staff: '/staff/settings', admin: '/admin/globals/company' }),
    check('company-seo-desc', 'SEO description', filled(company?.seoDescription), { staff: '/staff/settings', admin: '/admin/globals/company' }),
  ]

  const roomDocs = rooms?.docs || []
  const roomItems = [
    check(
      'rooms-count',
      'At least one room is published',
      roomDocs.length > 0,
      { staff: '/staff/accommodation', admin: '/admin/collections/rooms' },
      roomDocs.length ? `${roomDocs.length} room${roomDocs.length === 1 ? '' : 's'}` : 'No rooms yet',
    ),
  ]

  roomDocs.forEach((room) => {
    const name = room.name || 'Untitled room'
    const fix = { staff: '/staff/accommodation', admin: `/admin/collections/rooms/${room.id}` }
    const galleryCount = (room.gallery || []).filter((row) => hasMedia(row.photo)).length
    const featureCount = (room.features || []).length
    roomItems.push(
      check(`room-${room.id}-photo`, `${name} — main photo`, hasMedia(room.image), fix),
      check(
        `room-${room.id}-gallery`,
        `${name} — extra photos`,
        galleryCount >= 2 || (galleryCount >= 1 && hasMedia(room.image)),
        fix,
        galleryCount ? `${galleryCount} gallery photo${galleryCount === 1 ? '' : 's'}` : 'Add more room photos',
      ),
      check(`room-${room.id}-copy`, `${name} — description`, filled(room.description), fix),
      check(`room-${room.id}-price`, `${name} — nightly rate`, Number(room.pricePerNight) > 0, fix),
      check(
        `room-${room.id}-specs`,
        `${name} — bed and occupancy`,
        filled(room.specs?.bed) && filled(room.specs?.occupancy),
        fix,
      ),
      check(
        `room-${room.id}-amenities`,
        `${name} — room amenities`,
        featureCount >= 3,
        fix,
        featureCount ? `${featureCount} selected` : 'Choose the in-room amenities',
      ),
    )
  })

  const amenityDocs = amenities?.docs || []
  const amenityItems = [
    check(
      'amenities-count',
      'Hotel facilities list (at least 3)',
      amenityDocs.length >= 3,
      { staff: '/staff/amenities', admin: '/admin/collections/amenities' },
      `${amenityDocs.length} facilit${amenityDocs.length === 1 ? 'y' : 'ies'}`,
    ),
    ...amenityDocs.map((row) =>
      check(
        `amenity-${row.id}-image`,
        `${row.name || 'Facility'} — photo`,
        hasMedia(row.image),
        { staff: '/staff/amenities', admin: `/admin/collections/amenities/${row.id}` },
      ),
    ),
  ]

  const galleryCount = media?.totalDocs || media?.docs?.length || 0
  const galleryItems = [
    check(
      'gallery-count',
      'Gallery has at least 8 published photos',
      galleryCount >= 8,
      { staff: '/staff/gallery', admin: '/admin/collections/media' },
      `${galleryCount} on the public gallery`,
    ),
  ]

  const activityDocs = experiences?.docs || []
  const activityItems = [
    check(
      'activities-count',
      'At least two things to do',
      activityDocs.length >= 2,
      { staff: '/staff/things-to-do', admin: '/admin/collections/experiences' },
      `${activityDocs.length} activit${activityDocs.length === 1 ? 'y' : 'ies'}`,
    ),
    ...activityDocs.map((row) =>
      check(
        `activity-${row.id}`,
        `${row.name || 'Activity'} — photo and copy`,
        hasMedia(row.image) && filled(row.description),
        { staff: '/staff/things-to-do', admin: `/admin/collections/experiences/${row.id}` },
      ),
    ),
  ]

  const pageItems = PAGES.map((page, index) => {
    const doc = pageDocs[index]
    if (page.slug === 'home-page') {
      const slides = doc?.hero?.slides || []
      const ready = slides.filter((slide) => filled(slide.headline) && hasMedia(slide.image)).length
      return check(
        'page-home',
        'Home hero slides (headline + photo)',
        ready >= 1,
        { staff: page.staff, admin: page.admin },
        `${ready} complete slide${ready === 1 ? '' : 's'}`,
      )
    }
    if (page.slug === 'policy-page') {
      return check(
        'page-policy',
        'Booking policy headline, photo, and body',
        pageHeadline(doc) && pageImage(doc) && filled(doc?.body),
        { staff: page.staff, admin: page.admin },
      )
    }
    return check(
      `page-${page.slug}`,
      `${page.label} — headline and header image`,
      pageHeadline(doc) && pageImage(doc),
      { staff: page.staff, admin: page.admin },
    )
  })

  const menuDocs = menuItems?.docs || []
  const publishedMenu = menuDocs.filter((row) => row.available !== false)
  const menuAuditItems = [
    check(
      'menu-count',
      'At least four published dishes or drinks',
      publishedMenu.length >= 4,
      { staff: '/staff/menu', admin: '/admin/collections/menu-items' },
      `${publishedMenu.length} on the restaurant page`,
    ),
    ...publishedMenu.map((row) =>
      check(
        `menu-${row.id}`,
        `${row.name || 'Menu item'} — photo, price, and ingredients`,
        hasMedia(row.image) && Number(row.price) > 0 && filled(row.ingredients),
        { staff: '/staff/menu', admin: `/admin/collections/menu-items/${row.id}` },
      ),
    ),
  ]

  const groups = [
    { id: 'company', label: 'Company details', items: companyItems },
    { id: 'rooms', label: 'Rooms', items: roomItems },
    { id: 'amenities', label: 'Facilities', items: amenityItems },
    { id: 'menu', label: 'Menu items', items: menuAuditItems },
    { id: 'gallery', label: 'Gallery', items: galleryItems },
    { id: 'activities', label: 'Things to do', items: activityItems },
    { id: 'pages', label: 'Website pages', items: pageItems },
  ].map((group) => ({
    ...group,
    score: scoreOf(group.items),
    passed: group.items.filter((item) => item.pass).length,
    total: group.items.length,
  }))

  const allItems = groups.flatMap((group) => group.items)
  const score = scoreOf(allItems)

  return {
    generatedAt: new Date().toISOString(),
    score,
    grade: grade(score),
    passed: allItems.filter((item) => item.pass).length,
    total: allItems.length,
    groups,
    missing: allItems.filter((item) => !item.pass),
  }
}
