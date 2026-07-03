'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { resolvePrice, formatPrice } from '@/lib/pricing/resolver'
import { resolveVariantPrice, shouldHideSeriesPrice } from '@/lib/pricing/variant-resolver'
import { Reveal, Stagger, StaggerItem, Magnetic } from '@/components/motion/primitives'
import type { Product, ProductSeries, UserRole } from '@/types/database'

interface Props {
  products: Product[]
  series?: ProductSeries[]
  userRole?: UserRole | null
}

export default function FeaturedProducts({ products, series = [], userRole = null }: Props) {
  if (products.length === 0 && series.length === 0) return null

  const hasHero = products.length >= 1
  const [hero, ...rest] = products
  const heroPrice = hasHero ? resolvePrice(hero, userRole) : null
  const heroImage = hasHero ? (hero.images?.find(i => i.is_primary) || hero.images?.[0]) : null

  return (
    <section className="bg-white py-20 lg:py-28 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-14">
          <div>
            <Reveal mode="up">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-blue-600 uppercase mb-4">Popular in Malta</p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.98] tracking-[-0.02em] text-slate-900">
                Engineered to cool.
              </h2>
            </Reveal>
          </div>
          <Reveal mode="up" delay={0.1} className="hidden sm:block shrink-0">
            <Link href="/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors duration-300">
              Browse all products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Reveal>
        </div>

        {/* Featured hero product — architectural split panel */}
        {hasHero && (
          <Reveal mode="up" className="mb-4">
            <Link
              href={`/products/${hero.slug}`}
              className="group grid lg:grid-cols-2 border border-slate-200 hover:border-slate-900 bg-white overflow-hidden transition-colors duration-400"
              style={{ borderRadius: 2 }}
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[440px] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                {heroImage ? (
                  <Image src={heroImage.url} alt={heroImage.alt_text || hero.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]" />
                ) : (
                  <Placeholder brand={hero.brand?.name} label={hero.category?.name ?? 'HVAC'} />
                )}
                {hero.energy_rating && (
                  <span className="absolute top-5 left-5 text-[11px] font-bold px-2.5 py-1 bg-emerald-500 text-white" style={{ borderRadius: 2 }}>{hero.energy_rating}</span>
                )}
                <span className="absolute top-5 right-5 text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 bg-white/80 backdrop-blur px-2.5 py-1" style={{ borderRadius: 2 }}>Featured</span>
              </div>

              <div className="flex flex-col justify-between p-8 lg:p-14">
                <div>
                  {hero.brand && <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase mb-5">{hero.brand.name}</p>}
                  <h3 className="font-display text-3xl lg:text-4xl text-slate-900 tracking-tight leading-[1.05] mb-5 group-hover:text-blue-700 transition-colors duration-300">{hero.name}</h3>
                  {hero.description && <p className="text-slate-500 leading-relaxed text-base line-clamp-3 mb-8 max-w-md">{hero.description}</p>}
                  {(hero.btu_value || hero.coverage_m2) && (
                    <div className="flex divide-x divide-slate-200 border-y border-slate-200 mb-8">
                      {hero.btu_value ? <Stat value={hero.btu_value.toLocaleString()} label="BTU" /> : null}
                      {hero.coverage_m2 ? <Stat value={`${Number(hero.coverage_m2)}m²`} label="Coverage" /> : null}
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  {heroPrice?.price != null
                    ? <p className="font-display text-3xl text-slate-900 tracking-tight">{formatPrice(heroPrice.price, hero.currency)}</p>
                    : <p className="text-lg text-slate-500 font-medium">Contact for price</p>}
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                    View
                    <span className="w-9 h-9 border border-slate-900 group-hover:bg-blue-600 group-hover:border-blue-600 flex items-center justify-center transition-colors duration-300" style={{ borderRadius: 2 }}>
                      <ArrowUpRight className="w-4 h-4 group-hover:text-white transition-colors" />
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Unified architectural grid — series first, then products */}
        <Stagger className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" gap={0.06}>
          {series.slice(0, 8).map(s => <StaggerItem key={s.id}><SeriesTile series={s} userRole={userRole} /></StaggerItem>)}
          {rest.slice(0, 8 - Math.min(series.length, 8)).map(p => <StaggerItem key={p.id}><ProductTile product={p} userRole={userRole} /></StaggerItem>)}
        </Stagger>

        <div className="mt-10 flex sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 border-b-2 border-slate-900 pb-1">
            View all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="py-4 px-6 first:pl-0">
      <p className="font-display text-2xl text-slate-900 leading-none tabular-nums">{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] mt-1.5">{label}</p>
    </div>
  )
}

function Placeholder({ brand, label }: { brand?: string; label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      {brand && <span className="text-[11px] font-bold tracking-[0.3em] text-slate-300 uppercase">{brand}</span>}
      <span className="w-10 h-px bg-slate-200" />
      <span className="text-[10px] tracking-[0.2em] text-slate-300 uppercase">{label}</span>
    </div>
  )
}

function TileShell({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Magnetic strength={0.08} className="h-full">
      <Link href={href} className="group flex flex-col h-full bg-white border border-slate-200 hover:border-slate-900 overflow-hidden transition-colors duration-300" style={{ borderRadius: 2 }}>
        {children}
      </Link>
    </Magnetic>
  )
}

function ProductTile({ product, userRole }: { product: Product; userRole: UserRole | null }) {
  const price = resolvePrice(product, userRole)
  const img = product.images?.find(i => i.is_primary) || product.images?.[0]
  return (
    <TileShell href={`/products/${product.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        {img
          ? <Image src={img.thumbnail_url ?? img.url} alt={img.alt_text || product.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]" />
          : <Placeholder brand={product.brand?.name} label={product.category?.name ?? 'HVAC'} />}
        {product.energy_rating && <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-emerald-500 text-white" style={{ borderRadius: 2 }}>{product.energy_rating}</span>}
      </div>
      <div className="flex flex-col flex-1 p-4">
        {product.brand && <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">{product.brand.name}</p>}
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          {price.price != null
            ? <p className="text-base font-bold text-slate-900 tracking-tight">{formatPrice(price.price, product.currency)}</p>
            : <p className="text-sm text-slate-400 font-medium">Contact us</p>}
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
      </div>
    </TileShell>
  )
}

function SeriesTile({ series, userRole }: { series: ProductSeries; userRole: UserRole | null }) {
  const variants = (series.variants ?? []).filter(v => v.is_active)
  const hide = shouldHideSeriesPrice(series, userRole)
  const prices = variants.map(v => resolveVariantPrice(v, userRole).price).filter((p): p is number => p != null)
  const from = prices.length ? Math.min(...prices) : null
  const hero = (series.images ?? []).find(i => i.colour_id == null && i.is_primary) ?? (series.images ?? []).find(i => i.colour_id == null) ?? (series.images ?? [])[0]
  const btus = [...new Set(variants.map(v => v.btu).filter((b): b is number => b != null))].sort((a, b) => a - b)
  const brandSlug = series.brand?.slug ?? ''

  return (
    <TileShell href={`/products/${brandSlug}/${series.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        {hero
          ? <Image src={hero.thumbnail_url ?? hero.url} alt={hero.alt_text || `${series.brand?.name ?? ''} ${series.name}`} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]" />
          : <Placeholder brand={series.brand?.name} label="Air Conditioner" />}
        {series.has_colours && (series.colours?.length ?? 0) > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {(series.colours ?? []).filter(c => c.is_active).slice(0, 4).map(c => (
              <span key={c.id} className="w-3.5 h-3.5 border border-white/80 shadow" style={{ backgroundColor: c.hex ?? '#e2e8f0', borderRadius: 2 }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4">
        {series.brand && <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">{series.brand.name}</p>}
        <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">{series.name}</h3>
        {btus.length > 0 && <p className="text-[11px] text-slate-400 mt-1">{btus.length} sizes · {btus[0].toLocaleString()}–{btus[btus.length - 1].toLocaleString()} BTU</p>}
        <div className="mt-3 flex items-center justify-between">
          {hide
            ? <span className="text-xs font-semibold text-blue-700">Trade price</span>
            : from != null
              ? <p className="text-sm text-slate-900"><span className="text-[10px] text-slate-400">from </span><span className="text-base font-bold tracking-tight">{formatPrice(from)}</span></p>
              : <p className="text-sm text-slate-400 font-medium">Contact us</p>}
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
      </div>
    </TileShell>
  )
}
