import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const updateSchema = z.object({
  name:               z.string().min(1).max(200).optional(),
  slug:               z.string().min(1).max(200).optional(),
  sku:                z.string().max(100).nullable().optional(),
  description:        z.string().max(5000).nullable().optional(),
  seo_title:          z.string().max(200).nullable().optional(),
  seo_desc:           z.string().max(500).nullable().optional(),
  brand_id:           z.string().uuid().nullable().optional(),
  category_id:        z.string().uuid().nullable().optional(),
  model_number:       z.string().max(100).nullable().optional(),
  ac_type:            z.string().max(100).nullable().optional(),
  product_type:       z.string().max(100).nullable().optional(),
  retail_price:       z.number().nonnegative().nullable().optional(),
  trade_price:        z.number().nonnegative().nullable().optional(),
  trade_price_mode:   z.enum(['fixed', 'discount']).nullable().optional(),
  trade_discount_pct: z.number().nonnegative().nullable().optional(),
  currency:           z.string().max(3).optional(),
  availability:       z.enum(['in_stock', 'out_of_stock', 'on_order', 'discontinued']).optional(),
  is_active:          z.boolean().optional(),
  is_featured:        z.boolean().optional(),
  display_order:      z.number().int().optional(),
  // HVAC specs (matching actual DB column names)
  cooling_btu:        z.number().nonnegative().nullable().optional(),
  heating_btu:        z.number().nonnegative().nullable().optional(),
  room_size_min:      z.number().nonnegative().nullable().optional(),
  room_size_max:      z.number().nonnegative().nullable().optional(),
  energy_rating:      z.string().max(10).nullable().optional(),
  seer:               z.number().nonnegative().nullable().optional(),
  scop:               z.number().nonnegative().nullable().optional(),
  wifi_enabled:       z.boolean().nullable().optional(),
  refrigerant:        z.string().max(20).nullable().optional(),
  indoor_noise_db:    z.number().nonnegative().nullable().optional(),
  outdoor_noise_db:   z.number().nonnegative().nullable().optional(),
  voltage:            z.number().nonnegative().nullable().optional(),
  warranty_years:     z.number().int().nonnegative().nullable().optional(),
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
  const { error } = await db.from('products').update(parsed.data).eq('id', id)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  await db.from('products').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
