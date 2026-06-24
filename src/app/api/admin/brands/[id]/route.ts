import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

const updateSchema = z.object({
  name:              z.string().min(1).max(200).optional(),
  slug:              z.string().min(1).max(200).optional(),
  description:       z.string().max(2000).nullable().optional(),
  seo_title:         z.string().max(200).nullable().optional(),
  seo_desc:          z.string().max(500).nullable().optional(),
  logo_url:          z.string().max(500).nullable().optional(),
  hero_url:          z.string().max(500).nullable().optional(),
  logo_display_mode: z.enum(['invert', 'grayscale', 'normal']).optional(),
  is_active:         z.boolean().optional(),
  display_order:     z.number().int().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db.from('brands').update(parsed.data).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()

  // Fetch brand details before touching anything
  const { data: brand, error: fetchError } = await db
    .from('brands')
    .select('name, logo_url, hero_url')
    .eq('id', id)
    .single()

  if (fetchError || !brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  // Block deletion if products are attached — FK constraint would reject it anyway
  const { count, error: countError } = await db
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', id)

  if (countError) {
    return NextResponse.json({ error: 'Could not check attached products' }, { status: 500 })
  }

  if (count && count > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete "${brand.name}" — ${count} product${count === 1 ? '' : 's'} are assigned to this brand. Deactivate it instead, or reassign those products first.`,
        products_count: count,
        code: 'HAS_PRODUCTS',
      },
      { status: 409 }
    )
  }

  // No products attached — safe to delete
  const { error: deleteError } = await db.from('brands').delete().eq('id', id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  // Remove associated storage files — failures are logged but never block the response
  const storagePaths = [brand.logo_url, brand.hero_url]
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .map(url => url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/)?.[1])
    .filter((path): path is string => path !== undefined)

  if (storagePaths.length > 0) {
    const { error: storageError } = await db.storage.from('media').remove(storagePaths)
    if (storageError) {
      console.error('[brands/delete] Storage cleanup failed for', storagePaths, ':', storageError.message)
    }
  }

  return NextResponse.json({ ok: true })
}
