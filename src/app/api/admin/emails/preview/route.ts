import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/session'
import { buildEmailPreview } from '@/lib/resend/preview'

export async function GET(request: Request) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const html = buildEmailPreview(key)
  if (!html) return NextResponse.json({ error: 'Unknown template key' }, { status: 404 })

  return NextResponse.json({ html })
}
