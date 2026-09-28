import { useGalleryPage } from '@lib/queries/useGalleryPage'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import GalleryGrid from '@sections/gallery/GalleryGrid'

export default function GalleryPage() {
  const { data, isLoading, isError } = useGalleryPage()

  if (isLoading) return <PageLoader />
  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn&apos;t load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  const header = data.hero?.backgroundImage || data.images?.[0]?.image || ''

  return (
    <>
      <ScreenHeader image={header} title="Gallery" />
      <GalleryGrid />
    </>
  )
}
