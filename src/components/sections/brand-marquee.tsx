'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        'h-[76px] min-w-[168px] px-8 mx-3',
        'rounded-2xl border border-slate-200 bg-white',
        'cursor-pointer overflow-hidden select-none',
        'transition-all duration-200 ease-out',
        'hover:border-blue-200 hover:shadow-[0_8px_32px_rgba(15,111,255,0.13)]',
        'hover:scale-[1.045] hover:-translate-y-0.5',
      ].join(' ')}
      style={{ willChange: 'transform' }}
      draggable="false"
    >
      {/* Blue ring glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(15,111,255,0.24)' }}
      />

      {brand.logo_url ? (
        <Image
          src={brand.logo_url}
          alt={brand.name}
          width={130}
          height={52}
          className="object-contain pointer-events-none"
          style={{
            maxHeight: '44px',
            width: 'auto',
            maxWidth: '130px',
            objectFit: 'contain',
            // No filters — always show full brand colours
          }}
          loading="lazy"
          unoptimized
          draggable="false"
        />
      ) : (
        <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors tracking-wide text-center leading-tight">
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
  // Show only official brands; fall back to all brands if DB slugs differ
  const official = brands.filter(isOfficialBrand)
  const list = official.length > 0 ? official : brands

  if (!list.length) return null

  // Double the list — CSS animates translateX(-50%) for a seamless loop
  const doubled = [...list, ...list]

  return (
    <section className="py-12 lg:py-16 bg-white border-y border-slate-100 overflow-hidden">

      {/* Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-9">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.32em] mb-3">
          Products From Leading Manufacturers
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Official Brands Available at THE AIRCONDITION SHOP
        </h2>
        <p className="mt-2.5 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Premium HVAC equipment, professional tools and installation materials from the world&apos;s leading manufacturers.
        </p>
      </div>

      {/* Marquee strip */}
      <div
        className="relative marquee-root"
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
        aria-label="Official brand partners"
      >
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

        <div className="marquee-track py-2">
          {doubled.map((brand, i) => (
            <BrandCard key={`${brand.id}-${i}`} brand={brand} />
          ))}
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
