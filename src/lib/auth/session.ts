import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types/database'

export async function getSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function getRole(): Promise<UserRole | null> {
  const profile = await getProfile()
  return profile?.role ?? null
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireRole(...roles: UserRole[]) {
  const profile = await getProfile()
  if (!profile || !roles.includes(profile.role)) {
    throw new Error('Forbidden')
  }
  return profile
}
