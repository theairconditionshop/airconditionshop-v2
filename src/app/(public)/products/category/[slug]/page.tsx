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
    title: cat.seo_title || cat.name,
    description: cat.seo_desc || cat.description || undefined,
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

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={crumbs} />
          <PageHeader
            eyebrow="Category"
            title={category.name}
            description={category.description || undefined}
          />

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
