import { useAboutPage } from '@lib/queries/useAboutPage'
import PageLoader from '@components/ui/PageLoader'
import AboutHero from '@sections/about/AboutHero'
import AboutStory from '@sections/about/AboutStory'
import AboutValues from '@sections/about/AboutValues'
import AboutCTA from '@sections/about/AboutCTA'

export default function AboutPage() {
  const { isLoading, isError } = useAboutPage()

  if (isLoading) return <PageLoader />
  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutCTA />
    </>
  )
}