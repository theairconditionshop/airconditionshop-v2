import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, CheckCircle2, ArrowRight, Phone } from 'lucide-react'
import { getProductBySlug, getProducts } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import { resolvePrice, formatPrice } from '@/lib/pricing/resolver'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'
import ProductCard from '@/components/products/product-card'
import ProductGallery from '@/components/products/product-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/shared/json-ld'

export const revalidate = 300

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.seo_title || product.name,
    description: product.seo_desc || product.description?.slice(0, 160) || undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, userRole] = await Promise.all([getProductBySlug(slug), getRole()])

  if (!product) notFound()

  const priceResult = resolvePrice(product, userRole)
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  const related = await getProducts({ categoryId: product.category_id || undefined, limit: 4 })
  const relatedFiltered = related.filter(p => p.id !== product.id).slice(0, 4)

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(product.category ? [{ label: product.category.name, href: `/products/category/${product.category.slug}` }] : []),
    { label: product.name },
  ]

  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theairconditionshop.com'

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.description ?? undefined}
        image={primaryImage?.url}
        price={priceResult.price ?? undefined}
        sku={product.sku ?? undefined}
        brand={product.brand?.name}
        availability={product.availability === 'out_of_stock' ? 'OutOfStock' : 'InStock'}
        url={`${BASE}/products/${product.slug}`}
      />
      <BreadcrumbJsonLd items={crumbs.map(c => ({ name: c.label, url: `${BASE}${c.href}` }))} />
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={crumbs} />

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Interactive gallery */}
            <div>
              <ProductGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Info */}
            <div>
              {product.brand && (
                <Link href={`/brands/${product.brand.slug}`} className="text-sm font-semibold text-sky-600 hover:underline">
                  {product.brand.name}
                </Link>
              )}
              <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>
              {product.model_number && (
                <p className="mt-1 text-sm text-slate-400">Model: {product.model_number}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {product.energy_rating && <Badge variant="success">{product.energy_rating} Energy Rating</Badge>}
                {product.btu_value && <Badge variant="secondary">{product.btu_value.toLocaleString()} BTU</Badge>}
                {product.coverage_m2 && <Badge variant="secondary">Up to {product.coverage_m2}m²</Badge>}
                <Badge variant={product.availability === 'in_stock' ? 'success' : 'warning'} className="capitalize">
                  {product.availability.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Price */}
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl">
                {priceResult.price != null ? (
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{formatPrice(priceResult.price, product.currency)}</p>
                    {priceResult.isTrade && (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="trade">{priceResult.label}</Badge>
                        {priceResult.discountPct && (
                          <span className="text-xs text-slate-500">{priceResult.discountPct}% off retail</span>
                        )}
                      </div>
                    )}
                    {!priceResult.isTrade && (
                      <p className="mt-1 text-xs text-slate-400">Price excl. installation. Contact for trade pricing.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-slate-700">Contact for pricing</p>
                    <p className="text-sm text-slate-400 mt-0.5">Call or email us for a quote</p>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link href={`/quote?product=${product.id}`} className="flex-1">
                  <Button variant="brand" size="lg" className="w-full gap-2">
                    Request a Quote <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="tel:+35679661889" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <Phone className="w-4 h-4" /> +356 7966 1889
                  </Button>
                </a>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-6">
                  <h2 className="font-semibold text-slate-900 mb-2">Description</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Features */}
              {product.features?.length > 0 && (
                <div className="mt-5">
                  <h2 className="font-semibold text-slate-900 mb-3">Key Features</h2>
                  <ul className="space-y-2">
                    {(product.features as string[]).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Specs table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-14">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-100 rounded-xl overflow-hidden text-sm">
                  <tbody>
                    {Object.entries(product.specifications as Record<string, string>).map(([key, val], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="px-5 py-3 font-medium text-slate-700 w-1/3">{key}</td>
                        <td className="px-5 py-3 text-slate-500">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Documents */}
          {product.documents && product.documents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Downloads</h2>
              <div className="flex flex-wrap gap-3">
                {product.documents.map(doc => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-700 transition-colors">
                    <Download className="w-4 h-4" />
                    {doc.name}
                    {doc.file_size && <span className="text-xs text-slate-400">({Math.round(doc.file_size / 1024)}KB)</span>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related products */}
          {relatedFiltered.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedFiltered.map(p => (
                  <ProductCard key={p.id} product={p} userRole={userRole} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
