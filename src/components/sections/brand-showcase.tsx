'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Brand } from '@/types/database'

const BRAND_PLACEHOLDERS: Record<string, string> = {
  daikin:               'Daikin',
  'mitsubishi-electric':'Mitsubishi Electric',
  panasonic:            'Panasonic',
  toshiba:              'Toshiba',
  fujitsu:              'Fujitsu',
  gree:                 'Gree',
}

export default function BrandShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Authorised Dealer
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Premium Brands We Stock
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={`/brands/${brand.slug}`}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all duration-200 group aspect-square">
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={80}
                    height={40}
                    className="object-contain max-h-10 grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-400 group-hover:text-sky-600 text-center transition-colors leading-tight">
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
