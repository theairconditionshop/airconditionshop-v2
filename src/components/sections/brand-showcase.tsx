'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Brand } from '@/types/database'

export default function BrandShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
            Authorised Dealer for World-Leading Brands
          </p>
          <div className="mt-3 mx-auto w-10 h-px bg-amber-400/60" />
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center aspect-square rounded-xl border border-transparent hover:border-slate-100 hover:shadow-md bg-transparent transition-all duration-200 cursor-pointer p-4"
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={96}
                    height={48}
                    className="object-contain max-h-12 w-auto grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-200"
                  />
                ) : (
                  <span className="font-bold text-2xl text-slate-300 group-hover:text-slate-700 text-center leading-tight transition-colors duration-200">
                    {brand.name}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 tracking-wide">
            All installations by certified engineers&nbsp;&nbsp;·&nbsp;&nbsp;Malta VAT registered
          </p>
        </div>
      </div>
    </section>
  )
}
