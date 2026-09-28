import PageHero from '@components/ui/PageHero'
import { useContactPage } from '@lib/queries/useContactPage'

export default function ContactHero() {
  const { data } = useContactPage()
  const hero = data.hero

  return (
    <PageHero
      image={hero.backgroundImage}
      eyebrow={hero.eyebrow || 'Get in touch'}
      title={hero.headline || 'Let’s plan your stay'}
      text={
        hero.intro ||
        'Ask about rooms, dining, or a quiet night by Lake Kivu — we will reply within a day.'
      }
      primaryTo={hero.cta?.path || '/book'}
      primaryLabel={hero.cta?.label || 'Book now'}
      secondaryTo={hero.secondaryCta?.path || '/accommodation'}
      secondaryLabel={hero.secondaryCta?.label || 'See the apartment'}
    />
  )
}
