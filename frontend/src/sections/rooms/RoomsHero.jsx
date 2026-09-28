import PageHero from '@components/ui/PageHero'
import { useRoomsPage } from '@lib/queries/useRoomsPage'

export default function RoomsHero() {
  const { data } = useRoomsPage()
  const { hero } = data

  return (
    <PageHero
      image={hero.backgroundImage}
      eyebrow={hero.eyebrow || 'The apartment'}
      title={hero.headline || 'One private villa for your group'}
      text={
        hero.intro ||
        'Six bedrooms, six bathrooms, a kitchen, and a private bar on Lake Kivu. Take the whole building — $150 a night without breakfast, $200 with breakfast, or $2,500 a month.'
      }
      primaryTo={hero.cta?.path || '/book'}
      primaryLabel={hero.cta?.label || 'Book the apartment'}
      secondaryTo={hero.secondaryCta?.path || '/contact'}
      secondaryLabel={hero.secondaryCta?.label || 'Ask about a month'}
    />
  )
}
