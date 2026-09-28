import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Eye, X } from 'lucide-react'
import { useHomePage } from '@lib/queries/useHomePage'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { useFacilities } from '@features/hotel/queries/useFacilities'
import { HERO, INN } from '@features/hotel/inn'
import { useInView } from '@hooks/useInView'
import PageLoader from '@components/ui/PageLoader'
import Reveal from '@components/ui/Reveal'
import HouseStayForm from '@sections/booking/HouseStayForm'
import styles from './HomePage.module.css'

function Slideshow({ slides, onIndex }) {
  const [index, setIndex] = useState(0)
  const [order, setOrder] = useState([])
  const count = slides.length

  useEffect(() => {
    onIndex?.(index)
  }, [index, onIndex])

  useEffect(() => {
    setOrder((stack) => {
      const next = Array.from({ length: count }, (_, i) => stack[i] || 0)
      const top = next.reduce((max, value) => Math.max(max, value), 0)
      next[index] = top + 1
      return next
    })
  }, [index, count])

  useEffect(() => {
    if (count < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 8000)
    return () => window.clearInterval(timer)
  }, [count])

  if (!count) return <div className={styles.chapterFill} />

  return (
    <div className={styles.stage}>
      <div className={styles.motion}>
        {slides.map((shot, i) => (
          <img
            key={`${shot.image}-${i}`}
            className={i === index ? styles.shotOn : styles.shot}
            style={{ zIndex: order[i] || 0 }}
            src={shot.image}
            alt=""
          />
        ))}
      </div>
    </div>
  )
}

function GalleryMosaic({ images, variant = 'grid' }) {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (open == null) return undefined
    function onKey(event) {
      if (event.key === 'Escape') setOpen(null)
      if (event.key === 'ArrowRight') setOpen((index) => (index + 1) % images.length)
      if (event.key === 'ArrowLeft') setOpen((index) => (index - 1 + images.length) % images.length)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, images.length])

  if (!images.length) return null

  const cards = images.map((image, index) => (
    <Reveal
      key={image}
      as="button"
      type="button"
      className={variant === 'offers' ? styles.offer : styles.photoCard}
      delay={index * 70}
      onClick={() => setOpen(index)}
      aria-label={`Open photograph ${index + 1} of ${images.length}`}
    >
      <img src={image} alt="" />
      {variant === 'offers' && (
        <span className={styles.viewIcon}>
          <Eye size={18} strokeWidth={1.75} />
        </span>
      )}
    </Reveal>
  ))

  return (
    <>
      {variant === 'offers' ? cards : <div className={styles.photoGrid}>{cards}</div>}
      {open != null && createPortal(
        <div className={styles.viewer} role="dialog" aria-modal="true" aria-label="Photograph">
          <div className={styles.viewerBar}>
            <button type="button" className={styles.viewerClose} onClick={() => setOpen(null)} aria-label="Close">
              <X size={22} strokeWidth={1.75} />
            </button>
          </div>
          <div className={styles.viewerStage}>
            <button
              type="button"
              className={styles.viewerBack}
              onClick={() => setOpen((index) => (index - 1 + images.length) % images.length)}
              aria-label="Previous photograph"
            >
              ‹
            </button>
            <img src={images[open]} alt="" />
            <button
              type="button"
              className={styles.viewerNext}
              onClick={() => setOpen((index) => (index + 1) % images.length)}
              aria-label="Next photograph"
            >
              ›
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function CountUp({ to }) {
  const [ref, inView] = useInView(0.6)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(to)
      return undefined
    }
    let start
    let frame
    const duration = 1100
    const tick = (now) => {
      if (!start) start = now
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(eased * to))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, to])

  return <strong ref={ref}>{value}</strong>
}

