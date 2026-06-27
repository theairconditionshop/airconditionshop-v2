import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryBySlug, getProducts, getCategories } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'
import PageHeader from '@/components/shared/page-header'
import ProductCard from '@/components/products/product-card'

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

  const [products, subcategories] = await Promise.all([
    getProducts({ categoryId: category.id, acType: ac_type }),
    getCategories(category.id),
  ])

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(category.parent_id ? [] : []),
    { label: category.name },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={crumbs} />
          <PageHeader
            eyebrow="Category"
            title={category.name}
            description={category.description || undefined}
          />

          {subcategories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {subcategories.map(sub => (
                <Link key={sub.id} href={`/products/category/${sub.slug}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-full text-sm text-slate-600 hover:text-sky-700 transition-colors">
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            {products.length > 0 ? (
              <>
                <p className="text-sm text-slate-400 mb-5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map(p => <ProductCard key={p.id} product={p} userRole={userRole} />)}
                </div>
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-400">No products in this category yet.</p>
                <Link href="/products" className="mt-3 inline-block text-sky-600 text-sm hover:underline">Browse all products</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
