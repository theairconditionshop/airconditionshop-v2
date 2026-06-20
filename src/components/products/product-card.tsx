import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { resolvePrice, formatPrice } from '@/lib/pricing/resolver'
import type { Product, UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  userRole?: UserRole | null
  className?: string
}

// Elegant gradient placeholders — no emojis
const BRAND_GRADIENTS: Record<string, string> = {
  daikin:               'from-sky-950 via-blue-900 to-slate-900',
  mitsubishi:           'from-red-950 via-slate-900 to-slate-950',
  'mitsubishi electric':'from-red-950 via-slate-900 to-slate-950',
  panasonic:            'from-blue-950 via-indigo-900 to-slate-900',
  samsung:              'from-slate-900 via-blue-950 to-slate-950',
  lg:                   'from-slate-900 via-rose-950 to-slate-950',
  fujitsu:              'from-emerald-950 via-slate-900 to-slate-950',
  toshiba:              'from-orange-950 via-slate-900 to-slate-950',
}

function getBrandGradient(brandName?: string) {
  if (!brandName) return 'from-slate-900 via-slate-800 to-slate-900'
  return BRAND_GRADIENTS[brandName.toLowerCase()] ?? 'from-slate-900 via-slate-800 to-slate-900'
}

const AVAILABILITY_LABELS: Record<string, string> = {
  out_of_stock: 'Contact Us',
  on_order:     'On Order',
  discontinued: 'Discontinued',
}

export default function ProductCard({ product, userRole, className }: ProductCardProps) {
  const priceResult  = resolvePrice(product, userRole ?? null)
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
  const gradientClass = getBrandGradient(product.brand?.name)
  const unavailable   = product.availability !== 'in_stock'

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100/80',
        'hover:border-slate-200 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] hover:-translate-y-0.5',
        'transition-all duration-300 ease-out cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        ) : (
          // Premium gradient placeholder — shows brand identity without an image
          <div className={cn('w-full h-full bg-gradient-to-br', gradientClass, 'flex flex-col items-center justify-center gap-2 p-6')}>
            {product.brand && (
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase">
                {product.brand.name}
              </span>
            )}
            <div className="w-10 h-px bg-white/10" />
            <span className="text-[9px] tracking-[0.2em] text-white/20 uppercase">
              {product.category?.name ?? 'HVAC'}
            </span>
          </div>
        )}

        {/* Status pill — only if unavailable */}
        {unavailable && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-black/60 text-white/80 backdrop-blur-sm">
              {AVAILABILITY_LABELS[product.availability] ?? product.availability.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Energy rating pill */}
        {product.energy_rating && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded bg-emerald-500 text-white">
              {product.energy_rating}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 lg:p-5">
        {product.brand && (
          <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase mb-1.5">
            {product.brand.name}
          </p>
        )}

        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors duration-200">
          {product.name}
        </h3>

        <div className="mt-4 flex items-end justify-between">
          <div>
            {priceResult.price != null ? (
              <p className="text-base font-bold text-slate-900 tracking-tight">
                {formatPrice(priceResult.price, product.currency)}
                {priceResult.isTrade && (
                  <span className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    Trade
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-slate-400 font-medium">Contact for price</p>
            )}
          </div>

          <div className="w-7 h-7 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-200">
            <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors duration-200" />
          </div>
        </div>
      </div>
    </Link>
  )
}
