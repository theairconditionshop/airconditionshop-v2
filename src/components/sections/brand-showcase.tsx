'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Brand } from '@/types/database'

export default function BrandShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null

  return (
    <section className="py-20 bg-slate-950 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
            Authorised Dealer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white/60 tracking-tight">
            World-Leading HVAC Brands
          </h2>
        </motion.div>

        {/* Brand row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex items-center justify-center h-16 px-6 sm:px-8 rounded-xl border border-white/[0.07] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all duration-250 cursor-pointer"
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={100}
                    height={40}
                    className="object-contain max-h-9 w-auto grayscale group-hover:grayscale-0 opacity-35 group-hover:opacity-90 transition-all duration-300"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-white text-center tracking-[0.15em] uppercase transition-colors duration-200">
                    {brand.name}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Certification strip */}
        <motion.div
          className="mt-14 pt-8 border-t border-white/[0.05] flex flex-wrap justify-center gap-x-8 gap-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {['All installations by certified engineers', 'Malta VAT registered', 'F-Gas certified'].map(text => (
            <span key={text} className="text-xs text-slate-600 tracking-wide">{text}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
