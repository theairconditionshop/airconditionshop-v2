import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin-guard'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

// GET /api/admin/series/[id] — full series with colours, variants, images
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  const { data, error } = await db
    .from('product_series')
    .select('*, colours:series_colours(*), variants:product_variants(*), images:series_images(*)')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

const colourSchema = z.object({
  id:            z.string().uuid().optional(),
  name:          z.string().min(1),
  slug:          z.string().optional(),
  hex:           z.string().nullable().optional(),
  display_order: z.number().int().optional(),
  is_default:    z.boolean().optional(),
  is_active:     z.boolean().optional(),
})

const variantSchema = z.object({
  id:                 z.string().uuid().optional(),
  colour_slug:        z.string().nullable().optional(), // resolved to colour_id server-side
  btu:                z.number().int().nullable().optional(),
  label:              z.string().nullable().optional(),
  sku:                z.string().nullable().optional(),
  model_indoor:       z.string().nullable().optional(),
  model_outdoor:      z.string().nullable().optional(),
  cooling_btu:        z.number().nullable().optional(),
  heating_btu:        z.number().nullable().optional(),
  cooling_kw_min:     z.number().nullable().optional(),
  cooling_kw_nom:     z.number().nullable().optional(),
  cooling_kw_max:     z.number().nullable().optional(),
  seer:               z.number().nullable().optional(),
  scop:               z.number().nullable().optional(),
  seer_class:         z.string().nullable().optional(),
  scop_class:         z.string().nullable().optional(),
  energy_rating:      z.string().nullable().optional(),
  dimensions_indoor:  z.string().nullable().optional(),
  dimensions_outdoor: z.string().nullable().optional(),
  copper_gas:         z.string().nullable().optional(),
  copper_liquid:      z.string().nullable().optional(),
  refrigerant:        z.string().nullable().optional(),
  voltage:            z.number().nullable().optional(),
  retail_price:       z.number().nullable().optional(),
  original_price:     z.number().nullable().optional(),
  sale_price:         z.number().nullable().optional(),
  cost_price:         z.number().nullable().optional(),
  trade_price:        z.number().nullable().optional(),
  trade_discount_pct: z.number().nullable().optional(),
  trade_price_mode:   z.enum(['fixed', 'discount']).optional(),
  specifications:     z.record(z.string(), z.string()).optional(),
  availability:       z.enum(['in_stock', 'out_of_stock', 'on_order', 'discontinued']).optional(),
  is_active:          z.boolean().optional(),
  display_order:      z.number().int().optional(),
})

const putSchema = z.object({
  series: z.object({
    name:             z.string().min(2),
    slug:             z.string().optional(),
    brand_id:         z.string().uuid().nullable().optional(),
    category_id:      z.string().uuid().nullable().optional(),
    tagline:          z.string().nullable().optional(),
    description:      z.string().nullable().optional(),
    features:         z.array(z.string()).optional(),
    ac_type:          z.string().nullable().optional(),
    shared_specs:     z.record(z.string(), z.string()).optional(),
    warranty_years:   z.number().int().nullable().optional(),
    has_colours:      z.boolean().optional(),
    price_visibility: z.enum(['public', 'trade_only']).optional(),
    seo_title:        z.string().nullable().optional(),
    seo_desc:         z.string().nullable().optional(),
    seo_keywords:     z.string().nullable().optional(),
    is_active:        z.boolean().optional(),
    is_featured:      z.boolean().optional(),
    display_order:    z.number().int().optional(),
  }),
  colours:           z.array(colourSchema).default([]),
  variants:          z.array(variantSchema).default([]),
  deletedColourIds:  z.array(z.string().uuid()).default([]),
  deletedVariantIds: z.array(z.string().uuid()).default([]),
})

// PUT /api/admin/series/[id] — full diff save of series + colours + variants
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { series, colours, variants, deletedColourIds, deletedVariantIds } = parsed.data

  // 1. Update series ------------------------------------------------------
  const seriesUpdate = { ...series, slug: series.slug?.trim() || slugify(series.name) }
  const { error: sErr } = await db.from('product_series').update(seriesUpdate).eq('id', id)
  if (sErr) return NextResponse.json({ error: `Series: ${sErr.message}` }, { status: 400 })

  // 2. Delete removed variants first (FK to colours) ----------------------
  if (deletedVariantIds.length) {
    await db.from('product_variants').delete().in('id', deletedVariantIds)
  }
  if (deletedColourIds.length) {
    await db.from('series_colours').delete().in('id', deletedColourIds)
  }

  // 3. Upsert colours; build slug -> id map -------------------------------
  const slugToColourId = new Map<string, string>()
  for (let i = 0; i < colours.length; i++) {
    const c = colours[i]
    const cslug = c.slug?.trim() || slugify(c.name)
    const row = {
      series_id:     id,
      name:          c.name,
      slug:          cslug,
      hex:           c.hex ?? null,
      display_order: c.display_order ?? i,
      is_default:    c.is_default ?? false,
      is_active:     c.is_active ?? true,
    }
    if (c.id) {
      const { error } = await db.from('series_colours').update(row).eq('id', c.id)
      if (error) return NextResponse.json({ error: `Colour ${c.name}: ${error.message}` }, { status: 400 })
      slugToColourId.set(cslug, c.id)
    } else {
      const { data, error } = await db.from('series_colours').insert(row).select('id').single()
      if (error) return NextResponse.json({ error: `Colour ${c.name}: ${error.message}` }, { status: 400 })
      slugToColourId.set(cslug, data.id)
    }
  }

  // 4. Upsert variants (resolve colour_slug -> colour_id) -----------------
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i]
    const { colour_slug, id: vid, ...rest } = v
    const colour_id = colour_slug ? (slugToColourId.get(colour_slug) ?? null) : null
    const row = {
      ...rest,
      series_id:      id,
      colour_id,
      display_order:  rest.display_order ?? i,
      specifications: rest.specifications ?? {},
    }
    if (vid) {
      const { error } = await db.from('product_variants').update(row).eq('id', vid)
      if (error) return NextResponse.json({ error: `Variant ${v.label ?? v.btu}: ${error.message}` }, { status: 400 })
    } else {
      const { error } = await db.from('product_variants').insert(row)
      if (error) return NextResponse.json({ error: `Variant ${v.label ?? v.btu}: ${error.message}` }, { status: 400 })
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/series/[id] — remove series (cascades colours/variants/images)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  const { error } = await db.from('product_series').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
