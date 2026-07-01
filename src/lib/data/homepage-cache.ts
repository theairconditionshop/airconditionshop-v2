/**
 * ISR-safe homepage data fetcher.
 *
 * Uses a direct Supabase anon client (no cookies) so pages calling this
 * do NOT opt into dynamic rendering, allowing revalidate = 60 to work.
 *
 * Do NOT use for auth-protected or user-specific data.
 */
import { unstable_cache } from 'next/cache'
import { getPublicSupabase } from '@/lib/supabase/public'
import type { Brand, Category, Product, Testimonial, Faq, ProductSeries } from '@/types/database'

type HomepageSections = Record<string, Record<string, unknown>>

async function fetchHomepageData() {
  const db = getPublicSupabase()

  const [
    sectionsRes,
    brandsRes,
    categoriesRes,
    productsRes,
    seriesRes,
    testimonialsRes,
    faqsRes,
  ] = await Promise.all([
    db.from('homepage_sections').select('section_key, data'),
    db.from('brands').select('*').eq('is_active', true).order('display_order'),
    db.from('categories').select('*').eq('is_active', true).is('parent_id', null).order('display_order'),
    db.from('products')
      .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order')
      .order('created_at', { ascending: false })
      .limit(8),
    db.from('product_series')
      .select('*, brand:brands(*), variants:product_variants(btu,retail_price,original_price,sale_price,is_active), colours:series_colours(id,name,hex,is_active,display_order), images:series_images(url,thumbnail_url,colour_id,is_primary,display_order)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order')
      .limit(8),
    db.from('testimonials').select('*').eq('is_active', true).order('display_order'),
    db.from('faqs').select('*').eq('is_active', true).order('display_order'),
  ])

  type SectionRow = { section_key: string; data: Record<string, unknown> }
  const sections: HomepageSections = Object.fromEntries(
    ((sectionsRes.data ?? []) as SectionRow[]).map(row => [row.section_key, row.data])
  )

  return {
    sections,
    brands:     (brandsRes.data     ?? []) as Brand[],
    categories: (categoriesRes.data ?? []) as Category[],
    products:   (productsRes.data   ?? []) as unknown as Product[],
    series:     (seriesRes.data     ?? []) as unknown as ProductSeries[],
    testimonials: (testimonialsRes.data ?? []) as Testimonial[],
    faqs:       (faqsRes.data       ?? []) as Faq[],
  }
}

export const getCachedHomepageData = unstable_cache(
  fetchHomepageData,
  ['homepage-data'],
  { revalidate: 60, tags: ['homepage'] }
)
