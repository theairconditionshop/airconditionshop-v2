import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getSeriesByBrandAndSlug, getSeriesList } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import SeriesProductView from '@/components/products/series-product-view'
import SeriesContentSections from '@/components/products/series-content-sections'
import SeriesCard from '@/components/products/series-card'
import { resolveVariantPrice, shouldHideSeriesPrice } from '@/lib/pricing/variant-resolver'
import { formatPrice } from '@/lib/pricing/resolver'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theairconditionshop.com'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; series: string }> },
): Promise<Metadata> {
  const { slug, series } = await params
  const s = await getSeriesByBrandAndSlug(slug, series)
  if (!s) return { title: 'Product not found' }
  const brand = s.brand?.name ?? ''
  const title = s.seo_title || `${brand} ${s.name} — Air Conditioner | The Aircondition Shop`
  const desc  = s.seo_desc || s.tagline || s.description?.slice(0, 155) ||
    `${brand} ${s.name} wall-mounted air conditioner. Multiple BTU sizes, supply & installation across Malta.`
  const canonical = `${BASE}/products/${slug}/${series}`
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, type: 'website' },
  }
}

export default async function SeriesPage(
  { params }: { params: Promise<{ slug: string; series: string }> },
) {
  const { slug, series } = await params
  const [s, role] = await Promise.all([
    getSeriesByBrandAndSlug(slug, series),
    getRole(),
  ])
  if (!s) notFound()

  // Related: other series from the same brand
  const related = s.brand_id
    ? (await getSeriesList({ brandId: s.brand_id })).filter(r => r.id !== s.id).slice(0, 4)
    : []

  const hidePricing = shouldHideSeriesPrice(s, role)
  const activeVariants = (s.variants ?? []).filter(v => v.is_active)

  // Price range for schema.org (public pricing only)
  const prices = activeVariants
    .map(v => resolveVariantPrice(v, role).price)
    .filter((p): p is number => p != null)
  const lowPrice  = prices.length ? Math.min(...prices) : null
  const highPrice = prices.length ? Math.max(...prices) : null
  const brandName = s.brand?.name ?? ''

  const heroImage = (s.images ?? []).find(i => i.colour_id == null && i.is_primary)
    ?? (s.images ?? []).find(i => i.colour_id == null)
    ?? (s.images ?? [])[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brandName} ${s.name}`,
    description: s.tagline || s.description || undefined,
    brand: brandName ? { '@type': 'Brand', name: brandName } : undefined,
    image: heroImage?.url ? [heroImage.url] : undefined,
    category: 'Air Conditioner',
    ...(lowPrice != null && !hidePricing ? {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice, highPrice,
        offerCount: prices.length,
        availability: 'https://schema.org/InStock',
      },
    } : {}),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Products', item: `${BASE}/products` },
      ...(brandName ? [{ '@type': 'ListItem', position: 2, name: brandName, item: `${BASE}/products?brand=${slug}` }] : []),
      { '@type': 'ListItem', position: brandName ? 3 : 2, name: s.name, item: `${BASE}/products/${slug}/${series}` },
    ],
  }

  return (
    <>
    <Navbar />
    <main id="main-content" className="min-h-screen pt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 flex-wrap" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-slate-700">Products</Link>
        <ChevronRight className="w-3 h-3" />
        {brandName && (
          <>
            <Link href={`/products?brand=${slug}`} className="hover:text-slate-700">{brandName}</Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-slate-700 font-medium">{s.name}</span>
      </nav>

      <SeriesProductView
        series={s}
        role={role}
        hidePricing={hidePricing}
        priceRangeLabel={
          !hidePricing && lowPrice != null
            ? lowPrice === highPrice ? formatPrice(lowPrice) : `${formatPrice(lowPrice)} – ${formatPrice(highPrice!)}`
            : null
        }
      />

      <SeriesContentSections series={s} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold text-slate-900 mb-5">More from {brandName}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {related.map(r => (
              <SeriesCard key={r.id} series={r} userRole={role} brandSlug={r.brand?.slug ?? slug} />
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </div>
    </main>
    <Footer />
    </>
  )
}
