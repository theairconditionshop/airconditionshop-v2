import { createClient } from '@/lib/supabase/server'
import type {
  Brand, Category, Product, BlogPost,
  Testimonial, Faq, HomepageSection, SiteSetting,
} from '@/types/database'

// ── Site Settings ────────────────────────────────────────────
export async function getSiteSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('key, value')
  if (!data) return {}
  return Object.fromEntries(data.map(row => [row.key, row.value]))
}

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

// ── Products ──────────────────────────────────────────────────
export async function getProducts(opts?: {
  categoryId?: string
  brandId?: string
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

// ── Blog ──────────────────────────────────────────────────────
export async function getBlogPosts(opts?: {
  category?: string
  limit?: number
  offset?: number
}): Promise<BlogPost[]> {
  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('*, author:profiles(id, full_name, avatar_url)')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (opts?.category) query = query.eq('category', opts.category)
  if (opts?.limit)    query = query.limit(opts.limit)
  if (opts?.offset)   query = query.range(opts.offset, (opts.offset + (opts.limit || 10)) - 1)

  const { data } = await query
  return (data as unknown as BlogPost[]) || []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(id, full_name, avatar_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data as unknown as BlogPost | null
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
