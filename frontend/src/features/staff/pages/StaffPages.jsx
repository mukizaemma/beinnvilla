import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { asHtml, htmlToLexical } from '@lib/richText'
import { DEFAULT_HOME_FEATURES } from '@features/hotel/homeFeatures'
import { DEFAULT_RESTAURANT_FEATURES } from '@features/hotel/restaurantSpotlight'
import { LOCATION_HIGHLIGHTS } from '@features/hotel/brand'
import { EXPERIENCES_SECTION, ROOMS_SECTION } from '@features/hotel/lakeStay'
import { staffClient, mediaId } from '../api/staffClient'
import MediaField from '../components/MediaField'
import MediaGalleryField from '../components/MediaGalleryField'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

const FEATURE_ICON_OPTIONS = [
  { value: 'coffee', label: 'Breakfast / coffee' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'map-pin', label: 'Location' },
  { value: 'bed', label: 'Rooms / bed' },
  { value: 'parking', label: 'Parking' },
  { value: 'utensils', label: 'Kitchen' },
  { value: 'wine', label: 'Private bar' },
  { value: 'droplets', label: 'Hot water' },
  { value: 'wind', label: 'Air conditioning' },
  { value: 'waves', label: 'Lake / water' },
  { value: 'ship', label: 'Boat' },
  { value: 'mountain', label: 'Hiking / hills' },
  { value: 'trees', label: 'Nature' },
  { value: 'sunrise', label: 'Sunrise' },
  { value: 'users', label: 'Group / people' },
  { value: 'bell', label: 'Concierge' },
]

const PAGES = [
  { slug: 'rooms-page', label: 'Accommodation', path: '/accommodation' },
  { slug: 'bar-restaurant-page', label: 'Facilities', path: '/facilities' },
  { slug: 'gallery-page', label: 'Gallery', path: '/gallery' },
  { slug: 'contact-page', label: 'Visit', path: '/visit' },
  { slug: 'booking-page', label: 'Booking', path: '/book' },
  { slug: 'policy-page', label: 'Booking policy', path: '/policy' },
  { slug: 'about-page', label: 'About', path: '/visit' },
  { slug: 'things-to-do-page', label: 'Things to do', path: '/facilities' },
]

const emptySlide = () => ({ eyebrow: '', headline: '', subline: '', image: '' })
const emptyFeature = (item = {}) => ({
  icon: item.icon || 'wifi',
  title: item.title || '',
  text: item.text || '',
})
const emptyBadge = () => ({ source: '', score: '', tier: '', reviewCount: 0 })

function TextContentPanel({ eyebrow, headline, intro, onEyebrow, onHeadline, onIntro, introLabel = 'Intro', headlineRequired }) {
  return (
    <details className="staffPanel full" open>
      <summary>Text content</summary>
      <div className="staffPanelBody">
        <label className="staffField col-3">
          Eyebrow
          <input value={eyebrow} onChange={(e) => onEyebrow(e.target.value)} />
        </label>
        <label className="staffField headlineField col-9">
          Headline
          <input value={headline} onChange={(e) => onHeadline(e.target.value)} required={headlineRequired} />
        </label>
        <SummernoteField label={introLabel} value={intro} onChange={onIntro} />
      </div>
    </details>
  )
}

function ButtonPair({
  primaryLabel,
  primaryPath,
  secondaryLabel,
  secondaryPath,
  onPrimaryLabel,
  onPrimaryPath,
  onSecondaryLabel,
  onSecondaryPath,
  primaryPathName = 'Path',
}) {
  return (
    <div className="staffBtnPair">
      <div className="staffBtnCard">
        <span className="staffBtnCardTitle">Primary button</span>
        <label className="staffField">
          Label
          <input value={primaryLabel} onChange={(e) => onPrimaryLabel(e.target.value)} />
        </label>
        <label className="staffField">
          {primaryPathName}
          <input value={primaryPath} onChange={(e) => onPrimaryPath(e.target.value)} />
        </label>
      </div>
      {onSecondaryLabel && (
        <div className="staffBtnCard">
          <span className="staffBtnCardTitle">Secondary button</span>
          <label className="staffField">
            Label
            <input value={secondaryLabel} onChange={(e) => onSecondaryLabel(e.target.value)} />
          </label>
          <label className="staffField">
            Path
            <input value={secondaryPath} onChange={(e) => onSecondaryPath(e.target.value)} />
          </label>
        </div>
      )}
    </div>
  )
}

