import PageHero from '@components/ui/PageHero'
import { useGalleryPage } from '@lib/queries/useGalleryPage'

export default function GalleryHero() {
  const { data } = useGalleryPage()
  const { eyebrow, headline, intro, backgroundImage, cta, secondaryCta } = data.hero

  return (
    <PageHero
      image={backgroundImage}
      eyebrow={eyebrow || 'Look around'}
      title={headline || 'Grand Villa, in pictures'}
      text={intro || 'Rooms, dining, and the light on Lake Kivu that makes guests linger.'}
      primaryTo={cta?.path || '/book'}
      primaryLabel={cta?.label || 'Book now'}
      secondaryTo={secondaryCta?.path || '/accommodation'}
      secondaryLabel={secondaryCta?.label || 'View rooms'}
    />
  )
}
