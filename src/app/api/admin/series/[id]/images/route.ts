import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin-guard'
import { optimizeProductImage } from '@/lib/images/optimize'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_RAW_BYTES  = 20 * 1024 * 1024
const MAX_PER_GALLERY = 8

// POST /api/admin/series/[id]/images — upload one image (optionally to a colour gallery)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const rl = rateLimit(`series-image-upload:${admin.id}`, 60, 60 * 60 * 1000)
    if (rl.limited) return rateLimitResponse(rl)
    const { id: seriesId } = await params
    const db = createAdminClient()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const colourIdRaw = formData.get('colour_id')
    const colourId = colourIdRaw && String(colourIdRaw).length ? String(colourIdRaw) : null
    const altTextRaw = formData.get('alt_text')
    const altText = altTextRaw && String(altTextRaw).trim().length ? String(altTextRaw).trim() : null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ACCEPTED_TYPES.has(file.type)) return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 })
    if (file.size > MAX_RAW_BYTES) return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 })

    // Enforce per-gallery cap (per colour, or series-level when colourId null)
    let countQuery = db.from('series_images').select('id', { count: 'exact', head: true }).eq('series_id', seriesId)
    countQuery = colourId ? countQuery.eq('colour_id', colourId) : countQuery.is('colour_id', null)
    const { count } = await countQuery
    if ((count ?? 0) >= MAX_PER_GALLERY) {
      return NextResponse.json({ error: `Maximum ${MAX_PER_GALLERY} images per gallery` }, { status: 400 })
    }

    let fullBuffer: Buffer, thumbBuffer: Buffer
    try {
      const raw = Buffer.from(await file.arrayBuffer())
      const optimized = await optimizeProductImage(raw)
      fullBuffer = optimized.full.buffer
      thumbBuffer = optimized.thumbnail.buffer
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image processing failed'
      return NextResponse.json({ error: `Image processing failed: ${msg}` }, { status: 400 })
    }

    const token     = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const fullPath  = `series/${seriesId}/${token}.webp`
    const thumbPath = `series/${seriesId}/${token}-thumb.webp`
    const [uFull, uThumb] = await Promise.all([
      db.storage.from('media').upload(fullPath,  fullBuffer,  { contentType: 'image/webp' }),
      db.storage.from('media').upload(thumbPath, thumbBuffer, { contentType: 'image/webp' }),
    ])
    if (uFull.error) return NextResponse.json({ error: `Storage error: ${uFull.error.message}` }, { status: 500 })
    const thumbOk = !uThumb.error

    const { data: fullUrl }  = db.storage.from('media').getPublicUrl(fullPath)
    const { data: thumbUrl } = db.storage.from('media').getPublicUrl(thumbPath)

    const isPrimary = (count ?? 0) === 0
    const { data: image, error: dbError } = await db
      .from('series_images')
      .insert({
        series_id:     seriesId,
        colour_id:     colourId,
        url:           fullUrl.publicUrl,
        thumbnail_url: thumbOk ? thumbUrl.publicUrl : null,
        alt_text:      altText,
        is_primary:    isPrimary,
        display_order: count ?? 0,
      })
      .select()
      .single()
    if (dbError) return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    return NextResponse.json(image)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}

// DELETE /api/admin/series/[id]/images?imageId=xxx
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: seriesId } = await params
  const imageId = new URL(request.url).searchParams.get('imageId')
  if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 })

  const db = createAdminClient()
  const { data: img } = await db
    .from('series_images').select('url, thumbnail_url').eq('id', imageId).eq('series_id', seriesId).single()
  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const key      = img.url.split('/storage/v1/object/public/media/')[1]
  const thumbKey = img.thumbnail_url?.split('/storage/v1/object/public/media/')[1]
  const removals: Promise<unknown>[] = []
  if (key)      removals.push(db.storage.from('media').remove([key]))
  if (thumbKey) removals.push(db.storage.from('media').remove([thumbKey]))
  await Promise.all(removals)
  await db.from('series_images').delete().eq('id', imageId)
  return NextResponse.json({ ok: true })
}

// PATCH /api/admin/series/[id]/images — set primary or reorder
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: seriesId } = await params
  const body = await request.json()
  const db = createAdminClient()

  if (body.setPrimary) {
    // Clear primary within the same gallery scope, then set the chosen one.
    const { data: target } = await db.from('series_images').select('colour_id').eq('id', body.setPrimary).single()
    if (target) {
      let scope = db.from('series_images').update({ is_primary: false }).eq('series_id', seriesId)
      scope = target.colour_id ? scope.eq('colour_id', target.colour_id) : scope.is('colour_id', null)
      await scope
      await db.from('series_images').update({ is_primary: true }).eq('id', body.setPrimary).eq('series_id', seriesId)
    }
  }
  if (Array.isArray(body.reorder)) {
    await Promise.all(
      body.reorder.map(({ id, display_order }: { id: string; display_order: number }) =>
        db.from('series_images').update({ display_order }).eq('id', id).eq('series_id', seriesId)
      )
    )
  }
  return NextResponse.json({ ok: true })
}
