import { getProfile } from '@/lib/auth/session'

const ADMIN_ROLES = ['super_admin', 'admin', 'staff']

/** Returns the admin profile, or null if the caller is not an admin. */
export async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !ADMIN_ROLES.includes(profile.role)) return null
  return profile
}
