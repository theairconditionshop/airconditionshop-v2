'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { calculateBtu, type BtuResult } from '@/lib/btu/calculator'
import { ArrowRight, Loader2, Tag, Zap, Thermometer, Star } from 'lucide-react'

const M_TO_FT = 3.28084

// Metric schema (metres)
const schemaMetric = z.object({
  length:      z.number().min(1, 'Enter room length'),
  width:       z.number().min(1, 'Enter room width'),
  height:      z.number().min(1.5).max(10),
  roomType:    z.enum(['bedroom', 'living', 'kitchen', 'office', 'commercial']),
  occupancy:   z.enum(['1-2', '3-5', '6+']),
  sunExposure: z.enum(['shaded', 'partial', 'full_sun']),
})

// Imperial schema (feet) — same fields, different labels/validation
const schemaImperial = z.object({
  length:      z.number().min(1, 'Enter room length'),
  width:       z.number().min(1, 'Enter room width'),
  height:      z.number().min(5).max(33),
  roomType:    z.enum(['bedroom', 'living', 'kitchen', 'office', 'commercial']),
  occupancy:   z.enum(['1-2', '3-5', '6+']),
  sunExposure: z.enum(['shaded', 'partial', 'full_sun']),
})

type FormData = z.infer<typeof schemaMetric>

interface RecommendedProduct {
  id: string; name: string; slug: string
  cooling_btu: number | null; retail_price: number | null; currency: string
  energy_rating: string | null; room_size_min: number | null; room_size_max: number | null
  brand?: { name: string; slug: string }
  images?: { url: string; is_primary: boolean }[]
}

const ROOM_TYPES = [
  { value: 'bedroom',    label: 'Bedroom' },
  { value: 'living',     label: 'Living Room' },
  { value: 'kitchen',    label: 'Kitchen' },
  { value: 'office',     label: 'Office / Study' },
  { value: 'commercial', label: 'Commercial Space' },
]
const OCCUPANCY_OPTS = [
  { value: '1-2', label: '1–2 people' },
  { value: '3-5', label: '3–5 people' },
  { value: '6+',  label: '6+ people' },
]
const SUN_EXPOSURE = [
  { value: 'shaded',   label: 'Low — north facing / shaded' },
  { value: 'partial',  label: 'Moderate — partial sun' },
  { value: 'full_sun', label: 'High — south/west facing, full sun' },
]

