import { useContactPage } from '@lib/queries/useContactPage'
import PageLoader from '@components/ui/PageLoader'
import ContactHero from '@sections/contact/ContactHero'
import ContactMain from '@sections/contact/ContactMain'

export default function ContactPage() {
  const { isLoading, isError } = useContactPage()

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
      <ContactHero />
      <ContactMain />
    </>
  )
}