function readPage(slug, page) {
  if (slug === 'home-page') {
    const slides = (page.hero?.slides || []).map((slide) => ({
      id: slide.id,
      eyebrow: slide.eyebrow || '',
      headline: slide.headline || '',
      subline: asHtml(slide.subline),
      image: slide.image || '',
    }))
    const features = (page.features || []).map((item) => emptyFeature(item))
    const locationHighlights = (page.location?.highlights || [])
      .map((item) => item.text)
      .filter(Boolean)
    return {
      slides: slides.length ? slides : [emptySlide()],
      cta: { label: page.hero?.cta?.label || 'Book the apartment', link: page.hero?.cta?.link || '/book' },
      secondaryCta: {
        label: page.hero?.secondaryCta?.label || 'Explore the lake',
        link: page.hero?.secondaryCta?.link || '/things-to-do',
      },
      features: features.length ? features : DEFAULT_HOME_FEATURES.map((item) => emptyFeature(item)),
      welcome: {
        eyebrow: page.welcome?.eyebrow || '',
        headline: page.welcome?.headline || '',
        body: asHtml(page.welcome?.body),
        ctaLabel: page.welcome?.cta?.label || '',
        ctaPath: page.welcome?.cta?.path || '',
        primaryImage: page.welcome?.primaryImage || '',
        secondaryImage: page.welcome?.secondaryImage || '',
        badges: (page.welcome?.reviewBadges || []).map((badge) => ({
          id: badge.id,
          source: badge.source || '',
          score: badge.score ?? '',
          tier: badge.tier || '',
          reviewCount: badge.reviewCount || 0,
        })),
      },
      roomsSection: {
        eyebrow: page.roomsSection?.eyebrow || ROOMS_SECTION.eyebrow,
        headline: page.roomsSection?.headline || ROOMS_SECTION.headline,
        intro: page.roomsSection?.intro || ROOMS_SECTION.intro,
      },
      experiencesSection: {
        eyebrow: page.experiencesSection?.eyebrow || EXPERIENCES_SECTION.eyebrow,
        headline: page.experiencesSection?.headline || EXPERIENCES_SECTION.headline,
        intro: page.experiencesSection?.intro || EXPERIENCES_SECTION.intro,
      },
      location: {
        eyebrow: page.location?.eyebrow || 'Karongi',
        headline: page.location?.headline || 'On the western shore of Lake Kivu',
        body: asHtml(page.location?.body),
        highlights: locationHighlights.length ? locationHighlights : [...LOCATION_HIGHLIGHTS],
        ctaLabel: page.location?.cta?.label || 'Get directions',
        ctaPath: page.location?.cta?.path || '/contact',
        image: page.location?.image || '',
      },
      gallery: (page.homeGallery || []).map((item) => item.photo).filter(Boolean),
      lower: (page.homeLower || []).some((item) => item.photo)
        ? (page.homeLower || []).map((item) => item.photo).filter(Boolean)
        : (page.stats || []).map((item) => item.image).filter(Boolean),
      banner: {
        eyebrow: page.cta?.eyebrow || '',
        headline: page.cta?.headline || '',
        body: asHtml(page.cta?.body),
        ctaLabel: page.cta?.cta?.label || '',
        ctaPath: page.cta?.cta?.path || '',
        backgroundImage: page.cta?.backgroundImage || '',
      },
    }
  }

  if (slug === 'gallery-page') {
    return {
      eyebrow: page.eyebrow || '',
      headline: page.headline || '',
      intro: asHtml(page.intro),
      backgroundImage: page.backgroundImage || '',
      ctaLabel: page.cta?.label || '',
      ctaPath: page.cta?.path || page.cta?.link || '',
      secondaryLabel: page.secondaryCta?.label || '',
      secondaryPath: page.secondaryCta?.path || '',
    }
  }

  const hero = page.hero || {}
  const home = page.homeSpotlight || {}
  return {
    eyebrow: hero.eyebrow || '',
    headline: hero.headline || '',
    intro: asHtml(hero.intro),
    backgroundImage: hero.backgroundImage || '',
    ctaLabel: hero.cta?.label || '',
    ctaPath: hero.cta?.path || hero.cta?.link || '',
    secondaryLabel: hero.secondaryCta?.label || '',
    secondaryPath: hero.secondaryCta?.path || '',
    responseNote: page.responseNote || '',
    frontDeskNote: page.frontDeskNote || '',
    homeEyebrow: home.eyebrow || 'Restaurant',
    homeHeadline: home.headline || 'Taste, sip & relax',
    homeIntro: home.intro || 'Savor delicious food, drinks, and coffee.',
    homeFeatures: ((home.features || []).length ? home.features : DEFAULT_RESTAURANT_FEATURES).map(
      (item) => ({
        icon: item.icon || 'food',
        title: item.title || '',
        text: item.text || '',
      }),
    ),
    homeImages: (home.images || []).map((item) => item.image || ''),
    homeCtaLabel: home.cta?.label || 'View menu',
    homeCtaPath: home.cta?.path || '/bar-restaurant',
  }
}

