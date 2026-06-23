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
  name:          z.string().min(1).max(200).optional(),
  slug:          z.string().min(1).max(200).optional(),
  description:   z.string().max(5000).nullable().optional(),
  seo_title:     z.string().max(200).nullable().optional(),
  seo_desc:      z.string().max(500).nullable().optional(),
  brand_id:      z.string().uuid().nullable().optional(),
  category_id:   z.string().uuid().nullable().optional(),
  model_number:  z.string().max(100).nullable().optional(),
  price:         z.number().nonnegative().nullable().optional(),
  trade_price:   z.number().nonnegative().nullable().optional(),
  currency:      z.string().max(3).optional(),
  is_active:     z.boolean().optional(),
  is_featured:   z.boolean().optional(),
  sort_order:    z.number().int().optional(),
  stock_status:  z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
  warranty_info: z.string().max(500).nullable().optional(),
  datasheet_url: z.string().max(500).nullable().optional(),
  // HVAC specs
  btu_cooling:           z.number().nonnegative().nullable().optional(),
  btu_heating:           z.number().nonnegative().nullable().optional(),
  cop:                   z.number().nonnegative().nullable().optional(),
  eer:                   z.number().nonnegative().nullable().optional(),
  scop:                  z.number().nonnegative().nullable().optional(),
  seer:                  z.number().nonnegative().nullable().optional(),
  energy_rating:         z.string().max(10).nullable().optional(),
  inverter:              z.boolean().nullable().optional(),
  phase:                 z.number().int().nullable().optional(),
  cooling_capacity_kw:   z.number().nonnegative().nullable().optional(),
  heating_capacity_kw:   z.number().nonnegative().nullable().optional(),
  noise_indoor_db:       z.number().nonnegative().nullable().optional(),
  noise_outdoor_db:      z.number().nonnegative().nullable().optional(),
  refrigerant:           z.string().max(20).nullable().optional(),
  color:                 z.string().max(50).nullable().optional(),
  wifi:                  z.boolean().nullable().optional(),
  has_heat_pump:         z.boolean().nullable().optional(),
  dimensions_indoor:     z.string().max(100).nullable().optional(),
  dimensions_outdoor:    z.string().max(100).nullable().optional(),
  weight_indoor:         z.number().nonnegative().nullable().optional(),
  weight_outdoor:        z.number().nonnegative().nullable().optional(),
  coverage_area_sqm:     z.number().nonnegative().nullable().optional(),
  pipe_length_max_m:     z.number().nonnegative().nullable().optional(),
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
