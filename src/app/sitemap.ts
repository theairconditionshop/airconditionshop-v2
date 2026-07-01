import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.theairconditionshop.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { data: { slug: string; updated_at: string }[] | null } = { data: [] }
  let categories: typeof products = { data: [] }
  let brands: typeof products = { data: [] }
  let posts: typeof products = { data: [] }
  let series: { data: { slug: string; updated_at: string; brand: { slug: string } | null }[] | null } = { data: [] }

  try {
    const db = createAdminClient()
    ;[products, categories, brands, posts, series] = await Promise.all([
      db.from('products').select('slug, updated_at').eq('is_active', true),
      db.from('categories').select('slug, updated_at').eq('is_active', true),
      db.from('brands').select('slug, updated_at').eq('is_active', true),
      db.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
      db.from('product_series').select('slug, updated_at, brand:brands(slug)').eq('is_active', true) as unknown as typeof series,
    ])
  } catch {
    // env vars not available at build time — return static routes only
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/products`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/brands`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/services`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/trade`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/quote`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/contact`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/btu-calculator`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/campaigns`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/legal/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/legal/terms`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = (products.data ?? []).map(p => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = (categories.data ?? []).map(c => ({
    url: `${BASE}/products/category/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const brandRoutes: MetadataRoute.Sitemap = (brands.data ?? []).map(b => ({
    url: `${BASE}/brands/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const blogRoutes: MetadataRoute.Sitemap = (posts.data ?? []).map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // AC series — one canonical URL per series (no per-BTU duplication)
  const seriesRoutes: MetadataRoute.Sitemap = (series.data ?? [])
    .filter(s => s.brand?.slug)
    .map(s => ({
      url: `${BASE}/products/${s.brand!.slug}/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes, ...blogRoutes, ...seriesRoutes]
}
