import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { optimizeGeneralImage, isPassthrough } from '@/lib/images/optimize'
import { sanitizeSvg } from '@/lib/sanitize'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { audit } from '@/lib/audit'

// SVG is allowed for brand logos (admin-only, trusted uploaders).
// PDF is allowed for product data sheets.
// HTML is excluded to prevent stored XSS.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
])

const MAX_RAW_BYTES = 20 * 1024 * 1024  // 20 MB hard reject before processing

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Abuse protection: 60 uploaded files/hour per admin (a batch of several
  // files is one request but each file consumes one slot below).
  const rl = rateLimit(`media-upload:${admin.id}`, 60, 60 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const formData = await request.formData()
  const files    = formData.getAll('files') as File[]
  const db       = createAdminClient()
  const results  = []

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      results.push({ error: `File type not allowed: ${file.type}`, filename: file.name })
      continue
    }

    if (file.size > MAX_RAW_BYTES) {
      results.push({ error: `File too large (max 20 MB): ${file.name}`, filename: file.name })
      continue
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer())

    let uploadBuffer: Buffer
    let contentType: string
    let ext: string
    let finalWidth:  number | null = null
    let finalHeight: number | null = null
    let finalSize:   number = file.size

    if (isPassthrough(file.type)) {
      // SVG and PDF: cannot be raster-converted. SVG is sanitized to strip
      // any script/handler payload before storage (defense in depth).
      if (file.type === 'image/svg+xml') {
        uploadBuffer = Buffer.from(sanitizeSvg(rawBuffer.toString('utf8')), 'utf8')
        contentType  = 'image/svg+xml'
        ext          = 'svg'
      } else {
        uploadBuffer = rawBuffer
        contentType  = 'application/pdf'
        ext          = 'pdf'
      }
    } else {
      try {
        const optimized  = await optimizeGeneralImage(rawBuffer)
        uploadBuffer     = optimized.buffer
        contentType      = optimized.contentType
        ext              = 'webp'
        finalWidth       = optimized.width
        finalHeight      = optimized.height
        finalSize        = optimized.size
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Image processing failed'
        results.push({ error: msg, filename: file.name })
        continue
      }
    }

    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const path  = `media/${token}.${ext}`

    const { error } = await db.storage.from('media').upload(path, uploadBuffer, { contentType })
    if (!error) {
      const { data: urlData } = db.storage.from('media').getPublicUrl(path)
      const { error: dbError } = await db.from('media').insert({
        filename:      `${token}.${ext}`,
        original_name: file.name,
        url:           urlData.publicUrl,
        mime_type:     contentType,
        size:          finalSize,
        width:         finalWidth,
        height:        finalHeight,
      })
      if (dbError) {
        // Roll the file back out of Storage so a failed index insert doesn't
        // leave an untracked orphan, then report the precise failure.
        console.error('[media] DB insert failed for', file.name, ':', dbError.message)
        await db.storage.from('media').remove([path])
        results.push({ error: `Database insert failed: ${dbError.message}`, filename: file.name })
      } else {
        results.push({ path, url: urlData.publicUrl })
      }
    } else {
      console.error('[media] Storage upload failed for', file.name, ':', error.message)
      results.push({ error: `Storage error: ${error.message}`, filename: file.name })
    }
  }

  return NextResponse.json({ uploaded: results.filter(r => !r.error).length, results })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rl = rateLimit(`media-delete:${admin.id}`, 40, 60 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const body = await request.json().catch(() => ({}))
  const { url } = body as { url?: string }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }

  const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/)
  if (!match) {
    return NextResponse.json({ deleted: false })
  }
  // Reject path traversal in the derived storage key (defense in depth —
  // the regex only captures the media/ prefix, but never resolve '..').
  if (match[1].includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const storagePath = match[1]
  const db = createAdminClient()
  const { error } = await db.storage.from('media').remove([storagePath])
  if (error) {
    console.error('[media] Delete failed for', storagePath, ':', error.message)
    return NextResponse.json({ error: 'Failed to delete file. Please try again.' }, { status: 500 })
  }

  await audit({ action: 'media.delete', actorId: admin.id, actorEmail: admin.email, entityType: 'media', entityId: storagePath, request })
  return NextResponse.json({ deleted: true, path: storagePath })
}
