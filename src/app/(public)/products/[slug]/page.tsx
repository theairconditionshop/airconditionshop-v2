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
import { resolvePrice, formatPrice, shouldHidePrice } from '@/lib/pricing/resolver'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'
import ProductCard from '@/components/products/product-card'
import ProductGallery from '@/components/products/product-gallery'
import InstallationOffer from '@/components/products/installation-offer'
import DeliveryInfo from '@/components/products/delivery-info'
import TradePricingCta from '@/components/products/trade-pricing-cta'
import ViewTracker from '@/components/products/view-tracker'
import RecentlyViewed from '@/components/products/recently-viewed'
import QuoteReminder from '@/components/products/quote-reminder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/shared/json-ld'

export const revalidate = 300

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product  = await getProductBySlug(slug)
  if (!product) return {}
  const acTypePart = product.ac_type ? ` | ${product.ac_type}` : ''
  return {
    title: product.seo_title || product.name,
    description: product.seo_desc || `${product.description?.slice(0, 130) || product.name}${acTypePart}` || undefined,
    alternates: { canonical: `https://www.theairconditionshop.com/products/${slug}` },
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

function HvacSpecCard({ icon: Icon, label, value, unit, accent = 'blue' }: SpecCard) {
  if (value == null || value === '') return null
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
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
  const hidePricing  = shouldHidePrice(product, userRole)
  // True AC units have an ac_type or a product_type that isn't an accessory
  const isAcUnit     = !!product.ac_type || (product.product_type != null && product.product_type !== 'installation_material')

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
    { icon: Zap,        label: 'Cooling Capacity', value: product.cooling_btu, unit: 'BTU/hr', accent: 'blue' },
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

  // Split specifications into primitive key-value pairs and variants array
  const rawSpecs = (product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications))
    ? product.specifications as Record<string, unknown>
    : null
  const specVariants: Array<Record<string, unknown>> = Array.isArray(rawSpecs?.variants) ? rawSpecs!.variants as Array<Record<string, unknown>> : []
  const specPrimitives: [string, string][] = rawSpecs
    ? Object.entries(rawSpecs)
        .filter(([k, v]) => k !== 'variants' && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') && v !== '')
        .map(([k, v]) => [k, String(v)])
    : []
  const hasLegacySpecs = specPrimitives.length > 0 || specVariants.length > 0

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.description ?? undefined}
        image={primaryImage?.url}
        price={hidePricing ? undefined : (priceResult.price ?? undefined)}
        sku={product.sku ?? undefined}
        brand={product.brand?.name}
        availability={product.availability === 'out_of_stock' ? 'OutOfStock' : 'InStock'}
        url={`${BASE}/products/${product.slug}`}
        acType={product.ac_type ?? undefined}
      />
      <BreadcrumbJsonLd items={crumbs.map(c => ({ name: c.label, url: `${BASE}${c.href || '/'}` }))} />
      <Navbar />
      <main id="main-content" className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={crumbs} />

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <ProductGallery images={product.images || []} productName={product.name} />

            {/* Info */}
            <div>
              {/* Brand wordmark */}
              {product.brand && (
                <Link href={`/brands/${product.brand.slug}`}
                  className="inline-flex items-center gap-2.5 mb-3 group">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] group-hover:text-blue-500 transition-colors">
                    {product.brand.name}
                  </span>
                  {product.brand.logo_url && (
                    <img
                      src={product.brand.logo_url}
                      alt={product.brand.name}
                      className="h-6 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </Link>
              )}

              <h1 className="font-display text-2xl lg:text-3xl text-slate-900 leading-tight">
                {product.name}
              </h1>
              {product.model_number && (
                <p className="mt-1 text-sm text-slate-400">Model: {product.model_number}</p>
              )}

              {/* Quick spec row */}
              {(product.brand || product.ac_type || product.cooling_btu || (!hidePricing && priceResult.price != null) || product.availability) && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {product.brand && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 uppercase tracking-wide font-semibold">Brand</span>
                      <span className="text-slate-700 font-medium">{product.brand.name}</span>
                    </div>
                  )}
                  {product.ac_type && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 uppercase tracking-wide font-semibold">AC Type</span>
                      <span className="text-slate-700 font-medium">{product.ac_type}</span>
                    </div>
                  )}
                  {product.cooling_btu && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 uppercase tracking-wide font-semibold">BTU Capacity</span>
                      <span className="text-slate-700 font-medium">{product.cooling_btu.toLocaleString()} BTU</span>
                    </div>
                  )}
                  {!hidePricing && priceResult.price != null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 uppercase tracking-wide font-semibold">Price</span>
                      <span className="text-slate-700 font-medium">{formatPrice(priceResult.price, product.currency)}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 uppercase tracking-wide font-semibold">Availability</span>
                    <span className="text-slate-700 font-medium capitalize">{product.availability.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              )}

              {/* Trust badges row */}
              <div className="mt-4 flex flex-wrap gap-2">
                {product.energy_rating && <Badge variant="success">{product.energy_rating} Energy Rating</Badge>}
                {product.cooling_btu && <Badge variant="secondary">{product.cooling_btu.toLocaleString()} BTU</Badge>}
                {product.coverage_m2 && <Badge variant="secondary">Up to {product.coverage_m2}m²</Badge>}
                {product.wifi_enabled && <Badge variant="secondary">Wi-Fi</Badge>}
                {product.warranty_years && product.warranty_years > 0 && (
                  <Badge variant="secondary">
                    {product.warranty_years}-Year Warranty
                  </Badge>
                )}
                <Badge variant={product.availability === 'in_stock' ? 'success' : 'warning'} className="capitalize">
                  {product.availability.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Installation available strip — AC units only */}
              {isAcUnit && (
                <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 w-fit">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-medium text-blue-800">Professional installation available across Malta</span>
                </div>
              )}

              {/* Price / Trade CTA */}
              {hidePricing ? (
                <TradePricingCta variant="panel" />
              ) : (
                <div className="mt-6 p-5 bg-slate-50 rounded-2xl">
                  {priceResult.price != null ? (
                    <div>
                      {priceResult.originalPrice != null && (
                        <p className="text-base text-slate-400 line-through leading-none mb-1">
                          {formatPrice(priceResult.originalPrice, product.currency)}
                        </p>
                      )}
                      <p className={`text-3xl font-bold ${priceResult.originalPrice != null ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {formatPrice(priceResult.price, product.currency)}
                      </p>
                      {priceResult.savingsAmount != null && priceResult.savingsAmount > 0 && (
                        <p className="mt-1 text-sm font-medium text-emerald-600">
                          Save {formatPrice(priceResult.savingsAmount, product.currency)} · {priceResult.saleDiscountPct}% off
                        </p>
                      )}
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
              )}

              {/* CTAs — always visible */}
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

              {/* Delivery & stock info */}
              <DeliveryInfo availability={product.availability} />

              {/* Installation offer block */}
              <InstallationOffer acType={product.ac_type ?? null} coolingBtu={product.cooling_btu ?? null} />

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
                        <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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
              <h2 className="font-display text-2xl text-slate-900 mb-2">System Specifications</h2>
              <p className="text-sm text-slate-500 mb-6">Performance data and technical details for this unit</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {hvacSpecs.map((spec, i) => (
                  <HvacSpecCard key={i} {...spec} />
                ))}
              </div>
            </div>
          )}

          {/* Specifications — for accessories and products without HVAC spec cards */}
          {!hasHvacSpecs && hasLegacySpecs && (
            <div className="mt-14">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Specifications</h2>

              {/* Primitive key-value pairs */}
              {specPrimitives.length > 0 && (
                <div className="overflow-x-auto mb-8">
                  <table aria-label="Technical specifications" className="w-full border border-slate-100 rounded-xl overflow-hidden text-sm">
                    <tbody>
                      {specPrimitives.map(([key, val], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-5 py-3 font-medium text-slate-700 w-1/3 capitalize">{key.replace(/_/g, ' ')}</td>
                          <td className="px-5 py-3 text-slate-500">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Variants table */}
              {specVariants.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">Available Options</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-slate-100 rounded-xl overflow-hidden text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {Object.keys(specVariants[0])
                            .filter(k => k !== 'sku' || specVariants.some(v => v.sku))
                            .map(k => (
                              <th key={k} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide capitalize">
                                {k.replace(/_/g, ' ')}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {specVariants.map((variant, i) => (
                          <tr key={i} className="hover:bg-slate-50/40">
                            {Object.keys(specVariants[0]).map(k => (
                              <td key={k} className="px-4 py-2.5 text-sm text-slate-600">
                                {k === 'price' && typeof variant[k] === 'number'
                                  ? `€${Number(variant[k]).toFixed(2)}`
                                  : String(variant[k] ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Downloads */}
          {product.documents && product.documents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Downloads</h2>
              <div className="flex flex-wrap gap-3">
                {product.documents.map(doc => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <Download aria-hidden="true" className="w-4 h-4" />
                    {doc.name}
                    {doc.file_size && <span className="text-xs text-slate-400">({Math.round(doc.file_size / 1024)}KB)</span>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recently viewed */}
          <RecentlyViewed currentId={product.id} />

          {/* Related / BTU-matched products */}
          {relatedFiltered.length > 0 && (
            <div className="mt-16">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl text-slate-900">
                    {hasBtu ? 'Similar Systems For Your Space' : 'Related Products'}
                  </h2>
                  {hasBtu && (
                    <p className="text-sm text-slate-500 mt-1">
                      Systems with a similar BTU output — comparable cooling power
                    </p>
                  )}
                </div>
                <Link href="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0">
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
          {/* Premium Trade CTA — shown on all installation material pages for non-trade users */}
          {hidePricing && (
            <div className="mt-16">
              <TradePricingCta variant="premium" />
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Client-only: track view in localStorage + quote nudge after 3min */}
      <ViewTracker item={{
        id:    product.id,
        slug:  product.slug,
        name:  product.name,
        image: primaryImage?.url ?? null,
        price: priceResult.price != null ? formatPrice(priceResult.price, product.currency) : null,
      }} />
      <QuoteReminder productId={product.id} productName={product.name} />
    </>
  )
}
