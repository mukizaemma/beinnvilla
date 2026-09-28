import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/admin', permanent: false },
      // Payload 3 collection URLs are /admin/collections/:slug — the old
      // /admin/users and /admin/users/create paths render "Not Found".
      { source: '/admin/users', destination: '/admin/collections/users', permanent: false },
      {
        source: '/admin/users/:path*',
        destination: '/admin/collections/users/:path*',
        permanent: false,
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
