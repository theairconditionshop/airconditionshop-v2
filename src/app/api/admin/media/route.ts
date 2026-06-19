import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'

// Allowlist of MIME types accepted for upload. SVG and HTML are excluded to
// prevent stored XSS — they would be served by the public storage bucket with
// the correct Content-Type, executing scripts in visitor browsers.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'application/pdf',
])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

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
    // Validate MIME type against server-side allowlist (do not trust file.name extension).
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      results.push({ error: `File type not allowed: ${file.type}`, filename: file.name })
      continue
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      results.push({ error: `File too large (max 10 MB): ${file.name}`, filename: file.name })
      continue
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    // Derive extension from the validated MIME type — not from the client filename.
    const ext    = file.type.split('/')[1].replace('jpeg', 'jpg')
    const path   = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await db.storage.from('media').upload(path, buffer, { contentType: file.type })
    if (!error) {
      const { data: urlData } = db.storage.from('media').getPublicUrl(path)
      await db.from('media').insert({
        filename: file.name,
        original_name: file.name,
        url: urlData.publicUrl,
        mime_type: file.type,
        size: file.size,
      })
      results.push({ path, url: urlData.publicUrl })
    } else {
      console.error('[media] Upload failed for', file.name, ':', error.message)
      results.push({ error: error.message, filename: file.name })
    }
  }

  return NextResponse.json({ uploaded: results.filter(r => !r.error).length, results })
}