function writePage(slug, current, form) {
  if (slug === 'home-page') {
    return {
      ...current,
      hero: {
        ...(current.hero || {}),
        slides: form.slides.map((slide) => ({
          id: slide.id,
          eyebrow: slide.eyebrow,
          headline: slide.headline,
          subline: htmlToLexical(slide.subline),
          image: mediaId(slide.image) || undefined,
        })),
        cta: form.cta,
        secondaryCta: form.secondaryCta,
      },
      features: form.features.map((item) => ({
        icon: item.icon,
        title: item.title,
        text: item.text,
      })),
      welcome: {
        ...(current.welcome || {}),
        eyebrow: form.welcome.eyebrow,
        headline: form.welcome.headline,
        body: htmlToLexical(form.welcome.body),
        cta: { label: form.welcome.ctaLabel, path: form.welcome.ctaPath },
        primaryImage: mediaId(form.welcome.primaryImage) || undefined,
        secondaryImage: mediaId(form.welcome.secondaryImage) || undefined,
        reviewBadges: form.welcome.badges.map((badge) => ({
          id: badge.id,
          source: badge.source,
          score: Number(badge.score) || 0,
          tier: badge.tier,
          reviewCount: Number(badge.reviewCount) || 0,
        })),
      },
      roomsSection: {
        eyebrow: form.roomsSection.eyebrow,
        headline: form.roomsSection.headline,
        intro: form.roomsSection.intro,
      },
      experiencesSection: {
        eyebrow: form.experiencesSection.eyebrow,
        headline: form.experiencesSection.headline,
        intro: form.experiencesSection.intro,
      },
      location: {
        eyebrow: form.location.eyebrow,
        headline: form.location.headline,
        body: htmlToLexical(form.location.body),
        highlights: form.location.highlights.filter(Boolean).map((text) => ({ text })),
        cta: { label: form.location.ctaLabel, path: form.location.ctaPath },
        image: mediaId(form.location.image) || undefined,
      },
      homeGallery: (form.gallery || [])
        .map((photo) => mediaId(photo))
        .filter(Boolean)
        .slice(0, 5)
        .map((photo) => ({ photo })),
      homeLower: (form.lower || [])
        .map((photo) => mediaId(photo))
        .filter(Boolean)
        .slice(0, 4)
        .map((photo) => ({ photo })),
      stats: (form.lower || [])
        .map((photo) => mediaId(photo))
        .filter(Boolean)
        .slice(0, 4)
        .map((image) => ({ image })),
      cta: {
        ...(current.cta || {}),
        eyebrow: form.banner.eyebrow,
        headline: form.banner.headline,
        body: htmlToLexical(form.banner.body),
        cta: { label: form.banner.ctaLabel, path: form.banner.ctaPath },
        backgroundImage: mediaId(form.banner.backgroundImage) || undefined,
      },
    }
  }

  const ctas = {
    cta: { label: form.ctaLabel, path: form.ctaPath },
    secondaryCta: { label: form.secondaryLabel, path: form.secondaryPath },
  }

  if (slug === 'gallery-page') {
    return {
      ...current,
      eyebrow: form.eyebrow,
      headline: form.headline,
      intro: htmlToLexical(form.intro),
      backgroundImage: mediaId(form.backgroundImage) || undefined,
      ...ctas,
    }
  }

  const next = {
    ...current,
    hero: {
      ...(current.hero || {}),
      eyebrow: form.eyebrow,
      headline: form.headline,
      intro: htmlToLexical(form.intro),
      backgroundImage: mediaId(form.backgroundImage) || undefined,
      ...ctas,
    },
  }

  if (slug === 'contact-page') {
    next.responseNote = form.responseNote
    next.frontDeskNote = form.frontDeskNote
  }

  if (slug === 'bar-restaurant-page') {
    next.homeSpotlight = {
      ...(current.homeSpotlight || {}),
      eyebrow: form.homeEyebrow,
      headline: form.homeHeadline,
      intro: form.homeIntro,
      features: (form.homeFeatures || []).map((item) => ({
        icon: item.icon,
        title: item.title,
        text: item.text,
      })),
      images: (form.homeImages || []).map((image) => ({ image: mediaId(image) || undefined })),
      cta: { label: form.homeCtaLabel, path: form.homeCtaPath },
    }
  }

  return next
}

