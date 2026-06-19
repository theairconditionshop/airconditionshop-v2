'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Brand } from '@/types/database'

export default function BrandShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Authorised Dealer for Premium Brands
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300 group aspect-square cursor-pointer"
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={90}
                    height={45}
                    className="object-contain max-h-11 grayscale group-hover:grayscale-0 transition-all duration-400"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-400 group-hover:text-sky-600 text-center transition-colors leading-tight uppercase tracking-wide">
                    {brand.name}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
