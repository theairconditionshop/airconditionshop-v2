import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  name:               z.string().min(2),
  slug:               z.string().min(2),
  sku:                z.string().optional(),
  description:        z.string().optional(),
  retail_price:       z.number().optional(),
  original_price:     z.number().nonnegative().nullable().optional(),
  sale_price:         z.number().nonnegative().nullable().optional(),
  category_id:        z.string().optional(),
  brand_id:           z.string().optional(),
  ac_type:            z.string().max(100).nullable().optional(),
  product_type:       z.string().max(100).nullable().optional(),
  availability:       z.enum(['in_stock', 'out_of_stock', 'on_order', 'discontinued']).default('in_stock'),
  trade_price_mode:   z.enum(['fixed', 'discount']).optional(),
  trade_price:        z.number().optional(),
  trade_discount_pct: z.number().optional(),
  is_active:          z.boolean().default(true),
  is_featured:        z.boolean().default(false),
  cooling_btu:        z.number().optional(),
  heating_btu:        z.number().optional(),
  room_size_min:      z.number().optional(),
  room_size_max:      z.number().optional(),
  energy_rating:      z.string().optional(),
  seer:               z.number().optional(),
  scop:               z.number().optional(),
  wifi_enabled:       z.boolean().optional(),
  refrigerant:        z.string().optional(),
  indoor_noise_db:    z.number().optional(),
  outdoor_noise_db:   z.number().optional(),
  voltage:            z.number().optional(),
  warranty_years:     z.number().optional(),
})

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const data = schema.parse(body)
  const db = createAdminClient()
  const slug = data.slug || slugify(data.name)
  const { data: product, error } = await db.from('products').insert({ ...data, slug }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: product.id })
}
