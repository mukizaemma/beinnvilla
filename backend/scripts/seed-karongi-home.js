import { getPayload } from 'payload'
import config from '../payload.config.js'

function lexical(text) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: text
            ? [{ type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }]
            : [],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function mediaId(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.id || null
}

const APARTMENT_COPY =
  'Grand Villa is one private apartment — the whole building — for a group staying together by Lake Kivu in Karongi. Six bedrooms and six bathrooms, a kitchen to cook in, a private bar for people staying here, hot water, and air conditioning. Guests in the apartment can take a boat ride on the lake. The villa is $150 a night without breakfast, $200 with breakfast, or $2,500 for a month. We do not rent single rooms.'

if (!process.env.MONGODB_URI && !process.env.DATABASE_URI) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'company',
  overrideAccess: true,
  data: {
    name: 'Grand Villa Apartment',
    tagline: 'A private apartment for your group on Lake Kivu in Karongi',
    distanceFromKigali: 'About 3 hours from Kigali',
    address: 'Karongi, Western Province, Rwanda — on the Lake Kivu shoreline',
    seoTitle: 'Grand Villa Apartment | Private group stay on Lake Kivu, Karongi',
    seoKeywords:
      'Lake Kivu apartment, Karongi group stay, Kibuye villa, 6 bedroom apartment Rwanda, boat riding Karongi',
    seoDescription:
      'Take the whole Grand Villa apartment in Karongi: 6 bedrooms, 6 bathrooms, kitchen, private bar, air-con, hot water, and a boat for guests. $150/night without breakfast, $200 with breakfast, $2,500/month.',
  },
})
console.log('company updated')

const home = await payload.findGlobal({ slug: 'home-page', depth: 0, overrideAccess: true })
const slides = (home.hero?.slides || []).map((slide, index) => {
  const copy = [
    {
      eyebrow: 'Karongi · Lake Kivu',
      headline: 'One villa for your whole group',
      subline:
        'Six bedrooms, a kitchen, a private bar, and a boat for guests staying here — take the building, not a hotel room.',
    },
    {
      eyebrow: 'Days on the water',
      headline: 'Boat, kayak, then back to your place',
      subline: 'The apartment is the base. Lake days are for the group staying in the villa.',
    },
  ][index] || {
    eyebrow: 'Karongi',
    headline: slide.headline,
    subline: 'A private apartment on Lake Kivu.',
  }
  return {
    id: slide.id,
    image: slide.image,
    eyebrow: copy.eyebrow,
    headline: copy.headline,
    subline: lexical(copy.subline),
  }
})

await payload.updateGlobal({
  slug: 'home-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(home.hero || {}),
      slides: slides.length
        ? slides
        : [
            {
              eyebrow: 'Karongi · Lake Kivu',
              headline: 'One villa for your whole group',
              subline: lexical(
                'Six bedrooms, a kitchen, a private bar, and a boat for guests staying here — take the building, not a hotel room.',
              ),
            },
          ],
      cta: { label: 'Book the apartment', link: '/book' },
      secondaryCta: { label: 'See the apartment', link: '/accommodation' },
    },
    features: [
      {
        icon: 'wine',
        title: 'Private bar',
        text: 'An in-house bar for the group staying in the villa.',
      },
      {
        icon: 'utensils',
        title: 'Kitchen inside',
        text: 'A full kitchen in the apartment, so the group can cook together.',
      },
      {
        icon: 'droplets',
        title: 'Hot water',
        text: 'Hot water throughout the apartment after a day on the lake.',
      },
      {
        icon: 'wind',
        title: 'Air conditioning',
        text: 'Cool rooms to come back to in the afternoon heat.',
      },
    ],
    welcome: {
      ...(home.welcome || {}),
      eyebrow: 'Karongi · Lake Kivu',
      headline: 'A private apartment on Lake Kivu',
      body: lexical(
        'Grand Villa is one building on the Karongi shore — not a hotel of single rooms. Take the villa together, cook and gather inside, then spend the day on the water: boat, kayak, or the Congo Nile Trail, about three hours from Kigali.',
      ),
      cta: { label: 'Book the apartment', path: '/book' },
    },
    roomsSection: {
      eyebrow: 'Rates',
      headline: 'Book the villa',
      intro:
        '$150 a night without breakfast, $200 with breakfast, or $2,500 a month for the whole apartment.',
    },
    experiencesSection: {
      eyebrow: 'From the villa',
      headline: 'Lake days, then back to your place',
      intro:
        'Boat for guests staying here, kayaking, and the Congo Nile Trail. The apartment is the base — not a hotel room you leave in the morning.',
    },
    location: {
      ...(home.location || {}),
      eyebrow: 'Karongi',
      headline: 'On the western shore of Lake Kivu',
      body: lexical(
        'Karongi (Kibuye) is about three hours from Kigali, on the western shore of Lake Kivu. The apartment is the group’s base between boat days, trails, and evenings in the villa.',
      ),
      highlights: [
        { text: 'Karongi (Kibuye) on the western shore of Lake Kivu' },
        { text: 'About a three-hour drive from Kigali' },
        { text: 'Boat days and the Congo Nile Trail from the door' },
      ],
    },
    cta: {
      ...(home.cta || {}),
      eyebrow: 'Karongi · Lake Kivu',
      headline: 'Bring the group. Take the villa.',
      body: lexical(
        'Grand Villa is one private apartment, not a hotel of single rooms. Book the whole building, add breakfast if you want it, and take the boat when you want the lake.',
      ),
      cta: { label: 'Book the apartment', path: '/book' },
    },
  },
})
console.log('home-page updated')

