import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/core/users/Users.js'
import { Media } from './src/core/files/Media.js'
import { Company } from './src/core/settings/Company.js'
import { Navigation } from './src/core/settings/Navigation.js'

import { Rooms } from './src/modules/hotel/rooms/Rooms.js'
import { Experiences } from './src/modules/hotel/experiences/Experiences.js'
import { Bookings } from './src/modules/hotel/reservations/Bookings.js'
import { AvailabilityBlocks } from './src/modules/hotel/reservations/AvailabilityBlocks.js'
import { GalleryPhotos } from './src/modules/hotel/gallery/GalleryPhotos.js'

import { HomePage } from './src/modules/hotel/pages/HomePage.js'
import { RoomsPage } from './src/modules/hotel/pages/RoomsPage.js'
import { BarRestaurantPage } from './src/modules/hotel/pages/BarRestaurantPage.js'
import { GalleryPage } from './src/modules/hotel/pages/GalleryPage.js'
import { ContactPage } from './src/modules/hotel/pages/ContactPage.js'
import { AboutPage } from './src/modules/hotel/pages/AboutPage.js'
import { ThingsToDoPage } from './src/modules/hotel/pages/ThingsToDoPage.js'
import { BookingPage } from './src/modules/hotel/pages/BookingPage.js'
import { PolicyPage } from './src/modules/hotel/pages/PolicyPage.js'
import { Amenities } from './src/modules/hotel/amenities/Amenities.js'
import { Facilities } from './src/modules/hotel/facilities/Facilities.js'
import { MenuItems } from './src/modules/hotel/menu/MenuItems.js'
import { SiteAudit } from './src/core/settings/SiteAudit.js'
import { UserGuide } from './src/core/settings/UserGuide.js'
import { HandoverFeedback } from './src/modules/hotel/feedback/HandoverFeedback.js'
import { HostingInvoices } from './src/modules/hotel/hosting/HostingInvoices.js'
import { HostingReminders } from './src/modules/hotel/hosting/HostingReminders.js'
import { HostingProfile } from './src/modules/hotel/hosting/HostingProfile.js'
import { startHostingSchedule } from './src/modules/hotel/hosting/schedule.js'
import { withPageNav } from './src/components/payload/PageSwitcher/withPageNav.js'
import { createEmailAdapter } from './src/core/security/email.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URI
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || undefined,
  db: mongooseAdapter({
    url: mongoUri,
  }),
  editor: lexicalEditor(),
  email: createEmailAdapter(),
  sharp,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- BE Inn Villa',
      favicon: '/brand/be-inn-mark.jpg',
    },
    components: {
      graphics: {
        Logo: './src/components/payload/Logo/index.jsx#Logo',
        Icon: './src/components/payload/Icon/index.jsx#Icon',
      },
      beforeDashboard: ['./src/components/payload/BookingsDashboard/index.jsx#BookingsDashboard'],
      beforeNavLinks: ['./src/components/payload/HotelNav/index.jsx#HotelNav'],
      providers: ['./src/components/payload/AdminChrome/index.jsx#AdminChrome'],
      actions: ['./src/components/payload/PageSwitcher/index.jsx#PageSwitcherMenu'],
    },
  },
  collections: [Users, Media, Rooms, Facilities, GalleryPhotos, Bookings, AvailabilityBlocks, Experiences, Amenities, MenuItems, HandoverFeedback, HostingInvoices, HostingReminders],
  globals: [
    Company,
    Navigation,
    withPageNav(HomePage),
    withPageNav(RoomsPage),
    withPageNav(BarRestaurantPage),
    withPageNav(GalleryPage),
    withPageNav(ContactPage),
    withPageNav(AboutPage),
    withPageNav(ThingsToDoPage),
    withPageNav(BookingPage),
    withPageNav(PolicyPage),
    SiteAudit,
    UserGuide,
    HostingProfile,
  ],
  onInit: async (payload) => {
    const uri = mongoUri || ''
    const database = uri.split('?')[0].split('/').filter(Boolean).pop() || 'missing'
    payload.logger.info(`Connected MongoDB database: ${database}`)
    if (uri.includes(':PASSWORD@')) {
      payload.logger.error(
        'MONGODB_URI still contains the PASSWORD placeholder. Replace it with the Atlas password for the beinnvilla database.',
      )
    }
    if (!process.env.RESEND_API_KEY) {
      payload.logger.warn('RESEND_API_KEY is empty. Reservation emails will not be delivered.')
    }
    startHostingSchedule(payload)
  },
  cors: [frontendUrl, 'http://localhost:3000'].filter(Boolean),
  csrf: [frontendUrl, 'http://localhost:3000'].filter(Boolean),
  graphQL: {
    disable: true,
  },
})
