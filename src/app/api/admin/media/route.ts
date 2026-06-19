import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  const db = createAdminClient()
  const results = []

  for (const file of files) {
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext    = file.name.split('.').pop()
    const path   = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await db.storage.from('media').upload(path, buffer, { contentType: file.type })
    if (!error) {
      const { data: urlData } = db.storage.from('media').getPublicUrl(path)
      await db.from('media').insert({ filename: file.name, original_name: file.name, url: urlData.publicUrl, mime_type: file.type, size: file.size })
      results.push({ path, url: urlData.publicUrl })
    }
  }

  return NextResponse.json({ uploaded: results.length })
}
