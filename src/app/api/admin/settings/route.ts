import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return null
  return profile
}

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const values: Record<string, string> = await request.json()
  const db = createAdminClient()
  const updates = Object.entries(values).map(([key, value]) =>
    db.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
  )
  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}
