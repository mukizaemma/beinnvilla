export const ADMIN_PAGES = [
  { href: '/admin/globals/home-page', slug: 'home-page', label: 'Home' },
  { href: '/admin/globals/about-page', slug: 'about-page', label: 'About' },
  { href: '/admin/globals/rooms-page', slug: 'rooms-page', label: 'Accommodation' },
  { href: '/admin/globals/bar-restaurant-page', slug: 'bar-restaurant-page', label: 'Bar & Restaurant' },
  { href: '/admin/globals/things-to-do-page', slug: 'things-to-do-page', label: 'Things to do' },
  { href: '/admin/globals/gallery-page', slug: 'gallery-page', label: 'Gallery' },
  { href: '/admin/globals/contact-page', slug: 'contact-page', label: 'Contact us' },
  { href: '/admin/globals/booking-page', slug: 'booking-page', label: 'Booking' },
  { href: '/admin/globals/policy-page', slug: 'policy-page', label: 'Booking policy' },
]

export function isAdminPagePath(pathname = '') {
  return ADMIN_PAGES.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
