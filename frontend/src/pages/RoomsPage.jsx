import { useRoomsPage } from '@lib/queries/useRoomsPage'
import PageLoader from '@components/ui/PageLoader'
import RoomsHero from '@sections/rooms/RoomsHero'
import RoomsHighlights from '@sections/rooms/RoomsHighlights'
import RoomsList from '@sections/rooms/RoomsList'

export default function RoomsPage() {
  const { isLoading, isError } = useRoomsPage()

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
      <RoomsHero />
      <RoomsHighlights />
      <RoomsList />
    </>
  )
}
