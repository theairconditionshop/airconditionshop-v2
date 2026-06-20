'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { resolvePrice, formatPrice } from '@/lib/pricing/resolver'
import type { Product, UserRole } from '@/types/database'

interface Props {
  products: Product[]
  userRole?: UserRole | null
}

function availabilityBadge(availability: string) {
  switch (availability) {
    case 'out_of_stock':
      return <Badge variant="warning" className="text-xs">Contact Us for Availability</Badge>
    case 'on_order':
      return <Badge variant="warning" className="text-xs">On Order — Contact Us</Badge>
    case 'coming_soon':
      return <Badge className="text-xs bg-amber-500 text-white border-0">Coming Soon</Badge>
    default:
      return null
  }
}

export default function FeaturedProducts({ products, userRole }: Props) {
  if (!products.length) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Handpicked Selection</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, i) => {
            const priceResult = resolvePrice(product, userRole ?? null)
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/products/${product.slug}`} className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt_text || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-3">
                        <Snowflake className="w-12 h-12 text-slate-300" />
                        {product.brand && (
                          <p className="text-xs font-medium text-slate-400">{product.brand.name}</p>
                        )}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.is_featured && (
                        <Badge variant="default" className="gap-1 text-xs">
                          <Star className="w-2.5 h-2.5" /> Featured
                        </Badge>
                      )}
                      {product.energy_rating && (
                        <Badge variant="success" className="text-xs">
                          {product.energy_rating}
                        </Badge>
                      )}
                      {product.availability !== 'in_stock' && availabilityBadge(product.availability)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {product.brand && (
                      <p className="text-xs font-medium text-blue-600 mb-1">{product.brand.name}</p>
                    )}
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>
                    {product.model_number && (
                      <p className="mt-1 text-xs text-slate-400">Model: {product.model_number}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {priceResult.price != null ? (
                          <div>
                            <p className="text-base font-bold text-slate-900">
                              {formatPrice(priceResult.price, product.currency)}
                            </p>
                            {priceResult.isTrade && (
                              <Badge variant="trade" className="mt-1 text-xs">{priceResult.label}</Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">Contact for Price</p>
                        )}
                      </div>
                      <span className="text-blue-500 group-hover:translate-x-1 transition-transform duration-200">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
