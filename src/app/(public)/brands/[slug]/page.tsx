import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getBrandBySlug, getProducts } from '@/lib/data/queries'
import { safeJsonLd } from '@/lib/sanitize'
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

  const title       = brand.seo_title || `${brand.name} Products Malta | THE AIRCONDITION SHOP`
  const description = brand.seo_desc  || brand.description || `Explore ${brand.name} products available from THE AIRCONDITION SHOP Malta.`
  const ogImage     = brand.hero_url  || brand.logo_url    || undefined

  return {
    title,
    description,
    alternates: { canonical: `https://www.theairconditionshop.com/brands/${slug}` },
    openGraph: {
      title,
      description,
      url:      `https://theairconditionshop.com/brands/${slug}`,
      siteName: 'THE AIRCONDITION SHOP',
      ...(ogImage ? { images: [{ url: ogImage, alt: brand.name }] } : {}),
    },
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const [brand, userRole] = await Promise.all([getBrandBySlug(slug), getRole()])
  if (!brand) notFound()

  const products = await getProducts({ brandId: brand.id })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',   item: 'https://theairconditionshop.com' },
          { '@type': 'ListItem', position: 2, name: 'Brands', item: 'https://theairconditionshop.com/brands' },
          { '@type': 'ListItem', position: 3, name: brand.name, item: `https://theairconditionshop.com/brands/${brand.slug}` },
        ],
      },
      {
        '@type': 'Brand',
        name: brand.name,
        url:  `https://theairconditionshop.com/brands/${brand.slug}`,
        ...(brand.logo_url   ? { logo: brand.logo_url }         : {}),
        ...(brand.description ? { description: brand.description } : {}),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
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
            <div className="py-16 text-center">
              <p className="text-slate-500 font-medium mb-2">Products being added</p>
              <p className="text-slate-400 text-sm mb-5">Our full range isn&apos;t listed online yet. Call or message us — we can quote any model from this brand.</p>
              <a href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Contact us to enquire →</a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
