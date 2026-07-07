import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { slugify } from '@/lib/utils'

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

/**
 * Duplicates a product (and its images) into a new draft row — the fast path
 * for entering families of near-identical accessories (e.g. the same
 * trunking part in a different size). The copy is created inactive so it
 * never goes live before the content manager edits and reviews it.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()

  const { data: original, error: fetchError } = await db.from('products').select('*').eq('id', id).single()
  if (fetchError || !original) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, slug: _slug, view_count: _viewCount, ...rest } = original
  void _id; void _createdAt; void _updatedAt; void _slug; void _viewCount

  const baseSlug = slugify(`${original.name}-copy`)
  let slug = baseSlug
  for (let i = 2; i <= 20; i++) {
    const { data: clash } = await db.from('products').select('id').eq('slug', slug).maybeSingle()
    if (!clash) break
    slug = `${baseSlug}-${i}`
  }

  const { data: copy, error: insertError } = await db
    .from('products')
    .insert({ ...rest, name: `${original.name} (Copy)`, slug, is_active: false, is_featured: false })
    .select('id')
    .single()
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

  const { data: images } = await db.from('product_images').select('*').eq('product_id', id).order('display_order')
  if (images && images.length > 0) {
    const rows = images.map(img => ({
      product_id:     copy.id,
      url:            img.url,
      thumbnail_url:  img.thumbnail_url,
      alt_text:       img.alt_text,
      is_primary:     img.is_primary,
      display_order:  img.display_order,
    }))
    await db.from('product_images').insert(rows)
  }

  return NextResponse.json({ id: copy.id })
}
