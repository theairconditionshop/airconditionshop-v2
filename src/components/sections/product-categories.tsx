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

export default function ProductCategories({ categories }: { categories: Category[] }) {
  const displayed = categories.slice(0, 8)

  return (
    <section className="bg-slate-950 py-10 lg:py-16 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Browse Our Range
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-white">
              HVAC &amp; Refrigeration{' '}
              <br className="hidden sm:block" />
              Solutions
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-400 transition-all duration-200 hover:text-blue-300 hover:gap-2 sm:flex group"
          >
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayed.map((category) => {
            const imageUrl = category.image_url || null
            const Icon = CATEGORY_ICONS[category.slug]
            return (
              <div key={category.id}>
                <Link
                  href={`/products/category/${category.slug}`}
                  className="group block cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/50 transition-all duration-350 group-hover:border-blue-700/40 group-hover:shadow-[0_16px_48px_-16px_rgba(37,99,235,0.3)]">

                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-slate-900/10" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent" />
                        {Icon && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="w-10 h-10 text-blue-700/40 group-hover:text-blue-600/60 transition-colors duration-300" />
                          </div>
                        )}
                      </>
                    )}

                    {/* Bottom label */}
                    <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                      <span className="text-sm font-semibold leading-snug text-white drop-shadow-sm sm:text-[15px]">
                        {category.name}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-200 shrink-0 ml-2">
                        <ArrowRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Mobile "View all" */}
        <div className="mt-8 flex sm:hidden">
          <Link
            href="/products"
            className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-400 transition-colors duration-200 hover:text-blue-300"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
