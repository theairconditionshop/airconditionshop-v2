'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { Brand } from '@/types/database'

// ─── Official brand slugs — only these appear in the marquee ─────────────────
// Match by slug, name fragment, or exact name. Case-insensitive.
function isOfficialBrand(brand: Brand): boolean {
  const slug = brand.slug.toLowerCase()
  const name = brand.name.toLowerCase()
  return (
    slug.includes('c-d') || slug.includes('c_d') || slug === 'cd' ||
    name.startsWith('c&d') || name.startsWith('c & d') || name === 'c&d' ||
    slug.includes('advanced') ||
    slug.includes('xtra') ||
    slug.includes('javac') ||
    slug.includes('2emme') || name.includes('2emme') ||
    slug.includes('aspen') ||
    slug.includes('veto')
  )
}

// ─── Brand card ───────────────────────────────────────────────────────────────

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={[
        'group relative flex items-center justify-center shrink-0',
        'h-[84px] min-w-[188px] px-10 mx-2',
        'border-r border-slate-200/70 bg-transparent',
        'cursor-pointer overflow-hidden select-none',
        'transition-colors duration-300 ease-out',
      ].join(' ')}
      style={{ willChange: 'transform' }}
      draggable="false"
    >
      {/* Soft hover glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(60% 80% at 50% 50%, rgba(14,165,233,0.10), transparent 70%)' }}
      />

      {brand.logo_url ? (
        <Image
          src={brand.logo_url}
          alt={brand.name}
          width={140}
          height={52}
          className="object-contain pointer-events-none group-hover:scale-[1.06] transition-transform duration-300 ease-out"
          style={{ maxHeight: '46px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
          loading="lazy"
          unoptimized
          draggable="false"
        />
      ) : (
        <span className="text-[13px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors tracking-wide text-center leading-tight">
          {brand.name}
        </span>
      )}
    </Link>
  )
}

// ─── Main marquee ─────────────────────────────────────────────────────────────

interface BrandMarqueeProps {
  brands:    Brand[]
  duration?: number
}

export default function BrandMarquee({ brands, duration = 30 }: BrandMarqueeProps) {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const pausedRef  = useRef(false)
  const resumeRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Auto-advance the strip by nudging native scrollLeft. Because both the
  // animation and the user's finger drive the same scrollLeft, they never fight:
  // manual swipe just moves it, then the loop resumes from wherever it lands.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!prefersReduced && !pausedRef.current && el.scrollWidth > el.clientWidth) {
        const half = el.scrollWidth / 2                 // one copy of the list
        el.scrollLeft += (half / duration) * dt         // full copy per `duration` seconds
        if (el.scrollLeft >= half) el.scrollLeft -= half // seamless wrap
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [duration])

  const pause = () => {
    pausedRef.current = true
    if (resumeRef.current) clearTimeout(resumeRef.current)
  }
  const scheduleResume = () => {
    if (resumeRef.current) clearTimeout(resumeRef.current)
    resumeRef.current = setTimeout(() => { pausedRef.current = false }, 1600)
  }

  // Show only official brands; fall back to all brands if DB slugs differ
  const official = brands.filter(isOfficialBrand)
  const list = official.length > 0 ? official : brands

  if (!list.length) return null

  // Double the list so the scroll wrap is seamless
  const doubled = [...list, ...list]

  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-100 overflow-hidden">

      {/* Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-3">
              Authorized Dealer
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight max-w-xl">
              The brands Malta trusts, under one roof.
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Premium HVAC equipment, professional tools and installation materials from the world&apos;s leading manufacturers.
          </p>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="relative" aria-label="Official brand partners">
        {/* Edge fade — left */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 lg:w-44 z-10"
          style={{ background: 'linear-gradient(to right, white 20%, transparent)' }}
        />
        {/* Edge fade — right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 lg:w-44 z-10"
          style={{ background: 'linear-gradient(to left, white 20%, transparent)' }}
        />

        {/* Scrollable, swipeable track — auto-scrolls, pauses on hover/touch */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
          onPointerEnter={pause}
          onPointerLeave={scheduleResume}
          onPointerDown={pause}
          onPointerUp={scheduleResume}
          onTouchStart={pause}
          onTouchEnd={scheduleResume}
        >
          <div className="flex w-max py-2">
            {doubled.map((brand, i) => (
              <BrandCard key={`${brand.id}-${i}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>

      {/* Certification strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-9 pt-7 border-t border-slate-100 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {[
          'All installations by certified engineers',
          'Malta VAT registered',
          'F-Gas certified',
          'Authorised distributor',
        ].map(text => (
          <span key={text} className="inline-flex items-center gap-2 text-xs text-slate-400 tracking-wide">
            <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>

    </section>
  )
}
