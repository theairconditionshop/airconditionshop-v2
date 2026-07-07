import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getBrandBySlug, getProducts, getSeriesList } from '@/lib/data/queries'
import { safeJsonLd } from '@/lib/sanitize'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'
import ProductCard from '@/components/products/product-card'
import SeriesCard from '@/components/products/series-card'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'

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

  const [products, series] = await Promise.all([
    getProducts({ brandId: brand.id }),
    getSeriesList({ brandId: brand.id }),
  ])
  const totalItems = products.length + series.length

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
      <Navbar transparent={!!brand.hero_url} />
      <main id="main-content" className={brand.hero_url ? 'min-h-screen' : 'min-h-screen pt-20'}>
        {/* Brand hero — cinematic full-bleed when hero_url is set in admin */}
        {brand.hero_url ? (
          <section className="relative min-h-[56vh] flex items-end overflow-hidden bg-slate-950 pt-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.hero_url} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover z-0" loading="eager" />
            <div aria-hidden className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
              {brand.logo_url && (
                <Reveal mode="fade">
                  <div className="inline-flex items-center justify-center bg-white px-5 py-3 mb-6" style={{ borderRadius: 2 }}>
                    <Image src={brand.logo_url} alt={brand.name} width={120} height={48} className="object-contain h-8 w-auto" />
                  </div>
                </Reveal>
              )}
              <Reveal mode="blur" delay={0.05}>
                <h1 className="font-display text-4xl lg:text-5xl tracking-[-0.02em] text-white leading-[1.05]">{brand.name}</h1>
              </Reveal>
              {brand.description && (
                <Reveal mode="up" delay={0.1}>
                  <p className="mt-4 text-slate-200 leading-relaxed max-w-xl text-lg">{brand.description}</p>
                </Reveal>
              )}
            </div>
          </section>
        ) : null}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/brands' }, { label: brand.name }]} />

          {!brand.hero_url && (
            <div className="flex items-center gap-5 mb-10 border-b border-slate-100 pb-8">
              {brand.logo_url && (
                <Image src={brand.logo_url} alt={brand.name} width={80} height={40} className="object-contain" />
              )}
              <div>
                <Reveal mode="blur">
                  <h1 className="font-display text-4xl lg:text-5xl tracking-[-0.02em] text-slate-900">{brand.name}</h1>
                </Reveal>
                {brand.description && (
                  <Reveal mode="up" delay={0.08}>
                    <p className="mt-3 text-slate-500 leading-relaxed max-w-xl">{brand.description}</p>
                  </Reveal>
                )}
              </div>
            </div>
          )}

          {totalItems > 0 ? (
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" gap={0.05}>
              {series.map(s => <StaggerItem key={s.id}><SeriesCard series={s} userRole={userRole} brandSlug={s.brand?.slug ?? brand.slug} /></StaggerItem>)}
              {products.map(p => <StaggerItem key={p.id}><ProductCard product={p} userRole={userRole} /></StaggerItem>)}
            </Stagger>
          ) : (
            <div className="py-20 text-center border border-slate-100" style={{ borderRadius: 2 }}>
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
