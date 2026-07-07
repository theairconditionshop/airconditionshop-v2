import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'

// Removes media files that are no longer referenced by ANY content table
// (see the find_orphaned_media() Postgres function for the reference
// check). Never touches a row younger than the grace period, so an
// in-progress admin edit (uploaded but not yet saved) is never swept.
//
// Triggered by:
//  - Vercel Cron (see vercel.json), authenticated via CRON_SECRET
//  - A logged-in admin clicking "Run Cleanup Now" in the Media Library
const GRACE_PERIOD_HOURS = 48

async function isAuthorized(request: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth === `Bearer ${cronSecret}`) return true
  }
  const profile = await getProfile()
  return !!profile && ['super_admin', 'admin'].includes(profile.role)
}

export async function POST(request: Request) {
  if (!await isAuthorized(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = createAdminClient()

  const { data: orphans, error: queryError } = await db
    .rpc('find_orphaned_media', { grace_hours: GRACE_PERIOD_HOURS })

  if (queryError) {
    console.error('[cleanup-orphans] failed to query orphans:', queryError.message)
    return NextResponse.json({ error: 'Failed to query orphaned media' }, { status: 500 })
  }

  const candidates = (orphans ?? []) as { id: string; filename: string; url: string; created_at: string }[]
  if (!candidates.length) {
    return NextResponse.json({ deleted: 0, results: [] })
  }

  const results: { id: string; filename: string; deleted: boolean; error?: string }[] = []

  for (const row of candidates) {
    const match = row.url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/)
    if (!match) {
      results.push({ id: row.id, filename: row.filename, deleted: false, error: 'Could not parse storage path' })
      continue
    }

    const { error: storageError } = await db.storage.from('media').remove([match[1]])
    if (storageError) {
      console.error('[cleanup-orphans] storage delete failed for', row.filename, ':', storageError.message)
      results.push({ id: row.id, filename: row.filename, deleted: false, error: storageError.message })
      continue
    }

    const { error: dbError } = await db.from('media').delete().eq('id', row.id)
    if (dbError) {
      console.error('[cleanup-orphans] media row delete failed for', row.filename, ':', dbError.message)
      results.push({ id: row.id, filename: row.filename, deleted: false, error: dbError.message })
      continue
    }

    results.push({ id: row.id, filename: row.filename, deleted: true })
  }

  const deleted = results.filter(r => r.deleted).length
  return NextResponse.json({ deleted, total: candidates.length, results })
}
