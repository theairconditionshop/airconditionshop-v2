'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Snowflake, Layers, Network, Flame, Package,
  Box, Archive, Wrench, Settings, Wind, Droplets, CircleDot, ArrowRight,
} from 'lucide-react'
import type { Category } from '@/types/database'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'air-conditioners':         Snowflake,
  'multi-split-systems':      Layers,
  'vrf-systems':              Network,
  'heat-pumps':               Flame,
  'commercial-refrigeration': Package,
  'cold-rooms':               Box,
  'freezers-fridges':         Archive,
  'hvac-tools':               Wrench,
  'accessories':              Settings,
  'ventilation':              Wind,
  'refrigerants':             Droplets,
  'spare-parts':              CircleDot,
}

export default function ProductCategories({ categories }: { categories: Category[] }) {
  const displayCats = categories.slice(0, 8)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Browse by Category</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Everything You Need for<br className="hidden sm:block" /> HVAC &amp; Refrigeration
            </h2>
          </div>
          <Link href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors cursor-pointer">
            All products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayCats.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Settings
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/products/category/${cat.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white hover:border-sky-200 hover:shadow-xl transition-all duration-300 aspect-[4/3] cursor-pointer"
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-white group-hover:from-sky-100 transition-colors duration-300">
                      <Icon className="w-12 h-12 text-sky-300 group-hover:text-sky-500 transition-colors duration-300" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-semibold text-white leading-tight">{cat.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/60 group-hover:text-sky-300 transition-colors duration-200">
                      Browse <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            View all products <ArrowRight className="inline w-3.5 h-3.5 -mt-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
