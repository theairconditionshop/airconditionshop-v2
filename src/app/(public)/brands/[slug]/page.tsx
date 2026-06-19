import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getBrandBySlug, getProducts } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'
import ProductCard from '@/components/products/product-card'

export const revalidate = 300

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: brand.seo_title || `${brand.name} Products`,
    description: brand.seo_desc || brand.description || undefined,
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const [brand, userRole] = await Promise.all([getBrandBySlug(slug), getRole()])
  if (!brand) notFound()

  const products = await getProducts({ brandId: brand.id })

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {brand.hero_url && (
          <div className="relative h-48 lg:h-64 bg-slate-900">
            <Image src={brand.hero_url} alt={brand.name} fill className="object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              {brand.logo_url && (
                <Image src={brand.logo_url} alt={brand.name} width={180} height={80} className="object-contain filter brightness-0 invert" />
              )}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/brands' }, { label: brand.name }]} />

          <div className="flex items-center gap-4 mb-8">
            {brand.logo_url && !brand.hero_url && (
              <Image src={brand.logo_url} alt={brand.name} width={80} height={40} className="object-contain" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{brand.name}</h1>
              {brand.description && <p className="mt-1 text-slate-500">{brand.description}</p>}
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} userRole={userRole} />)}
            </div>
          ) : (
            <p className="py-12 text-center text-slate-400">No products available for this brand yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
