import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { getPublicSupabase } from '@/lib/supabase/public'
import type {
  Brand, Category, Product,
  Testimonial, Faq, HomepageSection, SiteSetting,
  ProductSeries,
} from '@/types/database'

const SERIES_FULL_SELECT =
  '*, brand:brands(*), category:categories(*), colours:series_colours(*), variants:product_variants(*), images:series_images(*), documents:series_documents(*)'
const SERIES_CARD_SELECT =
  '*, brand:brands(*), variants:product_variants(btu,retail_price,original_price,sale_price,energy_rating,refrigerant,specifications,is_active), colours:series_colours(id,name,hex,is_active,display_order), images:series_images(url,thumbnail_url,colour_id,is_primary,display_order)'

// ── Site Settings ────────────────────────────────────────────
// Public client + unstable_cache: pages calling this stay ISR-eligible.
export const getSiteSettings = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const db = getPublicSupabase()
    const { data } = await db.from('site_settings').select('key, value')
    if (!data) return {}
    type SettingRow = { key: string; value: unknown }
    return Object.fromEntries((data as SettingRow[]).map(row => [row.key, row.value]))
  },
  ['site-settings'],
  { revalidate: 3600, tags: ['site-settings'] }
)

// ── Homepage Sections ─────────────────────────────────────────
export async function getHomepageSection(key: string): Promise<Record<string, unknown>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('homepage_sections')
    .select('data')
    .eq('section_key', key)
    .single()
  return (data?.data as Record<string, unknown>) || {}
}

export async function getAllHomepageSections(): Promise<Record<string, Record<string, unknown>>> {
  const supabase = await createClient()
  const { data } = await supabase.from('homepage_sections').select('section_key, data')
  if (!data) return {}
  return Object.fromEntries(data.map(row => [row.section_key, row.data as Record<string, unknown>]))
}

// ── Brands ────────────────────────────────────────────────────
export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return data || []
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

// ── Categories ────────────────────────────────────────────────
export async function getCategories(parentId?: string | null): Promise<Category[]> {
  const supabase = await createClient()
  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (parentId === null) {
    query = query.is('parent_id', null)
  } else if (parentId) {
    query = query.eq('parent_id', parentId)
  }

  const { data } = await query
  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

// ── Categories with product count (non-empty only) ───────────
export async function getCategoriesWithCount(): Promise<Array<Category & { product_count: number }>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*, products(count), product_series(count)')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('display_order')
  if (!data) return []
  return (data as unknown as Array<Category & { products: [{ count: number }]; product_series: [{ count: number }] }>)
    .map(c => ({ ...c, product_count: (c.products?.[0]?.count ?? 0) + (c.product_series?.[0]?.count ?? 0) }))
    .filter(c => c.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
}

// ── Brands with product count (non-empty only) ────────────────
export async function getBrandsWithCount(): Promise<Array<Brand & { product_count: number }>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*, products(count), product_series(count)')
    .eq('is_active', true)
    .order('display_order')
  if (!data) return []
  return (data as unknown as Array<Brand & { products: [{ count: number }]; product_series: [{ count: number }] }>)
    .map(b => ({ ...b, product_count: (b.products?.[0]?.count ?? 0) + (b.product_series?.[0]?.count ?? 0) }))
    .filter(b => b.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
}

// ── Distinct AC types that have products OR series ───────────
export async function getActiveAcTypes(): Promise<string[]> {
  const supabase = await createClient()
  const [{ data: prod }, { data: ser }] = await Promise.all([
    supabase.from('products').select('ac_type').eq('is_active', true).not('ac_type', 'is', null),
    supabase.from('product_series').select('ac_type').eq('is_active', true).not('ac_type', 'is', null),
  ])
  const unique = [...new Set([
    ...(prod ?? []).map(r => r.ac_type as string),
    ...(ser  ?? []).map(r => r.ac_type as string),
  ])].sort()
  return unique
}

// ── Products ──────────────────────────────────────────────────
export async function getProducts(opts?: {
  categoryId?: string
  brandId?: string
  acType?: string
  featured?: boolean
  search?: string
  limit?: number
  offset?: number
}): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .eq('is_active', true)
    .order('display_order')
    .order('created_at', { ascending: false })

  if (opts?.categoryId) query = query.eq('category_id', opts.categoryId)
  if (opts?.brandId)    query = query.eq('brand_id', opts.brandId)
  if (opts?.acType)     query = query.eq('ac_type', opts.acType)
  if (opts?.featured)   query = query.eq('is_featured', true)
  if (opts?.search)     query = query.ilike('name', `%${opts.search}%`)
  if (opts?.limit)      query = query.limit(opts.limit)
  if (opts?.offset)     query = query.range(opts.offset, (opts.offset + (opts.limit || 20)) - 1)

  const { data } = await query
  return (data as unknown as Product[]) || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*), documents:product_documents(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (data) {
    // Increment view count (fire-and-forget)
    supabase.from('products').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id)
  }

  return data as unknown as Product | null
}