function SelectField({ label, id, children, className }: {
  label: string; id: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

export default function BtuCalculatorForm() {
  const [unit, setUnit]                     = useState<'metric' | 'imperial'>('metric')
  const [result, setResult]                 = useState<BtuResult | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [loadingRecs, setLoadingRecs]       = useState(false)

  const isMetric = unit === 'metric'
  const schema   = isMetric ? schemaMetric : schemaImperial

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { height: isMetric ? 2.7 : 8.9, roomType: 'bedroom', occupancy: '1-2', sunExposure: 'partial' },
  })

  function switchUnit(next: 'metric' | 'imperial') {
    setUnit(next)
    setResult(null)
    setRecommendations([])
    reset({ height: next === 'metric' ? 2.7 : 8.9, roomType: 'bedroom', occupancy: '1-2', sunExposure: 'partial' })
  }

  async function onSubmit(data: FormData) {
    // Convert imperial → metric before calculating
    const metricData = isMetric ? data : {
      ...data,
      length: data.length / M_TO_FT,
      width:  data.width  / M_TO_FT,
      height: data.height / M_TO_FT,
    }
    const btuResult = calculateBtu(metricData)
    setResult(btuResult)
    setRecommendations([])

    setLoadingRecs(true)
    try {
      const res = await fetch(
        `/api/products/by-btu?min=${btuResult.recommendedBtuRange.min}&max=${btuResult.recommendedBtuRange.max}&limit=4`
      )
      if (res.ok) setRecommendations(await res.json())
    } catch { /* silently ignore */ }
    finally { setLoadingRecs(false) }
  }

  const dimLabel = isMetric ? 'm' : 'ft'

  const selectClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors'
  const inputClass  = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors'

  return (
    <div>
      {/* Metric / Imperial toggle */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => switchUnit('metric')}
          className={`px-4 py-1.5 rounded-lg transition-all duration-150 ${isMetric ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Metric (m)
        </button>
        <button
          type="button"
          onClick={() => switchUnit('imperial')}
          className={`px-4 py-1.5 rounded-lg transition-all duration-150 ${!isMetric ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Imperial (ft)
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Dimensions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {(['length', 'width', 'height'] as const).map(field => (
            <div key={field} className="flex flex-col gap-1.5">
              <label htmlFor={field} className="text-sm font-medium text-slate-700 capitalize">
                {field === 'length' ? 'Room length' : field === 'width' ? 'Room width' : 'Ceiling height'} ({dimLabel})
              </label>
              <input
                id={field}
                type="number" step="0.1"
                {...register(field, { valueAsNumber: true })}
                className={inputClass}
                placeholder={field === 'height' ? (isMetric ? '2.7' : '8.9') : field === 'length' ? (isMetric ? '5.0' : '16.4') : (isMetric ? '4.0' : '13.1')}
              />
              {errors[field] && (
                <p className="text-xs text-red-500">{errors[field]?.message as string}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField label="Room type" id="roomType">
            <select id="roomType" {...register('roomType')} className={selectClass}>
              {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </SelectField>
          <SelectField label="Number of occupants" id="occupancy">
            <select id="occupancy" {...register('occupancy')} className={selectClass}>
              {OCCUPANCY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </SelectField>
        </div>

        <SelectField label="Sun exposure" id="sunExposure">
          <select id="sunExposure" {...register('sunExposure')} className={selectClass}>
            {SUN_EXPOSURE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </SelectField>

        <Button type="submit" variant="brand" size="lg" className="w-full text-base" loading={isSubmitting}>
          Calculate My BTU Requirement
        </Button>
      </form>

      {result && (
        <div className="mt-10 space-y-8">
          {/* Result cards */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-6">
            <h2 className="font-bold text-slate-900 text-xl mb-1">Your Result</h2>
            <p className="text-sm text-slate-500 mb-5">Based on your room measurements and conditions</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl border border-sky-100 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-sky-600 tabular-nums">{result.btu.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">BTU/hr</p>
              </div>
              <div className="bg-white rounded-2xl border border-sky-100 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-sky-600">{result.kw.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">kW output</p>
              </div>
              <div className="bg-white rounded-2xl border border-sky-100 p-4 text-center shadow-sm">
                <p className="text-lg font-bold text-sky-600 leading-tight tabular-nums">
                  {result.recommendedBtuRange.min.toLocaleString()}–{result.recommendedBtuRange.max.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Recommended BTU</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              We recommend a unit between <strong>{result.recommendedBtuRange.min.toLocaleString()} – {result.recommendedBtuRange.max.toLocaleString()} BTU</strong>{' '}
              ({(result.recommendedBtuRange.min / 3412).toFixed(1)} – {(result.recommendedBtuRange.max / 3412).toFixed(1)} kW) for your space.
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
                {loadingRecs ? 'Finding matched units…' : recommendations.length > 0 ? 'Systems Matched To Your Room' : 'Browse Our Range'}
              </h3>
              {recommendations.length > 0 && (
                <Link href="/products" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                  View all →
                </Link>
              )}
            </div>

            {loadingRecs && (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 aria-hidden="true" className="w-5 h-5 text-sky-500 animate-spin" />
                <span className="text-sm text-slate-500">Matching systems to your room…</span>
              </div>
            )}

            {!loadingRecs && recommendations.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.map(product => {
                  const img = product.images?.find(i => i.is_primary) || product.images?.[0]
                  return (
                    <div key={product.id}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-sky-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      {/* Image */}
                      <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
                        {img ? (
                          <Image src={img.url} alt={product.name} width={160} height={140}
                            className="h-full w-full object-contain p-4" />
                        ) : (
                          <div className="text-slate-300 text-sm font-medium">No image</div>
                        )}
                        {product.energy_rating && (
                          <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                              <Star aria-hidden="true" className="w-3 h-3" /> {product.energy_rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {product.brand && (
                          <p className="text-xs font-semibold text-sky-600 mb-1">{product.brand.name}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-3">
                          {product.name}
                        </p>

                        {/* Specs row */}
                        <div className="flex gap-3 mb-4">
                          {product.cooling_btu && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Zap aria-hidden="true" className="w-3 h-3 text-sky-500" />
                              {product.cooling_btu.toLocaleString()} BTU
                            </div>
                          )}
                          {(product.room_size_min || product.room_size_max) && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Thermometer aria-hidden="true" className="w-3 h-3 text-sky-500" />
                              {product.room_size_min && product.room_size_max
                                ? `${product.room_size_min}–${product.room_size_max}m²`
                                : product.room_size_max ? `Up to ${product.room_size_max}m²` : ''}
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
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
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
          </div>
        </div>
      )}
    </div>
  )
}
