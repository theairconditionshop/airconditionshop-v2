'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShieldCheck, Truck, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/pricing/resolver'
import { resolveVariantPrice, findVariant } from '@/lib/pricing/variant-resolver'
import TradePricingCta from '@/components/products/trade-pricing-cta'
import type { ProductSeries, SeriesColour, ProductVariant, UserRole } from '@/types/database'

interface Props {
  series: ProductSeries
  role: UserRole | null
  hidePricing: boolean
  priceRangeLabel: string | null
}

export default function SeriesProductView({ series, role, hidePricing }: Props) {
  const colours = useMemo(
    () => (series.colours ?? []).filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order),
    [series.colours],
  )
  const variants = useMemo(() => (series.variants ?? []).filter(v => v.is_active), [series.variants])
  const hasColours = series.has_colours && colours.length > 0

  const [colour, setColour] = useState<SeriesColour | null>(
    hasColours ? (colours.find(c => c.is_default) ?? colours[0]) : null,
  )

  // BTU options available for the selected colour (colour-specific + shared)
  const btuOptions = useMemo(() => {
    const set = new Map<number, ProductVariant>()
    for (const v of variants) {
      if (v.btu == null) continue
      const matchesColour = !hasColours || v.colour_id == null || v.colour_id === colour?.id
      if (matchesColour && !set.has(v.btu)) set.set(v.btu, v)
    }
    return [...set.keys()].sort((a, b) => a - b)
  }, [variants, colour, hasColours])

  const [btu, setBtu] = useState<number | null>(btuOptions[0] ?? null)
  const effectiveBtu = btu != null && btuOptions.includes(btu) ? btu : (btuOptions[0] ?? null)

  const variant = useMemo(
    () => findVariant(variants, effectiveBtu, colour?.id ?? null),
    [variants, effectiveBtu, colour],
  )

  // Gallery: colour images if any, else series hero images
  const galleryImages = useMemo(() => {
    const all = series.images ?? []
    const colourImgs = colour ? all.filter(i => i.colour_id === colour.id) : []
    const base = colourImgs.length ? colourImgs : all.filter(i => i.colour_id == null)
    return [...base].sort((a, b) => (Number(b.is_primary) - Number(a.is_primary)) || a.display_order - b.display_order)
  }, [series.images, colour])

  const [activeImg, setActiveImg] = useState(0)
  const hero = galleryImages[Math.min(activeImg, galleryImages.length - 1)]

  const price = variant ? resolveVariantPrice(variant, role) : null
  const brandName = series.brand?.name ?? ''

  const specRows: [string, string | null][] = variant ? [
    ['Cooling capacity', variant.cooling_btu ? `${variant.cooling_btu.toLocaleString()} BTU` : null],
    ['Heating capacity', variant.heating_btu ? `${variant.heating_btu.toLocaleString()} BTU` : null],
    ['Energy rating', variant.energy_rating],
    ['SEER', variant.seer?.toString() ?? null],
    ['SCOP', variant.scop?.toString() ?? null],
    ['Refrigerant', variant.refrigerant],
    ['Indoor unit (W×H×D)', variant.dimensions_indoor],
    ['Outdoor unit (W×H×D)', variant.dimensions_outdoor],
    ['Copper pipe (gas / liquid)', variant.copper_gas || variant.copper_liquid ? `${variant.copper_gas ?? '—'} / ${variant.copper_liquid ?? '—'}` : null],
    ['Indoor model', variant.model_indoor],
    ['Outdoor model', variant.model_outdoor],
    ['SKU', variant.sku],
  ] : []

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* ── Gallery ── */}
      <div className="space-y-3">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
          {hero ? (
            <Image key={hero.id} src={hero.url} alt={hero.alt_text || `${brandName} ${series.name}`} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
              <span className="text-white/30 text-xs tracking-[0.3em] uppercase">{brandName} {series.name}</span>
            </div>
          )}
        </div>
        {galleryImages.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {galleryImages.map((img, i) => (
              <button key={img.id} onClick={() => setActiveImg(i)}
                className={cn('relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer',
                  i === Math.min(activeImg, galleryImages.length - 1) ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300')}>
                <Image src={img.thumbnail_url ?? img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Details ── */}
      <div>
        {brandName && <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">{brandName}</p>}
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{series.name}</h1>
        {series.tagline && <p className="text-slate-500 mt-2 leading-relaxed">{series.tagline}</p>}

        {/* Colour selector */}
        {hasColours && (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Colour: <span className="text-slate-500">{colour?.name}</span></p>
            <div className="flex flex-wrap gap-2">
              {colours.map(c => (
                <button key={c.id} onClick={() => { setColour(c); setActiveImg(0) }}
                  title={c.name}
                  className={cn('w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
                    colour?.id === c.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300')}
                  style={{ backgroundColor: c.hex ?? '#e2e8f0' }}>
                  {colour?.id === c.id && <Check className="w-4 h-4" style={{ color: pickContrast(c.hex) }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BTU selector */}
        {btuOptions.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Capacity (BTU)</p>
            <div className="flex flex-wrap gap-2">
              {btuOptions.map(b => (
                <button key={b} onClick={() => setBtu(b)}
                  className={cn('px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer',
                    effectiveBtu === b ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                  {b.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mt-6">
          {hidePricing ? (
            <TradePricingCta variant="panel" />
          ) : price?.price != null ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
              {price.originalPrice != null && (
                <p className="text-sm text-slate-400 line-through">{formatPrice(price.originalPrice)}</p>
              )}
              <p className="text-3xl font-bold text-slate-900">
                {formatPrice(price.price)}
                {price.isTrade && <span className="ml-2 align-middle text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Trade</span>}
              </p>
              {price.savingsAmount != null && price.savingsAmount > 0 && (
                <p className="text-sm text-emerald-600 font-medium mt-1">Save {formatPrice(price.savingsAmount)}{price.saleDiscountPct ? ` (${price.saleDiscountPct}% off)` : ''}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">Price includes supply & installation, up to 3m copper piping. Excludes 18% VAT where applicable.</p>
            </div>
          ) : (
            <p className="text-slate-500">Contact us for pricing</p>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <Link href={`/contact?product=${encodeURIComponent(`${brandName} ${series.name}${effectiveBtu ? ` ${effectiveBtu} BTU` : ''}`)}`}
            className="flex-1 inline-flex items-center justify-center h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
            Request a Quote
          </Link>
          <a href="tel:+35679661889" className="flex-1 inline-flex items-center justify-center h-12 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            +356 7966 1889
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Trust icon={Truck} label="Malta-wide delivery" />
          <Trust icon={MapPin} label="Mosta showroom" />
          {series.warranty_years ? <Trust icon={ShieldCheck} label={`${series.warranty_years}-yr warranty`} /> : <Trust icon={ShieldCheck} label="Warranty included" />}
        </div>

        {/* Specs */}
        {specRows.some(([, v]) => v) && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Specifications {effectiveBtu ? `— ${effectiveBtu.toLocaleString()} BTU` : ''}</h2>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {specRows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-900 font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features + description */}
        {series.features?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Features</h2>
            <ul className="space-y-2">
              {series.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        )}
        {series.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">About this series</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{series.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Trust({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-3 px-1">
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="text-[10px] text-slate-500 leading-tight">{label}</span>
    </div>
  )
}

function pickContrast(hex: string | null): string {
  if (!hex) return '#0f172a'
  const h = hex.replace('#', '')
  if (h.length < 6) return '#0f172a'
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0f172a' : '#ffffff'
}
