'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Snowflake,
  Layers,
  Network,
  Flame,
  Package,
  Box,
  Archive,
  Wrench,
  Settings,
  Wind,
  Droplets,
  CircleDot,
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function ProductCategories({ categories }: { categories: Category[] }) {
  const displayed = categories.slice(0, 8)

  return (
    <section className="bg-slate-950 py-24 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Browse Our Range
            </p>
            <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
              HVAC &amp; Refrigeration
              <br className="hidden sm:block" />
              Solutions
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300 sm:flex"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {displayed.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Settings
            return (
              <motion.div key={category.id} variants={cardVariants}>
                <Link
                  href={`/products/category/${category.slug}`}
                  className="group block cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md border border-slate-800/60 transition-all duration-300 group-hover:shadow-2xl group-hover:border-blue-800/40">

                    {category.image_url ? (
                      <>
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-slate-900/10" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="h-16 w-16 text-blue-400/60 transition-all duration-300 group-hover:text-blue-300/80 group-hover:scale-110" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                        {/* Subtle glow on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600/[0.05]" />
                      </>
                    )}

                    {/* Bottom content */}
                    <div className="absolute inset-0 flex items-end justify-between p-4 transition-transform duration-300 group-hover:scale-[1.02]">
                      <span className="text-sm font-semibold leading-snug text-white drop-shadow-sm sm:text-base">
                        {category.name}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-white/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Mobile "View all" */}
        <div className="mt-8 flex sm:hidden">
          <Link
            href="/products"
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
