'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { resolvePrice, formatPrice, shouldHidePrice } from '@/lib/pricing/resolver'
import type { Product, UserRole } from '@/types/database'
import { cn } from '@/lib/utils'
import TradePricingCta from '@/components/products/trade-pricing-cta'

interface ProductCardProps {
  product: Product
  userRole?: UserRole | null
  className?: string
}

const AVAILABILITY_LABELS: Record<string, string> = {
  out_of_stock: 'Contact Us',
  on_order:     'On Order',
  discontinued: 'Discontinued',
}

const TILT_RANGE = 6 // degrees — subtle, premium, never disorienting

export default function ProductCard({ product, userRole, className }: ProductCardProps) {
  const priceResult   = resolvePrice(product, userRole ?? null)
  const primaryImage  = product.images?.find(img => img.is_primary) || product.images?.[0]
  const secondaryImage = product.images?.find(img => img.id !== primaryImage?.id)
  const unavailable   = product.availability !== 'in_stock'
  const hidePricing   = shouldHidePrice(product, userRole ?? null)

  const cardRef = useRef<HTMLAnchorElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const reduceMotion = useReducedMotion()

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!cardRef.current || reduceMotion) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width  // 0..1
    const py = (e.clientY - rect.top) / rect.height  // 0..1
    setTilt({ x: (py - 0.5) * -TILT_RANGE, y: (px - 0.5) * TILT_RANGE })
  }

  function handleMouseLeave() {
    setHovering(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <motion.div
      style={{ perspective: 1000 }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
    <Link
      ref={cardRef}
      href={`/products/${product.slug}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group flex flex-col h-full bg-white border border-slate-200 hover:border-slate-900',
        'overflow-hidden transition-colors duration-300 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        className
      )}
      style={{ borderRadius: 2 }}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.thumbnail_url ?? primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-all duration-[600ms] ease-out group-hover:scale-[1.06]',
                secondaryImage && hovering ? 'opacity-0' : 'opacity-100'
              )}
            />
            {secondaryImage && (
              <Image
                src={secondaryImage.thumbnail_url ?? secondaryImage.url}
                alt={secondaryImage.alt_text || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  'object-cover transition-all duration-[600ms] ease-out scale-[1.06]',
                  hovering ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {product.brand && (
              <span className="text-[11px] font-bold tracking-[0.25em] text-slate-300 uppercase">{product.brand.name}</span>
            )}
            <span className="w-8 h-px bg-slate-200" />
            <span className="text-[10px] tracking-[0.2em] text-slate-300 uppercase">
              {product.category?.name ?? 'HVAC'}
            </span>
          </div>
        )}

        {/* Status badge */}
        {unavailable && (
          <span
            className="absolute top-3 right-3 text-[10px] font-semibold tracking-wide px-2.5 py-1 bg-slate-900/85 text-white backdrop-blur-sm"
            style={{ borderRadius: 2 }}
          >
            {AVAILABILITY_LABELS[product.availability] ?? product.availability.replace(/_/g, ' ')}
          </span>
        )}

        {/* Energy rating badge */}
        {product.energy_rating && (
          <span
            className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wide px-2 py-0.5 bg-emerald-500 text-white"
            style={{ borderRadius: 2 }}
          >
            {product.energy_rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 lg:p-5">
        {product.brand && (
          <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">
            {product.brand.name}
            {product.category && !product.ac_type && (
              <span className="font-normal normal-case tracking-normal ml-1.5 text-slate-300">· {product.category.name}</span>
            )}
          </p>
        )}

        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors duration-300">
          {product.name}
        </h3>

        <div className="mt-4 flex items-end justify-between">
          <div>
            {hidePricing ? (
              <TradePricingCta variant="card" />
            ) : priceResult.price != null ? (
              <div>
                {priceResult.originalPrice != null && (
                  <p className="text-xs text-slate-400 line-through leading-none mb-0.5">
                    {formatPrice(priceResult.originalPrice, product.currency)}
                  </p>
                )}
                <p className={cn('text-base font-bold tracking-tight', priceResult.originalPrice != null ? 'text-emerald-600' : 'text-slate-900')}>
                  {formatPrice(priceResult.price, product.currency)}
                  {priceResult.isTrade && (
                    <span className="ml-2 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5" style={{ borderRadius: 2 }}>
                      Trade
                    </span>
                  )}
                </p>
                {priceResult.savingsAmount != null && priceResult.savingsAmount > 0 && (
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    Save {formatPrice(priceResult.savingsAmount, product.currency)}
                    {priceResult.saleDiscountPct != null && ` (${priceResult.saleDiscountPct}% off)`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium">Contact for price</p>
            )}
          </div>

          <ArrowUpRight aria-hidden="true" className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
      </div>
    </Link>
    </motion.div>
  )
}
