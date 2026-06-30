import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import type { ParsedProduct } from '@/services/ai/gemini-product-parser'
import { normaliseBrand } from './brand-normaliser'
import { normaliseCategory } from './category-normaliser'

interface ExecuteRowOpts {
  importId:                string
  rowId:                   string
  parsed:                  ParsedProduct
  action:                  'create' | 'update'
  matchedProductId:        string | null
  replaceExisting:         boolean
  pdfType:                 'catalogue' | 'price_list'
  normalisedBrand?:        string | null
  normalisedCategory?:     string | null
  defaultPriceVisibility?: 'public' | 'trade_only'
}

export async function executeImportRow(opts: ExecuteRowOpts): Promise<void> {
  const db = createAdminClient()

  try {
    if (opts.action === 'update' && opts.matchedProductId) {
      if (opts.pdfType === 'price_list') {
        await performPriceUpdate(db, opts)
      } else {
        await performCatalogueUpdate(db, opts)
      }
    } else if (opts.action === 'create') {
      await performCreate(db, opts)
    }

    await db.from('product_import_rows').update({ action: opts.action }).eq('id', opts.rowId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await db.from('product_import_rows')
      .update({ action: 'failed', error_message: msg })
      .eq('id', opts.rowId)
    throw err
  }
}

// Phase 6: Price list — ONLY update pricing fields, never overwrite catalogue data
async function performPriceUpdate(
  db: ReturnType<typeof createAdminClient>,
  opts: ExecuteRowOpts,
) {
  const p  = opts.parsed
  const up: Record<string, unknown> = {
    last_import_source: `import:${opts.importId}`,
    last_import_at:     new Date().toISOString(),
  }
  // p.original_price takes precedence; p.price is the fallback from AI parser
  const priceVal = p.original_price ?? p.price
  if (priceVal != null) up.original_price = priceVal
  if (p.sale_price != null)     up.sale_price    = p.sale_price
  if (p.cost_price != null)     up.cost_price    = p.cost_price
  // availability defaults to in_stock when a price list provides data for a product
  up.availability = 'in_stock'
  await db.from('products').update(up).eq('id', opts.matchedProductId!)
}

// Phase 7: Catalogue — only update missing/empty fields; never overwrite manually_edited
async function performCatalogueUpdate(
  db: ReturnType<typeof createAdminClient>,
  opts: ExecuteRowOpts,
) {
  const p = opts.parsed

  const { data: existing } = await db
    .from('products')
    .select('description, model_number, sku, specifications, features, original_price, manually_edited, ac_type, product_type, cooling_btu')
    .eq('id', opts.matchedProductId!)
    .single()

  if (!existing) throw new Error('Matched product not found')
  if (existing.manually_edited && !opts.replaceExisting) return

  const merge = (current: unknown, next: unknown) =>
    opts.replaceExisting || current == null || (Array.isArray(current) && (current as unknown[]).length === 0)
      ? (next ?? current)
      : current

  const up: Record<string, unknown> = {
    last_import_source: `import:${opts.importId}`,
    last_import_at:     new Date().toISOString(),
  }

  if (p.description)                                             up.description   = merge(existing.description,  p.description)
  if (p.model)                                                   up.model_number  = merge(existing.model_number, p.model)
  if (p.sku)                                                     up.sku           = merge(existing.sku,          p.sku)
  if (p.specifications && Object.keys(p.specifications).length)  up.specifications = merge(existing.specifications, p.specifications)
  if (p.features?.length)                                        up.features      = merge(existing.features,     p.features)
  if (p.price != null)                                           up.original_price = merge(existing.original_price, p.price)
  // HVAC attributes — only fill if missing
  if (p.ac_type && !existing.ac_type)                            up.ac_type       = p.ac_type
  if (p.product_type && !existing.product_type)                  up.product_type  = p.product_type
  if (p.btu && !existing.cooling_btu)                            up.cooling_btu   = p.btu

  await db.from('products').update(up).eq('id', opts.matchedProductId!)
}

async function performCreate(
  db: ReturnType<typeof createAdminClient>,
  opts: ExecuteRowOpts,
) {
  const p = opts.parsed

  // Resolve brand — prefer normalised canonical name
  const brandName    = opts.normalisedBrand ?? p.brand
  const categoryName = opts.normalisedCategory ?? p.category

  const nb = normaliseBrand(brandName)
  const nc = normaliseCategory(categoryName)

  // Never auto-create unknown brands or categories — those must have been reviewed
  const brand_id    = nb.known  ? await resolveOrCreate(db, 'brands',     nb.canonical)  : null
  const category_id = nc.known  ? await resolveOrCreate(db, 'categories', nc.canonical) : null

  const baseSlug = slugify(p.name)
  const slug     = `${baseSlug}-${Date.now().toString(36)}`

  await db.from('products').insert({
    name:               p.name,
    slug,
    model_number:       p.model    ?? null,
    sku:                p.sku      ?? null,
    description:        p.description ?? null,
    specifications:     p.specifications ?? {},
    features:           p.features ?? [],
    original_price:     p.original_price ?? p.price ?? null,
    sale_price:         p.sale_price     ?? null,
    cost_price:         p.cost_price     ?? null,
    brand_id,
    category_id,
    ac_type:            p.ac_type  ?? null,
    product_type:       p.product_type ?? null,
    price_visibility:   opts.defaultPriceVisibility ?? 'trade_only',
    cooling_btu:        p.btu      ?? null,
    is_active:          true,
    availability:       'in_stock',
    last_import_source: `import:${opts.importId}`,
    last_import_at:     new Date().toISOString(),
  })
}

async function resolveOrCreate(
  db: ReturnType<typeof createAdminClient>,
  table: 'brands' | 'categories',
  name: string | null,
): Promise<string | null> {
  if (!name?.trim()) return null

  // Try to find existing row first
  const { data: existing } = await db
    .from(table)
    .select('id')
    .ilike('name', name.trim())
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  // Upsert on slug to handle the parallel-batch race condition where two rows
  // for the same brand/category execute simultaneously — the second writer just
  // gets back the id the first writer already inserted.
  const slug = slugify(name)
  const { data: upserted } = await db
    .from(table)
    .upsert(
      { name: name.trim(), slug, is_active: true },
      { onConflict: 'slug', ignoreDuplicates: false },
    )
    .select('id')
    .maybeSingle()

  if (upserted) return upserted.id

  // Final fallback: another concurrent writer won the upsert — just select their row
  const { data: fallback } = await db
    .from(table)
    .select('id')
    .ilike('name', name.trim())
    .limit(1)
    .maybeSingle()

  return fallback?.id ?? null
}
