'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Brand } from '@/types/database'

function logoClasses(mode: string): string {
  if (mode === 'invert')
    return 'object-contain max-h-9 w-auto brightness-0 invert opacity-55 group-hover:opacity-90 transition-all duration-300'
  if (mode === 'normal')
    return 'object-contain max-h-9 w-auto opacity-65 group-hover:opacity-100 transition-opacity duration-300'
  // grayscale (default)
  return 'object-contain max-h-9 w-auto grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-95 transition-all duration-300'
}

export default function BrandShowcase({ brands }: { brands: Brand[] }) {
  const brandsWithLogos = brands.filter(b => b.logo_url)
  if (!brandsWithLogos.length) return null

  return (
    <section className="py-5 lg:py-7 bg-slate-950 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.28em] mb-1">
            Products From Leading Manufacturers
          </p>
          <p className="text-[12px] text-slate-600">
            Air Conditioning · Refrigeration · HVAC Tools · Installation Materials
          </p>
        </motion.div>

        {/* Brand row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {brandsWithLogos.map((brand, i) => {
            return (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, transition: { duration: 0.2, ease: 'easeOut' } }}
                style={{ willChange: 'transform' }}
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group relative flex items-center justify-center h-16 px-7 sm:px-9 rounded-xl border border-white/[0.07] hover:border-white/[0.20] bg-white/[0.01] hover:bg-white/[0.05] transition-colors duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Shimmer on hover */}
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo_url!}
                    alt={brand.name}
                    width={110}
                    height={44}
                    loading="lazy"
                    className={logoClasses(brand.logo_display_mode)}
                    style={{ height: '36px', width: 'auto', maxWidth: '110px', objectFit: 'contain' }}
                  />
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Certification strip */}
        <motion.div
          className="mt-6 pt-5 border-t border-white/[0.05] flex flex-wrap justify-center gap-x-8 gap-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {['All installations by certified engineers', 'Malta VAT registered', 'F-Gas certified'].map(text => (
            <span key={text} className="inline-flex items-center gap-1.5 text-xs text-slate-600 tracking-wide">
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