const HOME = { slug: 'home-page', label: 'Home', path: '/' }
const ALL_PAGES = [HOME, ...PAGES]

export default function StaffPages() {
  const [form, setForm] = useState(null)
  const [gridPending, setGridPending] = useState(false)
  const [lowerPending, setLowerPending] = useState(false)
  const [params] = useSearchParams()

  useEffect(() => {
    const slug = params.get('open')
    const page = ALL_PAGES.find((item) => item.slug === slug)
    if (page) open(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  async function open(page) {
    try {
      const { data } = await staffClient.get(`/api/globals/${page.slug}?depth=1`)
      setGridPending(false)
      setLowerPending(false)
      setForm({ ...page, raw: data, ...readPage(page.slug, data) })
    } catch {
      toast.error('Could not load this page.')
    }
  }

  async function save(event) {
    event.preventDefault()
    try {
      await staffClient.post(`/api/globals/${form.slug}`, writePage(form.slug, form.raw, form))
      toast.success('Page saved.')
      setForm(null)
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save this page.')
    }
  }

  function updateSlide(index, patch) {
    const slides = form.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide))
    setForm({ ...form, slides })
  }

  function patchList(key, index, patch) {
    setForm({ ...form, [key]: form[key].map((item, i) => (i === index ? { ...item, ...patch } : item)) })
  }

  function patchWelcome(patch) {
    setForm({ ...form, welcome: { ...form.welcome, ...patch } })
  }

  return (
    <div className="staffPage">
      <h1>Pages</h1>
      <p className="staffLead">
        Same sections as the public site. Home leads with the lake story, things to do,
        then rooms, dining, and location. Lists like rooms and activities are edited in their
        own menus.
      </p>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Page</th>
              <th>URL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ALL_PAGES.map((page) => (
              <tr key={page.slug}>
                <td>{page.label}</td>
                <td>{page.path}</td>
                <td>
                  <button type="button" className="staffBtn" onClick={() => open(page)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffModal title={`Edit ${form.label}`} wide onClose={() => setForm(null)}>
          <nav className="pageSwitcher" aria-label="Pages">
            {ALL_PAGES.map((page) => (
              <button
                key={page.slug}
                type="button"
                className={form.slug === page.slug ? 'is-active' : undefined}
                onClick={() => {
                  if (page.slug !== form.slug) open(page)
                }}
              >
                {page.label}
              </button>
            ))}
          </nav>
          <form onSubmit={save} className="formGrid">
            {form.slug === 'home-page' ? (
              <>
                <div className="full">
                  <strong>Home gallery</strong>
                  <p className="staffLead">Five photographs. The first is the tall picture on the left.</p>
                  <MediaGalleryField
                    label="Home grid"
                    hint="These five photos appear only in the grid above the house card. The first is the tall picture on the left. Replace swaps that photo and keeps its place."
                    values={form.gallery || []}
                    max={5}
                    onPendingChange={setGridPending}
                    onChange={(gallery) => setForm((current) => ({ ...current, gallery }))}
                  />
                  <MediaGalleryField
                    label="Under the house"
                    hint="The large photos under “Twenty couples, or twenty singles.” Replace swaps that photo and keeps its place."
                    values={form.lower || []}
                    max={4}
                    onPendingChange={setLowerPending}
                    onChange={(lower) => setForm((current) => ({ ...current, lower }))}
                  />
                </div>
                <div className="full">
                  <strong>Hero</strong>
                </div>
                {form.slides.map((slide, index) => (
                  <div key={slide.id || index} className="full staffNested">
                    <TextContentPanel
                      eyebrow={slide.eyebrow}
                      headline={slide.headline}
                      intro={slide.subline}
                      introLabel="Subline"
                      headlineRequired
                      onEyebrow={(eyebrow) => updateSlide(index, { eyebrow })}
                      onHeadline={(headline) => updateSlide(index, { headline })}
                      onIntro={(subline) => updateSlide(index, { subline })}
                    />
                    <div className="mediaSlot">
                      <MediaField
                        label="Slide image"
                        value={slide.image}
                        onChange={(image) => updateSlide(index, { image })}
                      />
                    </div>
                    {form.slides.length > 1 && (
                      <button
                        type="button"
                        className="staffBtn staffBtnGhost"
                        onClick={() =>
                          setForm({ ...form, slides: form.slides.filter((_, i) => i !== index) })
                        }
                      >
                        Remove slide
                      </button>
                    )}
                  </div>
                ))}
                <div className="full">
                  <button
                    type="button"
                    className="staffBtn staffBtnGhost"
                    onClick={() => setForm({ ...form, slides: [...form.slides, emptySlide()] })}
                  >
                    Add slide
                  </button>
                </div>
                <ButtonPair
                  primaryLabel={form.cta.label}
                  primaryPath={form.cta.link}
                  primaryPathName="Link"
                  secondaryLabel={form.secondaryCta.label}
                  secondaryPath={form.secondaryCta.link}
                  onPrimaryLabel={(label) => setForm({ ...form, cta: { ...form.cta, label } })}
                  onPrimaryPath={(link) => setForm({ ...form, cta: { ...form.cta, link } })}
                  onSecondaryLabel={(label) =>
                    setForm({ ...form, secondaryCta: { ...form.secondaryCta, label } })
                  }
                  onSecondaryPath={(link) =>
                    setForm({ ...form, secondaryCta: { ...form.secondaryCta, link } })
                  }
                />

                <div className="full">
                  <strong>Features</strong>
                </div>
                {form.features.map((item, index) => (
                  <div key={index} className="full staffNested">
                    <label className="staffField col-3">
                      Icon
                      <select
                        value={item.icon}
                        onChange={(e) => patchList('features', index, { icon: e.target.value })}
                      >
                        {FEATURE_ICON_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="staffField col-9">
                      Title
                      <input
                        value={item.title}
                        onChange={(e) => patchList('features', index, { title: e.target.value })}
                      />
                    </label>
                    <label className="staffField full">
                      Text
                      <textarea
                        rows={2}
                        value={item.text}
                        onChange={(e) => patchList('features', index, { text: e.target.value })}
                      />
                    </label>
                    {form.features.length > 1 && (
                      <button
                        type="button"
                        className="staffBtn staffBtnGhost"
                        onClick={() =>
                          setForm({ ...form, features: form.features.filter((_, i) => i !== index) })
                        }
                      >
                        Remove feature
                      </button>
                    )}
                  </div>
                ))}
                <div className="full">
                  <button
                    type="button"
                    className="staffBtn staffBtnGhost"
                    onClick={() => setForm({ ...form, features: [...form.features, emptyFeature()] })}
                  >
                    Add feature
                  </button>
                </div>

                <div className="full">
                  <strong>Why Karongi</strong>
                  <p className="staffLead">The story band under the hero — lake, town, apartment.</p>
                </div>
                <label className="staffField col-3">
                  Eyebrow
                  <input
                    value={form.welcome.eyebrow}
                    onChange={(e) => patchWelcome({ eyebrow: e.target.value })}
                  />
                </label>
                <label className="staffField col-9">
                  Headline
                  <input
                    value={form.welcome.headline}
                    onChange={(e) => patchWelcome({ headline: e.target.value })}
                  />
                </label>
                <div className="staffField full">
                  <SummernoteField
                    label="Body"
                    value={form.welcome.body}
                    onChange={(body) => patchWelcome({ body })}
                  />
                </div>
                <label className="staffField col-6">
                  Button label
                  <input
                    value={form.welcome.ctaLabel}
                    onChange={(e) => patchWelcome({ ctaLabel: e.target.value })}
                  />
                </label>
                <label className="staffField col-6">
                  Button path
                  <input
                    value={form.welcome.ctaPath}
                    onChange={(e) => patchWelcome({ ctaPath: e.target.value })}
                  />
                </label>

                <div className="full">
                  <strong>Things to do heading</strong>
                  <p className="staffLead">Individual activities are edited under Things to do.</p>
                </div>
                <label className="staffField col-3">
                  Eyebrow
                  <input
                    value={form.experiencesSection.eyebrow}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experiencesSection: { ...form.experiencesSection, eyebrow: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="staffField col-9">
                  Headline
                  <input
                    value={form.experiencesSection.headline}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experiencesSection: { ...form.experiencesSection, headline: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="staffField full">
                  Intro
                  <textarea
                    rows={2}
                    value={form.experiencesSection.intro}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experiencesSection: { ...form.experiencesSection, intro: e.target.value },
                      })
                    }
                  />
                </label>

                <div className="full">
                  <strong>Apartment heading</strong>
                  <p className="staffLead">The villa listing is edited under The apartment.</p>
                </div>
                <label className="staffField col-3">
                  Eyebrow
                  <input
                    value={form.roomsSection.eyebrow}
                    onChange={(e) =>
                      setForm({ ...form, roomsSection: { ...form.roomsSection, eyebrow: e.target.value } })
                    }
                  />
                </label>
                <label className="staffField col-9">
                  Headline
                  <input
                    value={form.roomsSection.headline}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        roomsSection: { ...form.roomsSection, headline: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="staffField full">
                  Intro
                  <textarea
                    rows={2}
                    value={form.roomsSection.intro}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        roomsSection: { ...form.roomsSection, intro: e.target.value },
                      })
                    }
                  />
                </label>

                <div className="full">
                  <strong>Bar &amp; Restaurant</strong>
                  <p className="staffLead">
                    The home restaurant photos, highlights, and button are edited on the Bar &amp;
                    Restaurant page.
                  </p>
                </div>

                <div className="full">
                  <strong>Location</strong>
                  <p className="staffLead">
                    The live map is set in <a href="/staff/settings">Site setting</a> → Address &amp; map
                    (paste a Google Maps embed). Use the photo below only if you want an image instead of
                    the map.
                  </p>
                </div>
                <TextContentPanel
                  eyebrow={form.location.eyebrow}
                  headline={form.location.headline}
                  intro={form.location.body}
                  onEyebrow={(eyebrow) =>
                    setForm({ ...form, location: { ...form.location, eyebrow } })
                  }
                  onHeadline={(headline) =>
                    setForm({ ...form, location: { ...form.location, headline } })
                  }
                  onIntro={(body) => setForm({ ...form, location: { ...form.location, body } })}
                />
                {form.location.highlights.map((text, index) => (
                  <label key={index} className="staffField full">
                    Highlight
                    <input
                      value={text}
                      onChange={(e) => {
                        const highlights = form.location.highlights.map((row, i) =>
                          i === index ? e.target.value : row,
                        )
                        setForm({ ...form, location: { ...form.location, highlights } })
                      }}
                    />
                  </label>
                ))}
                <div className="full">
                  <button
                    type="button"
                    className="staffBtn staffBtnGhost"
                    onClick={() =>
                      setForm({
                        ...form,
                        location: {
                          ...form.location,
                          highlights: [...form.location.highlights, ''],
                        },
                      })
                    }
                  >
                    Add highlight
                  </button>
                </div>
                <label className="staffField col-3">
                  Link label
                  <input
                    value={form.location.ctaLabel}
                    onChange={(e) =>
                      setForm({ ...form, location: { ...form.location, ctaLabel: e.target.value } })
                    }
                  />
                </label>
                <label className="staffField col-9">
                  Link path
                  <input
                    value={form.location.ctaPath}
                    onChange={(e) =>
                      setForm({ ...form, location: { ...form.location, ctaPath: e.target.value } })
                    }
                  />
                </label>
                <div className="mediaSlot">
                  <MediaField
                    label="Location photo (used if no map embed)"
                    value={form.location.image}
                    onChange={(image) => setForm({ ...form, location: { ...form.location, image } })}
                  />
                </div>

                <div className="full">
                  <strong>Closing banner</strong>
                </div>
                <TextContentPanel
                  eyebrow={form.banner.eyebrow}
                  headline={form.banner.headline}
                  intro={form.banner.body}
                  introLabel="Text"
                  onEyebrow={(eyebrow) => setForm({ ...form, banner: { ...form.banner, eyebrow } })}
                  onHeadline={(headline) => setForm({ ...form, banner: { ...form.banner, headline } })}
                  onIntro={(body) => setForm({ ...form, banner: { ...form.banner, body } })}
                />
                <label className="staffField col-3">
                  Button label
                  <input
                    value={form.banner.ctaLabel}
                    onChange={(e) => setForm({ ...form, banner: { ...form.banner, ctaLabel: e.target.value } })}
                  />
                </label>
                <label className="staffField col-9">
                  Button path
                  <input
                    value={form.banner.ctaPath}
                    onChange={(e) => setForm({ ...form, banner: { ...form.banner, ctaPath: e.target.value } })}
                  />
                </label>
                <div className="mediaSlot">
                  <MediaField
                    label="Banner image"
                    value={form.banner.backgroundImage}
                    onChange={(backgroundImage) =>
                      setForm({ ...form, banner: { ...form.banner, backgroundImage } })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <TextContentPanel
                  eyebrow={form.eyebrow}
                  headline={form.headline}
                  intro={form.intro}
                  onEyebrow={(eyebrow) => setForm({ ...form, eyebrow })}
                  onHeadline={(headline) => setForm({ ...form, headline })}
                  onIntro={(intro) => setForm({ ...form, intro })}
                />
                <div className="full">
                  <strong>Header image</strong>
                  <p className="staffLead">This photograph fills the screen at the top of the page. Upload a new file or choose one from the library.</p>
                </div>
                <div className="mediaSlot">
                  <MediaField
                    label="Header image"
                    value={form.backgroundImage}
                    onChange={(backgroundImage) => setForm({ ...form, backgroundImage })}
                  />
                </div>
                <ButtonPair
                  primaryLabel={form.ctaLabel}
                  primaryPath={form.ctaPath}
                  secondaryLabel={form.secondaryLabel}
                  secondaryPath={form.secondaryPath}
                  onPrimaryLabel={(ctaLabel) => setForm({ ...form, ctaLabel })}
                  onPrimaryPath={(ctaPath) => setForm({ ...form, ctaPath })}
                  onSecondaryLabel={(secondaryLabel) => setForm({ ...form, secondaryLabel })}
                  onSecondaryPath={(secondaryPath) => setForm({ ...form, secondaryPath })}
                />
                {form.slug === 'contact-page' && (
                  <>
                    <label className="staffField col-3">
                      Response note
                      <input
                        value={form.responseNote}
                        onChange={(e) => setForm({ ...form, responseNote: e.target.value })}
                      />
                    </label>
                    <label className="staffField col-3">
                      Front desk note
                      <input
                        value={form.frontDeskNote}
                        onChange={(e) => setForm({ ...form, frontDeskNote: e.target.value })}
                      />
                    </label>
                  </>
                )}
                {form.slug === 'bar-restaurant-page' && (
                  <>
                    <div className="full">
                      <strong>Restaurant menu</strong>
                      <p className="staffLead">
                        Dishes and drinks are edited under Menu items in the sidebar, not on this page.
                      </p>
                    </div>
                    <div className="full">
                      <strong>Home page section</strong>
                      <p className="staffLead">
                        These photos and highlights appear on the public home page.
                      </p>
                    </div>
                    <label className="staffField col-3">
                      Eyebrow
                      <input
                        value={form.homeEyebrow}
                        onChange={(e) => setForm({ ...form, homeEyebrow: e.target.value })}
                      />
                    </label>
                    <label className="staffField col-9">
                      Headline
                      <input
                        value={form.homeHeadline}
                        onChange={(e) => setForm({ ...form, homeHeadline: e.target.value })}
                      />
                    </label>
                    <label className="staffField full">
                      Intro
                      <textarea
                        rows={2}
                        value={form.homeIntro}
                        onChange={(e) => setForm({ ...form, homeIntro: e.target.value })}
                      />
                    </label>
                    {(form.homeFeatures || []).map((item, index) => (
                      <div key={index} className="full staffNested">
                        <label className="staffField col-3">
                          Icon
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const homeFeatures = form.homeFeatures.map((row, i) =>
                                i === index ? { ...row, icon: e.target.value } : row,
                              )
                              setForm({ ...form, homeFeatures })
                            }}
                          >
                            <option value="food">Food</option>
                            <option value="drinks">Drinks</option>
                            <option value="coffee">Coffee</option>
                          </select>
                        </label>
                        <label className="staffField col-9">
                          Title
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const homeFeatures = form.homeFeatures.map((row, i) =>
                                i === index ? { ...row, title: e.target.value } : row,
                              )
                              setForm({ ...form, homeFeatures })
                            }}
                          />
                        </label>
                        <label className="staffField full">
                          Text
                          <textarea
                            rows={2}
                            value={item.text}
                            onChange={(e) => {
                              const homeFeatures = form.homeFeatures.map((row, i) =>
                                i === index ? { ...row, text: e.target.value } : row,
                              )
                              setForm({ ...form, homeFeatures })
                            }}
                          />
                        </label>
                      </div>
                    ))}
                    <div className="full">
                      <button
                        type="button"
                        className="staffBtn staffBtnGhost"
                        onClick={() =>
                          setForm({
                            ...form,
                            homeFeatures: [
                              ...(form.homeFeatures || []),
                              { icon: 'food', title: '', text: '' },
                            ],
                          })
                        }
                      >
                        Add highlight
                      </button>
                    </div>
                    <MediaGalleryField
                      label="Home photos"
                      values={form.homeImages}
                      onChange={(homeImages) => setForm({ ...form, homeImages })}
                      max={4}
                    />
                    <label className="staffField col-3">
                      Button label
                      <input
                        value={form.homeCtaLabel}
                        onChange={(e) => setForm({ ...form, homeCtaLabel: e.target.value })}
                      />
                    </label>
                    <label className="staffField col-9">
                      Button path
                      <input
                        value={form.homeCtaPath}
                        onChange={(e) => setForm({ ...form, homeCtaPath: e.target.value })}
                      />
                    </label>
                  </>
                )}
              </>
            )}
            <div className="formActions full">
              <button type="button" className="staffBtn staffBtnGhost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="staffBtn" disabled={gridPending || lowerPending}>
                {gridPending || lowerPending ? 'Wait for photos' : 'Save'}
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
