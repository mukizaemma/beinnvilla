import { getPayload } from 'payload'
import config from '../payload.config.js'

function arg(name, fallback = '') {
  const flag = process.argv.find((item) => item.startsWith(`--${name}=`))
  if (flag) return flag.slice(name.length + 3)
  const index = process.argv.indexOf(`--${name}`)
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1]
  return fallback
}

const email = arg('email', process.env.ADMIN_EMAIL).trim().toLowerCase()
const password = arg('password', process.env.ADMIN_PASSWORD)
const firstName = arg('firstName', process.env.ADMIN_FIRST_NAME || 'Super')
const lastName = arg('lastName', process.env.ADMIN_LAST_NAME || 'Admin')
const role = arg('role', process.env.ADMIN_ROLE || 'superadmin')

if (!process.env.MONGODB_URI && !process.env.DATABASE_URI) {
  console.error('Missing MONGODB_URI in backend/.env')
  process.exit(1)
}

if (!process.env.PAYLOAD_SECRET) {
  console.error('Missing PAYLOAD_SECRET in backend/.env')
  process.exit(1)
}

if (!email || !password) {
  console.error('Usage: npm run create-admin -- --email you@example.com --password "your-password"')
  process.exit(1)
}

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
  overrideAccess: true,
})

const data = {
  email,
  password,
  firstName,
  lastName,
  role,
  status: 'active',
}

let user
if (existing.totalDocs > 0) {
  user = await payload.update({
    collection: 'users',
    id: existing.docs[0].id,
    data,
    overrideAccess: true,
  })
  console.log(`Updated ${user.email} as ${user.role} (${user.id}).`)
} else {
  user = await payload.create({
    collection: 'users',
    data,
    overrideAccess: true,
  })
  console.log(`Created ${user.email} as ${user.role} (${user.id}).`)
}

console.log('Sign in at http://localhost:3000/admin or http://localhost:5173/staff/login')
process.exit(0)
