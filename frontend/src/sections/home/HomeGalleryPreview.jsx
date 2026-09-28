import { Link } from 'react-router-dom'
import { pickApartment } from '@features/hotel/adapters'
import { latestGalleryPreview } from '@features/hotel/gallery/categories'
import { GALLERY_PREVIEW } from '@features/hotel/lakeStay'
import { useGalleryPage } from '@lib/queries/useGalleryPage'
import { useHomePage } from '@lib/queries/useHomePage'
import Reveal from '@components/ui/Reveal'
import styles from './HomeGalleryPreview.module.css'

export default function HomeGalleryPreview() {
  const gallery = useGalleryPage()
  const home = useHomePage()
  const apartment = pickApartment(home.data?.rooms)
  const extras = apartment?.galleryItems?.length
    ? apartment.galleryItems
    : (apartment?.gallery || []).map((image, index) => ({
        id: `apartment-${index}`,
        image,
      }))
  const photos = latestGalleryPreview(gallery.data?.images, extras, 4)
  if (!photos.length) return null

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.header}>
          <span className={styles.eyebrow}>{GALLERY_PREVIEW.eyebrow}</span>
          <h2>{GALLERY_PREVIEW.headline}</h2>
          <p className={styles.intro}>{GALLERY_PREVIEW.intro}</p>
        </Reveal>

        <div className={styles.grid}>
          {photos.map((item, index) => (
            <Reveal as="figure" key={item.id || item.image} className={styles.photo} delay={index * 70}>
              <img src={item.image} alt={item.caption || ''} />
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.actions} delay={120}>
          <Link to={GALLERY_PREVIEW.cta.path} className={styles.cta}>
            {GALLERY_PREVIEW.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