// ── AC Series ─────────────────────────────────────────────────
export async function getSeriesList(opts?: {
  brandId?: string
  featured?: boolean
  limit?: number
}): Promise<ProductSeries[]> {
  const supabase = await createClient()
  let query = supabase
    .from('product_series')
    .select(SERIES_CARD_SELECT)
    .eq('is_active', true)
    .order('display_order')
    .order('created_at', { ascending: false })

  if (opts?.brandId)  query = query.eq('brand_id', opts.brandId)
  if (opts?.featured) query = query.eq('is_featured', true)
  if (opts?.limit)    query = query.limit(opts.limit)

  const { data } = await query
  return (data as unknown as ProductSeries[]) || []
}

/** Full series by brand slug + series slug — used by the public product page. */
export async function getSeriesByBrandAndSlug(
  brandSlug: string,
  seriesSlug: string,
): Promise<ProductSeries | null> {
  const supabase = await createClient()
  const { data: brand } = await supabase
    .from('brands').select('id').eq('slug', brandSlug).single()
  if (!brand) return null

  const { data } = await supabase
    .from('product_series')
    .select(SERIES_FULL_SELECT)
    .eq('brand_id', brand.id)
    .eq('slug', seriesSlug)
    .eq('is_active', true)
    .single()

  if (data) {
    supabase.from('product_series')
      .update({ view_count: ((data as { view_count?: number }).view_count || 0) + 1 })
      .eq('id', (data as { id: string }).id)
      .then(() => {})
  }
  return (data as unknown as ProductSeries | null)
}

// ── AC filter facets (BTU / energy / refrigerant / colour) ────
export interface AcFacets {
  btus: number[]
  energyClasses: string[]
  refrigerants: string[]
  colours: string[]
}
export async function getAcFilterFacets(): Promise<AcFacets> {
  const supabase = await createClient()
  const [{ data: variants }, { data: colours }] = await Promise.all([
    supabase.from('product_variants').select('btu, energy_rating, refrigerant, is_active').eq('is_active', true),
    supabase.from('series_colours').select('name, is_active').eq('is_active', true),
  ])
  const btus = [...new Set((variants ?? []).map(v => v.btu).filter((b): b is number => b != null))].sort((a, b) => a - b)
  const energyClasses = [...new Set((variants ?? []).map(v => v.energy_rating).filter((e): e is string => !!e))].sort()
  const refrigerants  = [...new Set((variants ?? []).map(v => v.refrigerant).filter((r): r is string => !!r))].sort()
  const colourNames   = [...new Set((colours ?? []).map(c => c.name).filter((n): n is string => !!n))].sort()
  return { btus, energyClasses, refrigerants, colours: colourNames }
}

export async function getProductsByBtuRange(minBtu: number, maxBtu: number, limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .eq('is_active', true)
    .not('cooling_btu', 'is', null)
    .gte('cooling_btu', minBtu)
    .lte('cooling_btu', maxBtu)
    .order('display_order')
    .limit(limit)
  return (data as unknown as Product[]) || []
}

// ── Testimonials ──────────────────────────────────────────────
export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return data || []
}

// ── FAQs ──────────────────────────────────────────────────────
export async function getFaqs(category?: string): Promise<Faq[]> {
  const supabase = await createClient()
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (category) query = query.eq('category', category)

  const { data } = await query
  return data || []
}
