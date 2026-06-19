'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types/database'

const CATEGORY_ICONS: Record<string, string> = {
  'air-conditioners':         '❄️',
  'multi-split-systems':      '🔀',
  'vrf-systems':              '🏢',
  'heat-pumps':               '🌡️',
  'commercial-refrigeration': '🏭',
  'cold-rooms':               '🧊',
  'freezers-fridges':         '🫙',
  'hvac-tools':               '🔧',
  'accessories':              '⚙️',
  'ventilation':              '💨',
  'refrigerants':             '🧪',
  'spare-parts':              '🔩',
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
              Everything You Need for<br className="hidden sm:block" /> HVAC & Refrigeration
            </h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors">
            All products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayCats.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/products/category/${cat.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all duration-300 aspect-[4/3]"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-50">
                    <span className="text-5xl">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-white leading-tight">{cat.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/70 group-hover:text-sky-300 transition-colors">
                    Browse <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/products" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            View all products →
          </Link>
        </div>
      </div>
    </section>
  )
}
