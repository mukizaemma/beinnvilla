import PageHero from '@components/ui/PageHero'
import { useAboutPage } from '@lib/queries/useAboutPage'

export default function AboutHero() {
  const { data } = useAboutPage()
  const { eyebrow, headline, intro, backgroundImage } = data.hero

  return (
    <PageHero
      image={backgroundImage}
      eyebrow={eyebrow || 'About us'}
      title={headline || 'A home by Lake Kivu'}
      text={intro || 'Grand Villa is one private apartment in Karongi for a group — six bedrooms, a kitchen, a private bar, and the lake outside.'}
      primaryTo="/book"
      primaryLabel="Book the apartment"
      secondaryTo="/accommodation"
      secondaryLabel="See the apartment"
    />
  )
}
