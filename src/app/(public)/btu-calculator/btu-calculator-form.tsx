'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { calculateBtu, metresToFeet, type BtuResult } from '@/lib/btu/calculator'
import { ArrowRight, Loader2, Tag, Zap, Phone } from 'lucide-react'

// Dimensions are entered in metres OR feet (chosen by the toggle). Validation is
// the same either way — a positive number. All BTU maths happens in feet.
const schema = z.object({
  length: z.number({ error: 'Enter room length' }).positive('Enter room length'),
  width:  z.number({ error: 'Enter room width' }).positive('Enter room width'),
  height: z.number({ error: 'Enter ceiling height' }).positive('Enter ceiling height'),
})

type FormData = z.infer<typeof schema>

interface RecommendedProduct {
  id: string; name: string; slug: string
  cooling_btu: number | null; retail_price: number | null; currency: string
  brand?: { name: string; slug: string }
  images?: { url: string; is_primary: boolean }[]
}

const DIM_META = {
  length: { label: 'Room length' },
  width:  { label: 'Room width' },
  height: { label: 'Ceiling height' },
} as const

export default function BtuCalculatorForm() {
  const [unit, setUnit]                       = useState<'metric' | 'imperial'>('metric')
  const [result, setResult]                   = useState<BtuResult | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [loadingRecs, setLoadingRecs]         = useState(false)

  const isMetric = unit === 'metric'

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { height: isMetric ? 2.7 : 8.9 },
  })

  const values = watch()

  function switchUnit(next: 'metric' | 'imperial') {
    setUnit(next)
    setResult(null)
    setRecommendations([])
    reset({ height: next === 'metric' ? 2.7 : 8.9, length: undefined, width: undefined })
  }

  async function onSubmit(data: FormData) {
    // Always calculate in FEET. If the user entered metres, convert first.
    const feet = isMetric
      ? { length: metresToFeet(data.length), width: metresToFeet(data.width), height: metresToFeet(data.height) }
      : { length: data.length, width: data.width, height: data.height }

    const btuResult = calculateBtu(feet)
    setResult(btuResult)
    setRecommendations([])

    setLoadingRecs(true)
    try {
      const res = await fetch(`/api/products/by-btu?capacity=${btuResult.recommendedCapacity}&limit=24`)
      if (res.ok) setRecommendations(await res.json())
    } catch { /* silently ignore */ }
    finally { setLoadingRecs(false) }
  }

  const dimLabel = isMetric ? 'm' : 'ft'

  const inputClass  = 'h-11 w-full border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150'
  const fieldRadius = { borderRadius: 2 }

  return (
    <div>
      {/* Metric / Imperial toggle */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 w-fit mb-6 text-sm font-medium" style={{ borderRadius: 2 }}>
        <button
          type="button"
          onClick={() => switchUnit('metric')}
          className={`px-4 py-1.5 transition-colors duration-150 ${isMetric ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          style={{ borderRadius: 2 }}
        >
          Metric (m)
        </button>
        <button
          type="button"
          onClick={() => switchUnit('imperial')}
          className={`px-4 py-1.5 transition-colors duration-150 ${!isMetric ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          style={{ borderRadius: 2 }}
        >
          Imperial (ft)
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Dimensions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {(['length', 'width', 'height'] as const).map(field => {
            const raw = values[field]
            const feetValue = isMetric && typeof raw === 'number' && raw > 0
              ? metresToFeet(raw).toFixed(2)
              : null
            return (
              <div key={field} className="flex flex-col gap-1.5">
                <label htmlFor={field} className="text-sm font-medium text-slate-700">
                  {DIM_META[field].label} ({dimLabel})
                </label>
                <input
                  id={field}
                  type="number" step="0.1"
                  {...register(field, { valueAsNumber: true })}
                  className={inputClass} style={fieldRadius}
                  placeholder={field === 'height' ? (isMetric ? '2.7' : '8.9') : field === 'length' ? (isMetric ? '5.0' : '16.4') : (isMetric ? '4.0' : '13.1')}
                />
                {/* Metric mode: read-only converted feet shown underneath */}
                {isMetric && (
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    aria-label={`${DIM_META[field].label} in feet (converted)`}
                    value={feetValue != null ? `= ${feetValue} ft` : ''}
                    placeholder="= ft"
                    className="h-8 w-full border border-slate-100 bg-slate-50 px-3 text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                    style={fieldRadius}
                  />
                )}
                {errors[field] && (
                  <p className="text-xs text-red-500">{errors[field]?.message as string}</p>
                )}
              </div>
            )
          })}
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full text-base" loading={isSubmitting}>
          Calculate My BTU Requirement
        </Button>
      </form>

      {result && (
        <div className="mt-10 space-y-8">
          {/* Result cards */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100 p-4 sm:p-6 overflow-hidden" style={{ borderRadius: 2 }}>
            <h2 className="font-display text-xl text-slate-900 mb-1 tracking-[-0.01em]">Your Result</h2>
            <p className="text-sm text-slate-500 mb-5">Based on your room dimensions</p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
              <div className="bg-white border border-blue-100 p-2.5 sm:p-4 text-center min-w-0" style={{ borderRadius: 2 }}>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 tabular-nums truncate">{result.btu.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium">Required Cooling Capacity (BTU/hr)</p>
              </div>
              <div className="bg-white border border-blue-100 p-2.5 sm:p-4 text-center min-w-0" style={{ borderRadius: 2 }}>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 tabular-nums truncate">{result.recommendedCapacity.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium">Recommended AC (BTU)</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              We recommend a <strong>{result.recommendedCapacity.toLocaleString()} BTU</strong> air conditioner for your space.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/quote" className="flex-1">
                <Button variant="brand" className="w-full gap-2">
                  Request a Quote <ArrowRight aria-hidden="true" className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button variant="outline" className="w-full">Browse All Products</Button>
              </Link>
            </div>
          </div>

          {/* Product Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {loadingRecs ? 'Finding matched units…' : recommendations.length > 0 ? `${result.recommendedCapacity.toLocaleString()} BTU units in our range` : 'Browse Our Range'}
              </h3>
              {recommendations.length > 0 && (
                <Link href="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all →
                </Link>
              )}
            </div>

            {loadingRecs && (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 aria-hidden="true" className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm text-slate-500">Matching systems to your room…</span>
              </div>
            )}

            {!loadingRecs && recommendations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map(product => {
                  const img = product.images?.find(i => i.is_primary) || product.images?.[0]
                  return (
                    <div key={product.id}
                      className="bg-white border border-slate-200 hover:border-slate-900 overflow-hidden transition-colors duration-300"
                      style={{ borderRadius: 2 }}>
                      {/* Image */}
                      <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
                        {img ? (
                          <Image src={img.url} alt={product.name} width={160} height={140}
                            className="h-full w-full object-contain p-4" />
                        ) : (
                          <div className="text-slate-300 text-sm font-medium">No image</div>
                        )}
                      </div>

                      <div className="p-4">
                        {product.brand && (
                          <p className="text-xs font-semibold text-blue-600 mb-1">{product.brand.name}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-3">
                          {product.name}
                        </p>

                        {/* Specs row */}
                        <div className="flex gap-3 mb-4">
                          {product.cooling_btu && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Zap aria-hidden="true" className="w-3 h-3 text-blue-600" />
                              {product.cooling_btu.toLocaleString()} BTU
                            </div>
                          )}
                        </div>

                        {product.retail_price != null && (
                          <p className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                            <Tag aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" />
                            {new Intl.NumberFormat('en-MT', { style: 'currency', currency: product.currency || 'EUR', maximumFractionDigits: 0 }).format(product.retail_price)}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/products/${product.slug}`}>
                            <Button variant="brand" size="sm" className="w-full text-xs">View Product</Button>
                          </Link>
                          <Link href={`/quote?product=${product.id}`}>
                            <Button variant="outline" size="sm" className="w-full text-xs">Get Quote</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!loadingRecs && recommendations.length === 0 && (
              <div className="p-6 bg-slate-50 border border-slate-100 text-center" style={{ borderRadius: 2 }}>
                <p className="text-sm text-slate-500 mb-4">
                  No products currently listed in this BTU range. Our team can source the right unit for you.
                </p>
                <Link href="/quote">
                  <Button variant="brand" size="sm" className="gap-2">
                    Request a Custom Quote <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Expert advice CTA */}
            <div className="mt-6 p-5 bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderRadius: 2 }}>
              <div>
                <p className="text-sm font-semibold text-slate-900">Need expert advice?</p>
                <p className="text-sm text-slate-500">
                  Call us on{' '}
                  <a href="tel:+35679661889" className="font-semibold text-blue-600 hover:text-blue-700">+356 7966 1889</a>
                  {' '}or request a quote.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href="tel:+35679661889">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone aria-hidden="true" className="w-3.5 h-3.5" /> Call
                  </Button>
                </a>
                <Link href="/quote">
                  <Button variant="brand" size="sm">Request a Quote</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
