import { APIError } from 'payload'

export function isSuperAdmin(user) {
  return user?.role === 'superadmin'
}

export function isAdmin(user) {
  return user?.role === 'admin' || user?.role === 'superadmin'
}

function sameUser(actor, doc) {
  if (!actor || !doc) return false
  return String(actor.id) === String(doc.id || doc)
}

export async function canCreateUser({ req }) {
  if (isAdmin(req.user)) return true
  if (req.user) return false

  const existing = await req.payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return existing.totalDocs === 0
}

export function canReadUser({ req, id }) {
  if (!req.user) return false
  if (isAdmin(req.user)) return true
  if (id) return sameUser(req.user, { id })
  return { id: { equals: req.user.id } }
}

export function canUpdateUser({ req, id }) {
  if (!req.user) return false
  if (isSuperAdmin(req.user)) return true
  if (req.user.role === 'admin') {
    if (id && sameUser(req.user, { id })) return true
    return {
      and: [{ role: { not_equals: 'superadmin' } }, { role: { not_equals: 'admin' } }],
    }
  }
  if (id) return sameUser(req.user, { id })
  return false
}

export function canDeleteUser({ req, id }) {
  if (!req.user || (id && sameUser(req.user, { id }))) return false
  if (isSuperAdmin(req.user)) return true
  if (req.user.role === 'admin') {
    return {
      and: [{ role: { not_equals: 'superadmin' } }, { role: { not_equals: 'admin' } }],
    }
  }
  return false
}

export async function guardUserWrite({ data, req, operation, originalDoc }) {
  if (!data) return data
  const actor = req.user
  const nextRole = data.role || originalDoc?.role || 'editor'

  if (!actor) {
    if (operation === 'create' && !data.role) {
      const existing = await req.payload.find({
        collection: 'users',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      data.role = existing.totalDocs === 0 ? 'superadmin' : 'editor'
    }
    return data
  }

  if (isSuperAdmin(actor)) {
    if (
      operation === 'update' &&
      originalDoc?.role === 'superadmin' &&
      data.role &&
      data.role !== 'superadmin'
    ) {
      const supers = await req.payload.find({
        collection: 'users',
        where: { role: { equals: 'superadmin' } },
        limit: 0,
        depth: 0,
        overrideAccess: true,
      })
      if (supers.totalDocs <= 1) {
        throw new APIError('Keep at least one super admin.', 400)
      }
    }
    return data
  }

  if (actor.role === 'admin') {
    if (operation === 'create' && nextRole !== 'editor') {
      throw new APIError('Only a super admin can add an admin.', 403)
    }
    if (operation === 'update') {
      if (originalDoc?.role === 'superadmin' || (originalDoc?.role === 'admin' && !sameUser(actor, originalDoc))) {
        throw new APIError('Only a super admin can change an admin account.', 403)
      }
      if (data.role && data.role !== 'editor' && data.role !== originalDoc?.role) {
        throw new APIError('Only a super admin can add an admin.', 403)
      }
    }
    if (!data.role && operation === 'create') data.role = 'editor'
    return data
  }

  if (data.role && data.role !== actor.role) {
    throw new APIError('You cannot change your role.', 403)
  }
  delete data.role
  delete data.status
  return data
}
