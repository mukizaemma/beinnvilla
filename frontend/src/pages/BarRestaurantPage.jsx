import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'
import PageLoader from '@components/ui/PageLoader'
import BarRestaurantHero from '@sections/bar-restaurant/BarRestaurantHero'
import BarRestaurantHours from '@sections/bar-restaurant/BarRestaurantHours'
import BarRestaurantPanels from '@sections/bar-restaurant/BarRestaurantPanels'
import BarRestaurantVideo from '@sections/bar-restaurant/BarRestaurantVideo'
import BarRestaurantCTA from '@sections/bar-restaurant/BarRestaurantCTA'

export default function BarRestaurantPage() {
  const { isLoading, isError } = useBarRestaurantPage()

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
      <BarRestaurantHero />
      <BarRestaurantHours />
      <BarRestaurantPanels />
      <BarRestaurantVideo />
      <BarRestaurantCTA />
    </>
  )
}
