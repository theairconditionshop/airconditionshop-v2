import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryBySlug, getProducts, getCategories, getSeriesList } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'
import PageHeader from '@/components/shared/page-header'
import ProductCard from '@/components/products/product-card'
import SeriesCard from '@/components/products/series-card'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { BreadcrumbJsonLd } from '@/components/shared/json-ld'
import { safeJsonLd } from '@/lib/sanitize'

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ac_type?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategoryBySlug(slug)
  if (!cat) return {}
  return {
    title: cat.seo_title || `${cat.name} Malta`,
    description: cat.seo_desc || cat.description
      || `Shop ${cat.name} at THE AIRCONDITION SHOP — Malta's HVAC specialist. Supply, installation and after-sales support across the island.`,
    alternates: { canonical: `https://www.theairconditionshop.com/products/category/${slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ac_type } = await searchParams
  const [category, userRole] = await Promise.all([getCategoryBySlug(slug), getRole()])
  if (!category) notFound()

  const [products, subcategories, allSeries] = await Promise.all([
    getProducts({ categoryId: category.id, acType: ac_type }),
    getCategories(category.id),
    getSeriesList({}),
  ])
  // Series in this category (respecting an optional ac_type filter)
  const series = allSeries.filter(s =>
    s.category_id === category.id && (!ac_type || s.ac_type === ac_type)
  )
  const totalItems = products.length + series.length

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(category.parent_id ? [] : []),
    { label: category.name },
  ]

  const BASE = 'https://www.theairconditionshop.com'
  const collectionPageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.seo_desc || category.description || undefined,
    url: `${BASE}/products/category/${slug}`,
    ...(totalItems > 0 ? { mainEntity: { '@type': 'ItemList', numberOfItems: totalItems } } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionPageLd) }} />
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: BASE },
        { name: 'Products', url: `${BASE}/products` },
        { name: category.name, url: `${BASE}/products/category/${slug}` },
      ]} />
      <Navbar transparent={!!category.image_url} />
      <main id="main-content" className={category.image_url ? 'min-h-screen' : 'min-h-screen pt-20'}>
        {category.image_url ? (
          <section className="relative min-h-[42vh] flex items-end overflow-hidden bg-slate-950 pt-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.image_url} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover z-0" loading="eager" />
            <div aria-hidden className="absolute inset-0 z-[1] bg-slate-950/50" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <Reveal mode="up"><p className="text-[11px] font-semibold text-blue-300 uppercase tracking-[0.28em] mb-4">Category</p></Reveal>
              <Reveal mode="blur" delay={0.05}>
                <h1 className="font-display text-4xl lg:text-5xl tracking-[-0.02em] text-white leading-[1.05]">{category.name}</h1>
              </Reveal>
              {category.description && (
                <Reveal mode="up" delay={0.1}>
                  <p className="mt-5 text-slate-200 leading-relaxed max-w-2xl text-lg">{category.description}</p>
                </Reveal>
              )}
            </div>
          </section>
        ) : null}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={crumbs} />
          {!category.image_url && (
            <PageHeader
              eyebrow="Category"
              title={category.name}
              description={category.description || undefined}
            />
          )}

          {subcategories.length > 0 && (
            <Reveal mode="up" delay={0.12} className="mt-8 flex flex-wrap gap-2">
              {subcategories.map(sub => (
                <Link key={sub.id} href={`/products/category/${sub.slug}`}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-900 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-300"
                  style={{ borderRadius: 2 }}>
                  {sub.name}
                </Link>
              ))}
            </Reveal>
          )}

          <div className="mt-10">
            {totalItems > 0 ? (
              <>
                <p className="text-sm text-slate-400 mb-5">{totalItems} product{totalItems !== 1 ? 's' : ''}</p>
                <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" gap={0.05}>
                  {series.map(s => <StaggerItem key={s.id}><SeriesCard series={s} userRole={userRole} brandSlug={s.brand?.slug ?? ''} /></StaggerItem>)}
                  {products.map(p => <StaggerItem key={p.id}><ProductCard product={p} userRole={userRole} /></StaggerItem>)}
                </Stagger>
              </>
            ) : (
              <div className="py-24 text-center border border-slate-100" style={{ borderRadius: 2 }}>
                <p className="text-slate-400">No products in this category yet.</p>
                <Link href="/products" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Browse all products</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
