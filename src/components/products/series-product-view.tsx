'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShieldCheck, Truck, MapPin, Zap, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/pricing/resolver'
import { resolveVariantPrice, findVariant } from '@/lib/pricing/variant-resolver'
import TradePricingCta from '@/components/products/trade-pricing-cta'
import SpecGauge from '@/components/products/spec-gauge'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
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

  const [zoomed, setZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')
  const frameRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomOrigin(`${x}% ${y}%`)
  }

  const price = variant ? resolveVariantPrice(variant, role) : null
  const brandName = series.brand?.name ?? ''

  const baseSpecRows: [string, string | null][] = variant ? [
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
  // Extra verified specs stored per-variant (jsonb) — appended, de-duped by label
  const shownLabels = new Set(baseSpecRows.map(([k]) => k.toLowerCase()))
  const extraSpecRows: [string, string | null][] = variant?.specifications
    ? Object.entries(variant.specifications)
        .filter(([k, v]) => v && !shownLabels.has(k.toLowerCase()))
        .map(([k, v]) => [k, String(v)] as [string, string])
    : []
  const specRows: [string, string | null][] = [...baseSpecRows, ...extraSpecRows]

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* ── Gallery ── */}
      <div className="space-y-3">
        <Reveal mode="blur">
        <div
          ref={frameRef}
          className="relative aspect-square overflow-hidden bg-slate-50 border border-slate-200 group"
          style={{ borderRadius: 2 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          {hero ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={hero.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: zoomed ? 1.7 : 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: zoomOrigin }}
                >
                  <Image src={hero.url} alt={hero.alt_text || `${brandName} ${series.name}`} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
              <span className="text-white/30 text-xs tracking-[0.3em] uppercase">{brandName} {series.name}</span>
            </div>
          )}

          {hero && (
            <div
              className={cn(
                'absolute top-3 right-3 hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm text-[11px] font-medium text-slate-600 pointer-events-none transition-opacity duration-200',
                zoomed ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              )}
              style={{ borderRadius: 2 }}
            >
              <ZoomIn className="w-3 h-3" aria-hidden="true" />
              Hover to zoom
            </div>
          )}
        </div>
        </Reveal>
        {galleryImages.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {galleryImages.map((img, i) => (
              <button key={img.id} onClick={() => setActiveImg(i)}
                className={cn('relative aspect-square overflow-hidden border-2 transition-colors duration-200 cursor-pointer',
                  i === Math.min(activeImg, galleryImages.length - 1) ? 'border-blue-500' : 'border-transparent hover:border-slate-300')}
                style={{ borderRadius: 2 }}>
                <Image src={img.thumbnail_url ?? img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Details ── */}
      <div>
        <Reveal mode="up">
          {brandName && <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">{brandName}</p>}
          <h1 className="font-display text-3xl lg:text-4xl text-slate-900 tracking-[-0.02em]">{series.name}</h1>
          {series.tagline && <p className="text-slate-500 mt-2 leading-relaxed">{series.tagline}</p>}
        </Reveal>

        {/* Colour selector */}
        {hasColours && (
          <Reveal mode="up" delay={0.05}>
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
          </Reveal>
        )}

        {/* BTU selector */}
        {btuOptions.length > 0 && (
          <Reveal mode="up" delay={0.08}>
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Capacity (BTU)</p>
            <div className="flex flex-wrap gap-2">
              {btuOptions.map(b => (
                <button key={b} onClick={() => setBtu(b)}
                  className={cn('px-4 py-2 text-sm font-semibold border transition-colors duration-200 cursor-pointer',
                    effectiveBtu === b ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-900')}
                  style={{ borderRadius: 2 }}>
                  {b.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          </Reveal>
        )}

        {/* Sticky purchase panel — price + CTAs stay anchored as specs/features scroll beneath */}
        <div className="lg:sticky lg:top-24 lg:z-10 lg:bg-white/95 lg:backdrop-blur-sm lg:pb-2">
          <div className="mt-6">
            {hidePricing ? (
              <TradePricingCta variant="panel" />
            ) : price?.price != null ? (
              <div className="bg-slate-50 border border-slate-100 p-5" style={{ borderRadius: 2 }}>
                {price.originalPrice != null && (
                  <p className="text-sm text-slate-400 line-through">{formatPrice(price.originalPrice)}</p>
                )}
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {formatPrice(price.price)}
                  {price.isTrade && <span className="ml-2 align-middle text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1" style={{ borderRadius: 2 }}>Trade</span>}
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

          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <Link href={`/contact?product=${encodeURIComponent(`${brandName} ${series.name}${effectiveBtu ? ` ${effectiveBtu} BTU` : ''}`)}`}
              className="flex-1 inline-flex items-center justify-center h-12 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
              style={{ borderRadius: 2 }}>
              Request a Quote
            </Link>
            <a href="tel:+35679661889" className="flex-1 inline-flex items-center justify-center h-12 border border-slate-200 font-semibold text-slate-700 hover:border-slate-900 transition-colors" style={{ borderRadius: 2 }}>
              +356 7966 1889
            </a>
          </div>
        </div>

        {/* Trust strip */}
        <Stagger className="mt-5 grid grid-cols-3 gap-2 text-center" gap={0.05}>
          <StaggerItem><Trust icon={Truck} label="Malta-wide delivery" /></StaggerItem>
          <StaggerItem><Trust icon={MapPin} label="Mosta showroom" /></StaggerItem>
          <StaggerItem>{series.warranty_years ? <Trust icon={ShieldCheck} label={`${series.warranty_years}-yr warranty`} /> : <Trust icon={ShieldCheck} label="Warranty included" />}</StaggerItem>
        </Stagger>

        {/* Headline performance stats */}
        {(variant?.cooling_btu || variant?.seer || series.warranty_years) && (
          <Stagger className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4" gap={0.06}>
            {variant?.cooling_btu && (
              <StaggerItem><SpecGauge icon={Zap} label="Cooling Capacity" value={variant.cooling_btu} max={24000} unit="BTU/hr" accent="blue" /></StaggerItem>
            )}
            {variant?.seer != null && (
              <StaggerItem><SpecGauge icon={Zap} label="SEER Rating" value={variant.seer} max={8.5} decimals={1} accent="emerald" /></StaggerItem>
            )}
            {series.warranty_years != null && series.warranty_years > 0 && (
              <StaggerItem><SpecGauge icon={ShieldCheck} label="Manufacturer Warranty" value={series.warranty_years} max={10} unit={series.warranty_years === 1 ? 'year' : 'years'} accent="orange" /></StaggerItem>
            )}
          </Stagger>
        )}

        {/* Specs */}
        {specRows.some(([, v]) => v) && (
          <div className="mt-8">
            <Reveal mode="up">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Specifications {effectiveBtu ? `— ${effectiveBtu.toLocaleString()} BTU` : ''}</h2>
            </Reveal>
            <div className="border border-slate-200 overflow-hidden divide-y divide-slate-100" style={{ borderRadius: 2 }}>
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
            <Reveal mode="up">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Features</h2>
            </Reveal>
            <Stagger className="space-y-2" gap={0.03}>
              {series.features.map(f => (
                <StaggerItem key={f}>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />{f}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
        {series.description && (
          <Reveal mode="up">
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">About this series</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{series.description}</p>
          </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}

function Trust({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-slate-50 py-3 px-1" style={{ borderRadius: 2 }}>
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
