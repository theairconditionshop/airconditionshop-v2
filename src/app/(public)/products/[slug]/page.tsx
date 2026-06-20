import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Download, CheckCircle2, ArrowRight, Phone,
  Zap, Thermometer, Ruler, Wifi, Wind, Droplets, Volume2,
  Bolt, ShieldCheck,
} from 'lucide-react'
import { getProductBySlug, getProducts, getProductsByBtuRange } from '@/lib/data/queries'
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
  const product  = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.seo_title || product.name,
    description: product.seo_desc || product.description?.slice(0, 160) || undefined,
  }
}

// HVAC spec card definition
interface SpecCard {
  icon: React.ElementType
  label: string
  value: string | number | boolean | null | undefined
  unit?: string
  accent?: string
}

function HvacSpecCard({ icon: Icon, label, value, unit, accent = 'sky' }: SpecCard) {
  if (value == null || value === '') return null
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-sky-200 hover:shadow-sm transition-all duration-200">
      <div className={`w-9 h-9 rounded-xl bg-${accent}-50 flex items-center justify-center mb-3`}>
        <Icon aria-hidden="true" className={`w-4.5 h-4.5 text-${accent}-600`} />
      </div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-base font-bold text-slate-900">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, userRole] = await Promise.all([getProductBySlug(slug), getRole()])
  if (!product) notFound()

  const priceResult  = resolvePrice(product, userRole)
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  // Related: prefer BTU-matched, fall back to category
  const hasBtu = product.cooling_btu != null
  const relatedPromise = hasBtu
    ? getProductsByBtuRange(
        Math.round(product.cooling_btu! * 0.7),
        Math.round(product.cooling_btu! * 1.3),
        5,
      )
    : getProducts({ categoryId: product.category_id || undefined, limit: 5 })
  const related         = await relatedPromise
  const relatedFiltered = related.filter(p => p.id !== product.id).slice(0, 4)

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(product.category ? [{ label: product.category.name, href: `/products/category/${product.category.slug}` }] : []),
    { label: product.name },
  ]

  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theairconditionshop.com'

  // Build HVAC spec card array
  const hvacSpecs: SpecCard[] = [
    { icon: Zap,        label: 'Cooling Capacity', value: product.cooling_btu, unit: 'BTU/hr', accent: 'sky' },
    { icon: Thermometer,label: 'Heating Capacity', value: product.heating_btu, unit: 'BTU/hr', accent: 'orange' },
    { icon: Ruler,      label: 'Room Size',
      value: (product.room_size_min && product.room_size_max)
        ? `${product.room_size_min}–${product.room_size_max}`
        : product.room_size_max ?? null,
      unit: 'm²', accent: 'green' },
    { icon: Zap,        label: 'SEER Rating',      value: product.seer,            accent: 'emerald' },
    { icon: Thermometer,label: 'SCOP Rating',      value: product.scop,            accent: 'blue' },
    { icon: Wifi,       label: 'Wi-Fi Control',    value: product.wifi_enabled,    accent: 'violet' },
    { icon: Droplets,   label: 'Refrigerant',      value: product.refrigerant,     accent: 'cyan' },
    { icon: Volume2,    label: 'Indoor Noise',     value: product.indoor_noise_db, unit: 'dB', accent: 'slate' },
    { icon: Wind,       label: 'Outdoor Noise',    value: product.outdoor_noise_db,unit: 'dB', accent: 'slate' },
    { icon: Bolt,       label: 'Voltage',          value: product.voltage,         unit: 'V',  accent: 'yellow' },
    { icon: ShieldCheck,label: 'Warranty',         value: product.warranty_years,  unit: product.warranty_years === 1 ? 'year' : 'years', accent: 'green' },
  ].filter(s => s.value != null && s.value !== '')

  const hasHvacSpecs = hvacSpecs.length > 0
  const hasLegacySpecs = product.specifications &&
    typeof product.specifications === 'object' &&
    !Array.isArray(product.specifications) &&
    Object.keys(product.specifications).length > 0

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
      <BreadcrumbJsonLd items={crumbs.map(c => ({ name: c.label, url: `${BASE}${c.href || '/'}` }))} />
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={crumbs} />

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <ProductGallery images={product.images || []} productName={product.name} />

            {/* Info */}
            <div>
              {product.brand && (
                <Link href={`/brands/${product.brand.slug}`}
                  className="text-sm font-semibold text-sky-600 hover:underline">
                  {product.brand.name}
                </Link>
              )}
              <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              {product.model_number && (
                <p className="mt-1 text-sm text-slate-400">Model: {product.model_number}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {product.energy_rating && <Badge variant="success">{product.energy_rating} Energy Rating</Badge>}
                {product.cooling_btu && <Badge variant="secondary">{product.cooling_btu.toLocaleString()} BTU</Badge>}
                {product.coverage_m2 && <Badge variant="secondary">Up to {product.coverage_m2}m²</Badge>}
                {product.wifi_enabled && <Badge variant="secondary">Wi-Fi</Badge>}
                <Badge variant={product.availability === 'in_stock' ? 'success' : 'warning'} className="capitalize">
                  {product.availability.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Price */}
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl">
                {priceResult.price != null ? (
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{formatPrice(priceResult.price, product.currency)}</p>
                    {priceResult.isTrade ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="trade">{priceResult.label}</Badge>
                        {priceResult.discountPct && (
                          <span className="text-xs text-slate-500">{priceResult.discountPct}% off retail</span>
                        )}
                      </div>
                    ) : (
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
              {Array.isArray(product.features) && product.features.length > 0 && (
                <div className="mt-5">
                  <h2 className="font-semibold text-slate-900 mb-3">Key Features</h2>
                  <ul className="space-y-2">
                    {(product.features as string[]).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* HVAC Spec Cards */}
          {hasHvacSpecs && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">System Specifications</h2>
              <p className="text-sm text-slate-500 mb-6">Performance data and technical details for this unit</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {hvacSpecs.map((spec, i) => (
                  <HvacSpecCard key={i} {...spec} />
                ))}
              </div>
            </div>
          )}

          {/* Legacy specs table fallback */}
          {!hasHvacSpecs && hasLegacySpecs && (
            <div className="mt-14">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
              <div className="overflow-x-auto">
                <table aria-label="Technical specifications" className="w-full border border-slate-100 rounded-xl overflow-hidden text-sm">
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

          {/* Downloads */}
          {product.documents && product.documents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Downloads</h2>
              <div className="flex flex-wrap gap-3">
                {product.documents.map(doc => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <Download aria-hidden="true" className="w-4 h-4" />
                    {doc.name}
                    {doc.file_size && <span className="text-xs text-slate-400">({Math.round(doc.file_size / 1024)}KB)</span>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related / BTU-matched products */}
          {relatedFiltered.length > 0 && (
            <div className="mt-16">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {hasBtu ? 'Similar Systems For Your Space' : 'Related Products'}
                  </h2>
                  {hasBtu && (
                    <p className="text-sm text-slate-500 mt-1">
                      Systems with a similar BTU output — comparable cooling power
                    </p>
                  )}
                </div>
                <Link href="/products" className="text-sm text-sky-600 hover:text-sky-700 font-medium shrink-0">
                  View all →
                </Link>
              </div>
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
