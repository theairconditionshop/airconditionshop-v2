import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { resolvePrice, formatPrice } from '@/lib/pricing/resolver'
import SeriesCard from '@/components/products/series-card'
import type { Product, ProductSeries, UserRole } from '@/types/database'

interface Props {
  products: Product[]
  series?: ProductSeries[]
  userRole?: UserRole | null
}

const BRAND_GRADIENTS: Record<string, string> = {
  daikin:               'from-sky-950 via-blue-900 to-slate-900',
  mitsubishi:           'from-red-950 via-slate-900 to-slate-950',
  'mitsubishi electric':'from-red-950 via-slate-900 to-slate-950',
  panasonic:            'from-blue-950 via-indigo-900 to-slate-900',
  default:              'from-slate-900 via-slate-800 to-slate-950',
}
function getGradient(name?: string) {
  if (!name) return BRAND_GRADIENTS.default
  return BRAND_GRADIENTS[name.toLowerCase()] ?? BRAND_GRADIENTS.default
}

export default function FeaturedProducts({ products, series = [], userRole }: Props) {
  // Show the section if there's anything featured — a hero product OR series.
  if (products.length === 0 && series.length === 0) return null

  const hasHero = products.length >= 1
  const [hero, ...rest] = products
  const heroPrice    = hasHero ? resolvePrice(hero, userRole ?? null) : null
  const heroImage    = hasHero ? (hero.images?.find(img => img.is_primary) || hero.images?.[0]) : null
  const heroGradient = getGradient(hero?.brand?.name)

  return (
    <section className="py-14 lg:py-20 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase mb-3">
              Popular in Malta
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900">
              Air Conditioners &amp; HVAC Products
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group"
          >
            Browse All Products
            <ArrowRight aria-hidden="true" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Hero product — editorial large card */}
        {hasHero && (
        <div className="mb-6">
          <Link
            href={`/products/${hero.slug}`}
            className="group grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-400 ease-out cursor-pointer bg-white"
          >
            {/* Image */}
            <div className={`relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-gradient-to-br ${heroGradient}`}>
              {heroImage ? (
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt_text || hero.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-600 ease-out"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {hero.brand && (
                    <span className="text-[11px] font-bold tracking-[0.3em] text-white/25 uppercase">
                      {hero.brand.name}
                    </span>
                  )}
                  <div className="w-12 h-px bg-white/10" />
                  <span className="text-[10px] tracking-[0.2em] text-white/15 uppercase">
                    {hero.category?.name ?? 'HVAC'}
                  </span>
                </div>
              )}

              {/* Energy badge */}
              {hero.energy_rating && (
                <div className="absolute top-5 left-5">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-lg">
                    {hero.energy_rating} Rating
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between p-8 lg:p-12">
              <div>
                {hero.brand && (
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-4">
                    {hero.brand.name}
                  </p>
                )}
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-blue-700 transition-colors">
                  {hero.name}
                </h3>
                {hero.description && (
                  <p className="text-slate-500 leading-relaxed text-sm lg:text-base line-clamp-3 mb-6">
                    {hero.description}
                  </p>
                )}

                {/* Key specs */}
                {(hero.btu_value || hero.coverage_m2) && (
                  <div className="flex gap-6 mb-8">
                    {hero.btu_value && (
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{hero.btu_value.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">BTU</p>
                      </div>
                    )}
                    {hero.coverage_m2 && (
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {Number(hero.coverage_m2)}m²
                        </p>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">Coverage</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  {heroPrice?.price != null ? (
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">
                      {formatPrice(heroPrice.price, hero.currency)}
                    </p>
                  ) : (
                    <p className="text-lg text-slate-500 font-medium">Contact for price</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  View product
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                    <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        )}

        {/* Series + remaining products grid */}
        {(series.length > 0 || rest.length > 0) && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {series.slice(0, 8).map(s => (
              <SeriesCard key={s.id} series={s} userRole={userRole} brandSlug={s.brand?.slug ?? ''} />
            ))}
            {rest.slice(0, 7).map((product, i) => {
              const priceResult  = resolvePrice(product, userRole ?? null)
              const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
              const gradient     = getGradient(product.brand?.name)

              return (
                <div key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group flex flex-col bg-white rounded-2xl border border-slate-100/80 overflow-hidden hover:border-slate-200 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer"
                  >
                    <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient}`}>
                      {primaryImage ? (
                        <Image
                          src={primaryImage.thumbnail_url ?? primaryImage.url}
                          alt={primaryImage.alt_text || product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                          {product.brand && (
                            <span className="text-[9px] font-bold tracking-[0.25em] text-white/25 uppercase">
                              {product.brand.name}
                            </span>
                          )}
                        </div>
                      )}
                      {product.energy_rating && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                            {product.energy_rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {product.brand && (
                        <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">
                          {product.brand.name}
                        </p>
                      )}
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        {priceResult.price != null ? (
                          <p className="text-base font-bold text-slate-900 tracking-tight">
                            {formatPrice(priceResult.price, product.currency)}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 font-medium">Contact us</p>
                        )}
                        <ArrowUpRight aria-hidden="true" className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-8 flex sm:hidden">
          <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 cursor-pointer">
            View all products <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
