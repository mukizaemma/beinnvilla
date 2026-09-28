import PageHero from '@components/ui/PageHero'
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'

export default function BarRestaurantHero() {
  const { data } = useBarRestaurantPage()
  const { eyebrow, headline, intro, cta, backgroundImage } = data.hero

  return (
    <PageHero
      image={backgroundImage}
      eyebrow={eyebrow || 'In-house'}
      title={headline || 'Kitchen and a private bar'}
      text={intro || 'Cook in the apartment kitchen. The bar is for your group staying in the villa — not a public hotel restaurant.'}
      primaryTo={cta?.path || '/book'}
      primaryLabel={cta?.label || 'Book the apartment'}
      secondaryTo="/contact"
      secondaryLabel="Ask about breakfast"
    />
  )
}
