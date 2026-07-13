import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { optimizeProductImage } from '@/lib/images/optimize'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_RAW_BYTES  = 20 * 1024 * 1024  // 20 MB — reject before processing
const MAX_IMAGES     = 6

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

// POST /api/admin/products/[id]/images — upload one image
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const rl = rateLimit(`product-image-upload:${admin.id}`, 60, 60 * 60 * 1000)
    if (rl.limited) return rateLimitResponse(rl)
    const { id: productId } = await params

    const db = createAdminClient()

    const { count } = await db
      .from('product_images')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)

    if ((count ?? 0) >= MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images per product` }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_RAW_BYTES) {
      return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 })
    }

    let fullBuffer: Buffer
    let thumbBuffer: Buffer
    try {
      const raw = Buffer.from(await file.arrayBuffer())
      const optimized = await optimizeProductImage(raw)
      fullBuffer  = optimized.full.buffer
      thumbBuffer = optimized.thumbnail.buffer
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image processing failed'
      console.error('[images/route] Sharp error:', msg)
      return NextResponse.json({ error: `Image processing failed: ${msg}` }, { status: 400 })
    }

    const token    = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const fullPath = `products/${productId}/${token}.webp`
    const thumbPath= `products/${productId}/${token}-thumb.webp`

    const [uploadFull, uploadThumb] = await Promise.all([
      db.storage.from('media').upload(fullPath,  fullBuffer,  { contentType: 'image/webp' }),
      db.storage.from('media').upload(thumbPath, thumbBuffer, { contentType: 'image/webp' }),
    ])

    if (uploadFull.error) {
      console.error('[images/route] Storage upload error:', uploadFull.error.message)
      return NextResponse.json({ error: `Storage error: ${uploadFull.error.message}` }, { status: 500 })
    }
    // Thumbnail failure is non-fatal — we still proceed with the full image
    const thumbUploadOk = !uploadThumb.error

    const { data: fullUrl  } = db.storage.from('media').getPublicUrl(fullPath)
    const { data: thumbUrl } = db.storage.from('media').getPublicUrl(thumbPath)

    const { data: existing } = await db
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .limit(1)

    const isPrimary = !existing || existing.length === 0

    const { data: orders } = await db
      .from('product_images')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = orders?.[0]?.display_order != null ? orders[0].display_order + 1 : 0

    const { data: image, error: dbError } = await db
      .from('product_images')
      .insert({
        product_id:    productId,
        url:           fullUrl.publicUrl,
        thumbnail_url: thumbUploadOk ? thumbUrl.publicUrl : null,
        alt_text:      null,
        is_primary:    isPrimary,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[images/route] DB insert error:', dbError.message)
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json(image)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[images/route] Unhandled POST error:', msg)
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id]/images?imageId=xxx — remove one image
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: productId } = await params
  const imageId = new URL(request.url).searchParams.get('imageId')
  if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 })

  const db = createAdminClient()
  const { data: img } = await db
    .from('product_images')
    .select('url, thumbnail_url, is_primary')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single()

  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Remove full image and thumbnail from storage in parallel
  const storageKey      = img.url.split('/storage/v1/object/public/media/')[1]
  const thumbStorageKey = img.thumbnail_url?.split('/storage/v1/object/public/media/')[1]

  const removals: Promise<unknown>[] = []
  if (storageKey)      removals.push(db.storage.from('media').remove([storageKey]))
  if (thumbStorageKey) removals.push(db.storage.from('media').remove([thumbStorageKey]))
  await Promise.all(removals)

  await db.from('product_images').delete().eq('id', imageId)

  if (img.is_primary) {
    const { data: next } = await db
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .order('display_order')
      .limit(1)
    if (next?.[0]) {
      await db.from('product_images').update({ is_primary: true }).eq('id', next[0].id)
    }
  }

  return NextResponse.json({ ok: true })
}

// PATCH /api/admin/products/[id]/images — set primary or reorder
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: productId } = await params
  const body = await request.json()
  const db = createAdminClient()

  if (body.setPrimary) {
    await db.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    await db.from('product_images').update({ is_primary: true }).eq('id', body.setPrimary).eq('product_id', productId)
  }

  if (body.reorder && Array.isArray(body.reorder)) {
    await Promise.all(
      body.reorder.map(({ id, display_order }: { id: string; display_order: number }) =>
        db.from('product_images').update({ display_order }).eq('id', id).eq('product_id', productId)
      )
    )
  }

  return NextResponse.json({ ok: true })
}
