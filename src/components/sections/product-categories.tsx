'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ArrowUpRight, Snowflake, Layers, Network, Flame, Package,
  Box, Archive, Wrench, Settings, Wind, Droplets, CircleDot,
} from 'lucide-react'
import type { HomepageCard } from '@/types/database'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'

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

// Cards are fully admin-managed (Admin → Homepage Cards): title, subtitle,
// image, destination, order and visibility all come from the database.
export default function ProductCategories({ cards }: { cards: HomepageCard[] }) {
  const displayed = cards
  if (!displayed.length) return null

  // Icon fallback for cards without an image, matched from the destination slug
  function iconFor(href: string): React.ElementType {
    const slug = href.split('/').filter(Boolean).pop() ?? ''
    return CATEGORY_ICONS[slug] ?? Package
  }

  return (
    <section className="bg-[#f8f9fa] py-20 lg:py-28 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <Reveal mode="up">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                Browse Our Range
              </p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.98] tracking-[-0.02em] text-slate-900">
                Comfort for every space.
              </h2>
            </Reveal>
          </div>
          <Reveal mode="up" delay={0.1} className="hidden sm:block shrink-0">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors duration-300"
            >
              View all products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Reveal>
        </div>

        {/* Grid */}
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4" gap={0.07}>
          {displayed.map((card) => {
            const imageUrl = card.image_url || null
            const Icon = iconFor(card.href)
            const external = card.href.startsWith('http')
            return (
              <StaggerItem key={card.id}>
                <Link
                  href={card.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group block bg-white border border-slate-200 hover:border-slate-900 transition-colors duration-300"
                  style={{ borderRadius: 2 }}
                >
                  {/* Image / icon frame */}
                  <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={card.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.07]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-9 h-9 text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500" strokeWidth={1.5} />
                      </div>
                    )}
                    {/* corner index tick */}
                    <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-slate-300 group-hover:border-blue-500 transition-colors duration-300" />
                  </div>

                  {/* Label row on white */}
                  <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-t border-slate-100">
                    <span className="min-w-0">
                      <span className="block text-[13px] sm:text-sm font-semibold text-slate-900 leading-snug">
                        {card.title}
                      </span>
                      {card.subtitle && (
                        <span className="block text-[11px] text-slate-400 leading-snug mt-0.5 truncate">
                          {card.subtitle}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>

        {/* Mobile view all */}
        <div className="mt-10 flex sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 border-b-2 border-slate-900 pb-1">
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