const roomsFound = await payload.find({
  collection: 'rooms',
  limit: 100,
  depth: 1,
  overrideAccess: true,
})
const roomDocs = roomsFound.docs
const galleryIds = []
for (const doc of roomDocs) {
  const imageId = mediaId(doc.image)
  if (imageId && !galleryIds.includes(imageId)) galleryIds.push(imageId)
  for (const row of doc.gallery || []) {
    const photoId = mediaId(row.photo)
    if (photoId && !galleryIds.includes(photoId)) galleryIds.push(photoId)
  }
}
const apartmentData = {
  name: 'Grand Villa Apartment',
  pricePerNight: 150,
  priceWithBreakfast: 200,
  monthlyRate: 2500,
  units: 1,
  description: lexical(APARTMENT_COPY),
  specs: {
    size: 'One private apartment',
    bed: '6 bedrooms',
    occupancy: 'One group — whole villa',
    view: 'Lake Kivu, Karongi',
    smoking: 'No smoking',
    breakfast: '$150 without / $200 with',
  },
  features: ['wifi', 'ac', 'bath', 'kitchen', 'hot-water', 'private-bar', 'boat', 'fridge'],
  image: galleryIds[0],
  gallery: galleryIds.map((photo) => ({ photo })),
}

const keeper =
  roomDocs.find((doc) => /villa|apartment|grand/i.test(`${doc.name || ''} ${doc.slug || ''}`)) ||
  roomDocs[0]

if (keeper) {
  await payload.update({
    collection: 'rooms',
    id: keeper.id,
    overrideAccess: true,
    data: apartmentData,
  })
  console.log('apartment listing updated', keeper.slug)
  for (const doc of roomDocs) {
    if (doc.id === keeper.id) continue
    await payload.delete({ collection: 'rooms', id: doc.id, overrideAccess: true })
    console.log('removed extra room type', doc.name)
  }
} else {
  await payload.create({
    collection: 'rooms',
    overrideAccess: true,
    data: apartmentData,
  })
  console.log('apartment listing created')
}

const roomsPage = await payload.findGlobal({ slug: 'rooms-page', depth: 0, overrideAccess: true })
await payload.updateGlobal({
  slug: 'rooms-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(roomsPage.hero || {}),
      eyebrow: 'The apartment',
      headline: 'One private villa for your group',
      intro: lexical(
        'Six bedrooms, six bathrooms, a kitchen, and a private bar on Lake Kivu. Take the whole building — $150 a night without breakfast, $200 with breakfast, or $2,500 a month.',
      ),
      cta: { label: 'Book the apartment', path: '/book' },
      secondaryCta: { label: 'Ask about a month', path: '/contact' },
    },
    highlights: [
      { icon: 'bed', label: '6 bedrooms' },
      { icon: 'bath', label: '6 bathrooms' },
      { icon: 'kitchen', label: 'Kitchen' },
      { icon: 'bar', label: 'Private bar' },
      { icon: 'ac', label: 'Air conditioning' },
      { icon: 'hot-water', label: 'Hot water' },
      { icon: 'boat', label: 'Boat for in-house guests' },
    ],
  },
})
console.log('rooms-page updated')

