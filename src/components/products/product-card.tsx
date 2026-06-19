import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { resolvePrice, formatPrice } from '@/lib/pricing/resolver'
import type { Product, UserRole } from '@/types/database'

interface ProductCardProps {
  product: Product
  userRole?: UserRole | null
}

export default function ProductCard({ product, userRole }: ProductCardProps) {
  const priceResult = resolvePrice(product, userRole ?? null)
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-sky-200 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">❄️</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_featured && (
            <Badge variant="default" className="text-xs gap-1">
              <Star className="w-2.5 h-2.5" /> Featured
            </Badge>
          )}
          {product.energy_rating && (
            <Badge variant="success" className="text-xs">{product.energy_rating}</Badge>
          )}
          {product.availability !== 'in_stock' && (
            <Badge variant="warning" className="text-xs capitalize">
              {product.availability.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        {product.brand && (
          <p className="text-xs font-medium text-sky-600 mb-1">{product.brand.name}</p>
        )}
        <h3 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 group-hover:text-sky-700 transition-colors flex-1">
          {product.name}
        </h3>
        {product.model_number && (
          <p className="mt-1 text-xs text-slate-400">Model: {product.model_number}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            {priceResult.price != null ? (
              <>
                <p className="font-bold text-slate-900">{formatPrice(priceResult.price, product.currency)}</p>
                {priceResult.isTrade && (
                  <Badge variant="trade" className="mt-1 text-xs">{priceResult.label}</Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500 italic">Contact for price</p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
