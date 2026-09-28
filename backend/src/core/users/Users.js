import { APIError } from 'payload'
import { previewUpload } from '../fields/pageHero.js'
import {
  canCreateUser,
  canDeleteUser,
  canReadUser,
  canUpdateUser,
  guardUserWrite,
} from './access.js'

function resetEmailHtml({ token }) {
  const server = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
  const adminUrl = `${server}/admin/reset/${token}`
  const staffUrl = `${frontend}/staff/reset/${token}`
  return `
    <div style="font-family:Georgia,serif;background:#f7f5f1;padding:32px">
      <div style="max-width:520px;margin:0 auto;background:#fff;padding:28px 32px;border:1px solid #e6e9f0">
        <p style="color:#e25b2a;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;margin:0 0 8px">BE Inn Villa</p>
        <h1 style="color:#1a2b4b;font-size:22px;margin:0 0 12px">Reset your password</h1>
        <p style="color:#5c6578;line-height:1.6">We received a request to reset the admin password for this account. This link expires in one hour.</p>
        <p style="margin:24px 0">
          <a href="${adminUrl}" style="display:inline-block;background:#1a2b4b;color:#fff;text-decoration:none;padding:12px 18px;font-weight:700">Choose a new password</a>
        </p>
        <p style="color:#8a8172;font-size:13px;word-break:break-all">${adminUrl}</p>
        <p style="color:#8a8172;font-size:13px">Staff desk: <a href="${staffUrl}">${staffUrl}</a></p>
        <p style="color:#8a8172;font-size:13px">If you did not request this, you can ignore the email.</p>
      </div>
    </div>
  `
}

export const Users = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    forgotPassword: {
      expiration: 1000 * 60 * 60,
      generateEmailSubject: () => 'Reset your BE Inn Villa admin password',
      generateEmailHTML: resetEmailHtml,
    },
  },
  labels: {
    singular: 'Admin account',
    plural: 'Admin accounts',
  },
  admin: {
    group: false,
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'status'],
    description: 'Super admin adds admins. Admins manage editors and site settings.',
  },
  access: {
    create: canCreateUser,
    read: canReadUser,
    update: canUpdateUser,
    delete: canDeleteUser,
  },
  fields: [
    { name: 'firstName', type: 'text', admin: { width: '25%' } },
    { name: 'lastName', type: 'text', admin: { width: '25%' } },
    { name: 'name', type: 'text', admin: { width: '25%', description: 'Optional display name if first/last are empty' } },
    { name: 'phone', type: 'text', admin: { width: '25%' } },
    previewUpload('avatar', { admin: { width: '25%' } }),
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Super admin', value: 'superadmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [guardUserWrite],
    beforeLogin: [
      ({ user }) => {
        if (user?.status === 'inactive') {
          throw new APIError('This account is waiting for approval. It cannot open the admin pages yet.', 401)
        }
      },
    ],
    afterLogin: [
      ({ req, user }) => {
        if (!user?.id) return
        const { id } = user
        const { payload } = req
        // Do not write on `req` here — login is already in a Mongo
        // transaction, and updating the same user causes Atlas WriteConflict
        // ("Something went wrong" on the login form).
        setImmediate(() => {
          payload
            .update({
              collection: 'users',
              id,
              data: { lastLogin: new Date().toISOString() },
              overrideAccess: true,
            })
            .catch((error) => {
              payload.logger?.error?.(error)
            })
        })
      },
    ],
  },
}
