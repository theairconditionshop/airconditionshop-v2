import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { optimizeGeneralImage, isPassthrough } from '@/lib/images/optimize'

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
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
      // SVG and PDF: upload as-is — cannot be raster-converted
      uploadBuffer = rawBuffer
      contentType  = file.type
      ext          = file.type === 'application/pdf' ? 'pdf' : 'svg'
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
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { url } = body as { url?: string }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }

  const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/)
  if (!match) {
    return NextResponse.json({ deleted: false })
  }

  const storagePath = match[1]
  const db = createAdminClient()
  const { error } = await db.storage.from('media').remove([storagePath])
  if (error) {
    console.error('[media] Delete failed for', storagePath, ':', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true, path: storagePath })
}