export default function HomePage() {
  const home = useHomePage()
  const layout = useSiteLayout()
  const facilitiesQuery = useFacilities()
  const [heroIndex, setHeroIndex] = useState(0)
  const isLoading = home.isLoading || layout.isLoading || facilitiesQuery.isLoading

  useEffect(() => {
    if (isLoading || window.location.hash !== '#stay') return undefined
    const node = document.getElementById('stay')
    if (!node) return undefined
    const previous = document.documentElement.style.scrollBehavior
    function place() {
      document.documentElement.style.scrollBehavior = 'auto'
      node.scrollIntoView({ block: 'start' })
      document.documentElement.style.scrollBehavior = previous
    }
    const restore = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    place()
    const later = window.setTimeout(place, 250)
    return () => {
      window.clearTimeout(later)
      window.history.scrollRestoration = restore
    }
  }, [isLoading])

  if (isLoading) return <PageLoader />
  if (home.isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn&apos;t load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  const page = home.data
  const heroSlides = (page.hero?.slides || [])
    .map((slide) => ({ image: slide.image }))
    .filter((slide) => slide.image)
  const galleryImages = page.gallery || []
  const lowerImages = page.lower || []
  const enjoyed = (facilitiesQuery.data || []).map((item) => item.name)
  const line = HERO.lines[heroIndex % HERO.lines.length]

  return (
    <div className={styles.page}>
      <section className={styles.chapter} style={{ zIndex: 1 }}>
        <Slideshow slides={heroSlides} onIndex={setHeroIndex} />
        <div className={styles.chapterScrim} />
        <Reveal className={styles.heroCard}>
          <p className={styles.kicker}>{HERO.eyebrow}</p>
          <h1>
            The night is <span>the view.</span>
          </h1>
          <p className={styles.lede} key={line}>{line}</p>
          <div className={styles.heroActions}>
            <Link to={HERO.primary.path} className={styles.primary}>
              {HERO.primary.label}
            </Link>
          </div>
        </Reveal>
      </section>

      <section id="gallery" className={styles.band} style={{ zIndex: 2 }} aria-label="Gallery">
        <GalleryMosaic images={galleryImages} />
        <Reveal className={styles.heroActions}>
          <Link to="/accommodation" className={styles.more}>
            All rooms
          </Link>
          <Link to="/gallery" className={styles.more}>
            Show more
          </Link>
        </Reveal>
      </section>

      <section id="house" className={styles.brief} style={{ zIndex: 3 }}>
        <article className={styles.houseCard}>
          <Reveal className={styles.houseCopy}>
            <p className={styles.kicker}>The house</p>
            <h2>Twenty couples, or twenty singles.</h2>
            <p>
              Each of the 20 rooms holds a couple or one guest. Groups are welcome, for a short stay or a long one, with breakfast in the house.
            </p>
          </Reveal>
          <Reveal delay={80} className={styles.capacity} aria-label="How many the house holds">
            <p>
              <CountUp to={INN.rooms} />
              <span>Couples</span>
            </p>
            <p>
              <CountUp to={INN.rooms} />
              <span>Singles</span>
            </p>
          </Reveal>
          <div className={styles.houseFoot}>
            <p className={styles.enjoyLabel}>While you are here</p>
            <ul className={styles.enjoy}>
              <li>Breakfast</li>
              {enjoyed.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </article>
        <a href="#stay" className={`${styles.primary} ${styles.houseAction}`}>
          Book your Stay
        </a>
      </section>

      {lowerImages.length > 0 && (
        <section id="facilities" className={styles.offers} style={{ zIndex: 4 }} aria-label="Photos under the house">
          <GalleryMosaic images={lowerImages} variant="offers" />
        </section>
      )}

      <section id="stay" className={styles.stay} style={{ zIndex: 5 }}>
        <div className={styles.stayLead}>
          <p className={styles.kicker}>Availability</p>
          <h2>See the open nights, then ask for the stay.</h2>
          <p>
            Pick arrival and departure on the calendar. The small number is how many guests we can still host. A crossed date is full. Send the request on WhatsApp or by email. You pay at the hotel.
          </p>
        </div>
        <HouseStayForm anchor="stay" showHeading={false} />
      </section>
    </div>
  )
}
