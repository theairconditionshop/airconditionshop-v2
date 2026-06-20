import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_IMAGES = 6

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

// POST /api/admin/products/[id]/images — upload one image
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: productId } = await params

  const db = createAdminClient()

  // Check current image count
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

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const ext    = file.type.split('/')[1].replace('jpeg', 'jpg')
  const path   = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes  = await file.arrayBuffer()

  const { error: storageError } = await db.storage
    .from('media')
    .upload(path, Buffer.from(bytes), { contentType: file.type })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { data: urlData } = db.storage.from('media').getPublicUrl(path)

  // First image becomes primary
  const { data: existing } = await db
    .from('product_images')
    .select('id')
    .eq('product_id', productId)
    .limit(1)

  const isPrimary = !existing || existing.length === 0

  // Get max display_order
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
      url:           urlData.publicUrl,
      alt_text:      null,
      is_primary:    isPrimary,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json(image)
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
    .select('url, is_primary')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single()

  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Remove from storage
  const storageKey = img.url.split('/storage/v1/object/public/media/')[1]
  if (storageKey) {
    await db.storage.from('media').remove([storageKey])
  }

  await db.from('product_images').delete().eq('id', imageId)

  // If deleted image was primary, promote the next one
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
    // Unset all, then set one
    await db.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    await db.from('product_images').update({ is_primary: true }).eq('id', body.setPrimary).eq('product_id', productId)
  }

  if (body.reorder && Array.isArray(body.reorder)) {
    // body.reorder = [{ id, display_order }]
    await Promise.all(
      body.reorder.map(({ id, display_order }: { id: string; display_order: number }) =>
        db.from('product_images').update({ display_order }).eq('id', id).eq('product_id', productId)
      )
    )
  }

  return NextResponse.json({ ok: true })
}