const bar = await payload.findGlobal({ slug: 'bar-restaurant-page', depth: 0, overrideAccess: true })
await payload.updateGlobal({
  slug: 'bar-restaurant-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(bar.hero || {}),
      eyebrow: 'In-house',
      headline: 'Kitchen and a private bar',
      intro: lexical(
        'Cook in the apartment kitchen. The bar is for your group staying in the villa — not a public hotel restaurant. Breakfast is $200 a night for the apartment, or $150 without.',
      ),
      cta: { label: 'Book the apartment', path: '/book' },
    },
    homeSpotlight: {
      ...(bar.homeSpotlight || {}),
      eyebrow: 'In-house',
      headline: 'Kitchen and a private bar',
      intro:
        'Cook in the apartment kitchen. The bar is for your group staying in the villa — not a public hotel restaurant.',
      features: [
        { icon: 'food', title: 'Full kitchen', text: 'Cook together — the apartment has a kitchen for your group.' },
        { icon: 'drinks', title: 'Private bar', text: 'The bar is for people staying in the villa, not walk-in guests.' },
        { icon: 'coffee', title: 'Breakfast optional', text: '$150 a night without breakfast, $200 with breakfast.' },
      ],
      cta: { label: 'Kitchen & bar', path: '/bar-restaurant' },
    },
  },
})
console.log('bar-restaurant-page updated')

const about = await payload.findGlobal({ slug: 'about-page', depth: 0, overrideAccess: true })
await payload.updateGlobal({
  slug: 'about-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(about.hero || {}),
      eyebrow: 'About us',
      headline: 'A home by Lake Kivu',
      intro: lexical(
        'Grand Villa is one private apartment in Karongi for a group — six bedrooms, a kitchen, a private bar, and the lake outside. We host groups who take the whole villa.',
      ),
    },
  },
})
console.log('about-page updated')

const activities = [
  {
    slug: 'evening-walk',
    name: 'Boat riding',
    price: 0,
    description:
      'For guests staying in the apartment: a boat ride on Lake Kivu — bays, islands, and the western shore.',
  },
  {
    slug: 'morning-run',
    name: 'Kayaking',
    price: 25,
    description: 'Paddle close to the shore in the morning calm, before the wind picks up on the lake.',
  },
]

for (const item of activities) {
  const found = await payload.find({
    collection: 'experiences',
    where: { slug: { equals: item.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const existing = found.docs[0]
  if (existing) {
    await payload.update({
      collection: 'experiences',
      id: existing.id,
      overrideAccess: true,
      data: {
        name: item.name,
        price: item.price,
        description: lexical(item.description),
      },
    })
    console.log('updated experience', item.name)
  }
}

const hiking = await payload.find({
  collection: 'experiences',
  where: { slug: { equals: 'hiking' } },
  limit: 1,
  overrideAccess: true,
})
if (hiking.docs[0]) {
  await payload.update({
    collection: 'experiences',
    id: hiking.docs[0].id,
    overrideAccess: true,
    data: {
      name: 'Hiking',
      description: lexical(
        'Walk the Congo Nile Trail and the hills above Karongi — tea, coffee, and the lake below you.',
      ),
    },
  })
}

const things = await payload.findGlobal({ slug: 'things-to-do-page', depth: 0, overrideAccess: true })
await payload.updateGlobal({
  slug: 'things-to-do-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(things.hero || {}),
      eyebrow: 'From the villa',
      headline: 'Days on Lake Kivu',
      intro: lexical(
        'Boat riding for guests staying in the apartment, kayaking, hiking the Congo Nile Trail — then back to your villa in Karongi.',
      ),
      cta: { label: 'Book the apartment', path: '/book' },
      secondaryCta: { label: 'Ask the desk', path: '/contact' },
    },
  },
})
console.log('things-to-do-page updated')

process.exit(0)
