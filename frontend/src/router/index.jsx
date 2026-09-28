import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PageLoader from '@components/ui/PageLoader'
import Layout from '@components/layout/Layout'

const HomePage          = lazy(() => import('@pages/HomePage'))
const AccommodationPage = lazy(() => import('@pages/AccommodationPage'))
const RoomDetailPage    = lazy(() => import('@pages/RoomDetailPage'))
const FacilitiesPage    = lazy(() => import('@pages/FacilitiesPage'))
const FacilityDetailPage = lazy(() => import('@pages/FacilityDetailPage'))
const GalleryPage       = lazy(() => import('@pages/GalleryPage'))
const VisitPage         = lazy(() => import('@pages/VisitPage'))
const BookingPage       = lazy(() => import('@pages/BookingPage'))
const PolicyPage        = lazy(() => import('@pages/PolicyPage'))
const HandoverPage      = lazy(() => import('@pages/HandoverPage'))
const NotFoundPage      = lazy(() => import('@pages/NotFoundPage'))
const StaffRoot         = lazy(() => import('@features/staff/StaffRoot'))
const StaffLayout       = lazy(() => import('@features/staff/layout/StaffLayout'))
const StaffLoginPage    = lazy(() => import('@features/staff/pages/StaffLoginPage'))
const StaffJoinPage     = lazy(() => import('@features/staff/pages/StaffJoinPage'))
const StaffForgotPage   = lazy(() => import('@features/staff/pages/StaffForgotPage'))
const StaffResetPage    = lazy(() => import('@features/staff/pages/StaffResetPage'))
const StaffDashboard    = lazy(() => import('@features/staff/pages/StaffDashboard'))
const StaffReservations = lazy(() => import('@features/staff/pages/StaffReservations'))
const StaffAvailability = lazy(() => import('@features/staff/pages/StaffAvailability'))
const StaffRooms        = lazy(() => import('@features/staff/pages/StaffRooms'))
const StaffExperiences  = lazy(() => import('@features/staff/pages/StaffExperiences'))
const StaffGallery      = lazy(() => import('@features/staff/pages/StaffGallery'))
const StaffPages        = lazy(() => import('@features/staff/pages/StaffPages'))
const StaffMedia        = lazy(() => import('@features/staff/pages/StaffMedia'))
const StaffSettings     = lazy(() => import('@features/staff/pages/StaffSettings'))
const StaffAmenities    = lazy(() => import('@features/staff/pages/StaffAmenities'))
const StaffFacilities   = lazy(() => import('@features/staff/pages/StaffFacilities'))
const StaffMenuItems    = lazy(() => import('@features/staff/pages/StaffMenuItems'))
const StaffAudit        = lazy(() => import('@features/staff/pages/StaffAudit'))
const StaffGuide        = lazy(() => import('@features/staff/pages/StaffGuide'))
const StaffAccount      = lazy(() => import('@features/staff/pages/StaffAccount'))
const StaffUsers        = lazy(() => import('@features/staff/pages/StaffUsers'))

// Wraps a lazy component in Suspense — called inline in route elements
const Wrap = ({ Component }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

function RoomRedirect() {
  const { roomId } = useParams()
  return <Navigate to={`/accommodation/${roomId}`} replace />
}

const router = createBrowserRouter([
  {
    path: '/staff',
    element: <Wrap Component={StaffRoot} />,
    children: [
      { path: 'login', element: <Wrap Component={StaffLoginPage} /> },
      { path: 'join', element: <Wrap Component={StaffJoinPage} /> },
      { path: 'forgot', element: <Wrap Component={StaffForgotPage} /> },
      { path: 'reset/:token', element: <Wrap Component={StaffResetPage} /> },
      {
        element: <Wrap Component={StaffLayout} />,
        children: [
          { index: true, element: <Wrap Component={StaffDashboard} /> },
          { path: 'reservations', element: <Wrap Component={StaffReservations} /> },
          { path: 'availability', element: <Wrap Component={StaffAvailability} /> },
          { path: 'accommodation', element: <Wrap Component={StaffRooms} /> },
          { path: 'rooms', element: <Navigate to="/staff/accommodation" replace /> },
          { path: 'things-to-do', element: <Wrap Component={StaffExperiences} /> },
          { path: 'experiences', element: <Navigate to="/staff/things-to-do" replace /> },
          { path: 'gallery', element: <Wrap Component={StaffGallery} /> },
          { path: 'media', element: <Wrap Component={StaffMedia} /> },
          { path: 'pages', element: <Wrap Component={StaffPages} /> },
          { path: 'settings', element: <Wrap Component={StaffSettings} /> },
          { path: 'users', element: <Wrap Component={StaffUsers} /> },
          { path: 'amenities', element: <Wrap Component={StaffAmenities} /> },
          { path: 'facilities', element: <Wrap Component={StaffFacilities} /> },
          { path: 'menu', element: <Wrap Component={StaffMenuItems} /> },
          { path: 'audit', element: <Wrap Component={StaffAudit} /> },
          { path: 'guide', element: <Wrap Component={StaffGuide} /> },
          { path: 'account', element: <Wrap Component={StaffAccount} /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Layout hasHero={true} />,
    children: [
      { index: true, element: <Wrap Component={HomePage} /> },
      { path: 'accommodation', element: <Wrap Component={AccommodationPage} /> },
      { path: 'accommodation/:roomId', element: <Wrap Component={RoomDetailPage} /> },
      { path: 'facilities', element: <Wrap Component={FacilitiesPage} /> },
      { path: 'facilities/:facilityId', element: <Wrap Component={FacilityDetailPage} /> },
      { path: 'gallery', element: <Wrap Component={GalleryPage} /> },
      { path: 'visit', element: <Wrap Component={VisitPage} /> },
      { path: 'book', element: <Wrap Component={BookingPage} /> },
      { path: 'policy', element: <Wrap Component={PolicyPage} /> },
      { path: 'rooms', element: <Navigate to="/accommodation" replace /> },
      { path: 'rooms/:roomId', element: <RoomRedirect /> },
      { path: 'bar-restaurant', element: <Navigate to="/facilities" replace /> },
      { path: 'things-to-do', element: <Navigate to="/facilities" replace /> },
      { path: 'about', element: <Navigate to="/visit" replace /> },
      { path: 'contact', element: <Navigate to="/visit" replace /> },
    ],
  },
  {
    path: '/handover',
    element: <Wrap Component={HandoverPage} />,
  },
  {
    path: '/',
    element: <Layout hasHero={false} />,
    children: [
      { path: '*', element: <Wrap Component={NotFoundPage} /> },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

export default router
