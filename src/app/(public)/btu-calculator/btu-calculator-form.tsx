'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { calculateBtu, type BtuResult } from '@/lib/btu/calculator'
import { ArrowRight, Loader2, Tag } from 'lucide-react'

const schema = z.object({
  length:      z.number().min(1, 'Enter room length'),
  width:       z.number().min(1, 'Enter room width'),
  height:      z.number().min(1.5).max(10),
  roomType:    z.enum(['bedroom', 'living', 'kitchen', 'office', 'commercial']),
  occupancy:   z.enum(['1-2', '3-5', '6+']),
  sunExposure: z.enum(['shaded', 'partial', 'full_sun']),
})

type FormData = z.infer<typeof schema>

interface RecommendedProduct {
  id: string
  name: string
  slug: string
  cooling_btu: number | null
  retail_price: number | null
  currency: string
  energy_rating: string | null
  brand?: { name: string; slug: string }
  images?: { url: string; is_primary: boolean }[]
}

const ROOM_TYPES = [
  { value: 'bedroom',    label: 'Bedroom' },
  { value: 'living',     label: 'Living Room' },
  { value: 'kitchen',    label: 'Kitchen' },
  { value: 'office',     label: 'Office' },
  { value: 'commercial', label: 'Commercial Space' },
]

const OCCUPANCY_OPTS = [
  { value: '1-2', label: '1–2 people' },
  { value: '3-5', label: '3–5 people' },
  { value: '6+',  label: '6+ people' },
]

const SUN_EXPOSURE = [
  { value: 'shaded',   label: 'Low (north facing / well-shaded)' },
  { value: 'partial',  label: 'Moderate (partial sun)' },
  { value: 'full_sun', label: 'High (south/west facing, full sun)' },
]

export default function BtuCalculatorForm() {
  const [result, setResult] = useState<BtuResult | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { height: 2.7, roomType: 'bedroom', occupancy: '1-2', sunExposure: 'partial' },
  })

  async function onSubmit(data: FormData) {
    const btuResult = calculateBtu(data)
    setResult(btuResult)
    setRecommendations([])

    setLoadingRecs(true)
    try {
      const res = await fetch(
        `/api/products/by-btu?min=${btuResult.recommendedBtuRange.min}&max=${btuResult.recommendedBtuRange.max}&limit=4`
      )
      if (res.ok) {
        const products = await res.json()
        setRecommendations(products)
      }
    } catch {
      // silently ignore — user can still browse products
    } finally {
      setLoadingRecs(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Length (m)" type="number" step="0.1" {...register('length', { valueAsNumber: true })} error={errors.length?.message} required placeholder="5.0" />
          <Input label="Width (m)"  type="number" step="0.1" {...register('width',  { valueAsNumber: true })} error={errors.width?.message}  required placeholder="4.0" />
          <Input label="Height (m)" type="number" step="0.1" {...register('height', { valueAsNumber: true })} placeholder="2.7" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Room type</label>
            <select {...register('roomType')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
              {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Occupants</label>
            <select {...register('occupancy')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
              {OCCUPANCY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Sun exposure</label>
          <select {...register('sunExposure')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
            {SUN_EXPOSURE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
          Calculate My BTU
        </Button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          {/* BTU Result */}
          <div className="p-6 rounded-2xl bg-sky-50 border border-sky-100">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Your Result</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <div className="text-center p-4 bg-white rounded-xl border border-sky-100">
                <p className="text-2xl font-bold text-sky-600">{result.btu.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">BTU/hr</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-sky-100">
                <p className="text-2xl font-bold text-sky-600">{result.kw.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">kW</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-sky-100">
                <p className="text-lg font-bold text-sky-600">{result.recommendedBtuRange.min.toLocaleString()}–{result.recommendedBtuRange.max.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Recommended BTU range</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              We recommend a unit in the <strong>{result.recommendedBtuRange.min.toLocaleString()}–{result.recommendedBtuRange.max.toLocaleString()} BTU</strong>{' '}
              ({(result.recommendedBtuRange.min / 3412).toFixed(1)}–{(result.recommendedBtuRange.max / 3412).toFixed(1)} kW) range for your room.
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
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {loadingRecs ? 'Finding matched units…' : recommendations.length > 0 ? 'Recommended Units For Your Room' : 'Browse Our Range'}
            </h3>

            {loadingRecs && (
              <div className="flex items-center justify-center py-10">
                <Loader2 aria-hidden="true" className="w-6 h-6 text-sky-500 animate-spin" />
              </div>
            )}

            {!loadingRecs && recommendations.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.map(product => {
                  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
                  return (
                    <Link key={product.id} href={`/products/${product.slug}`}
                      className="group flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-sky-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex-none w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
                        {primaryImage ? (
                          <Image src={primaryImage.url} alt={product.name} width={80} height={80}
                            className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-medium">No image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {product.brand && (
                          <p className="text-xs font-semibold text-sky-600 mb-0.5">{product.brand.name}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors duration-200">
                          {product.name}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          {product.cooling_btu && (
                            <span className="text-xs text-slate-500">{product.cooling_btu.toLocaleString()} BTU</span>
                          )}
                          {product.energy_rating && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {product.energy_rating}
                            </span>
                          )}
                        </div>
                        {product.retail_price != null && (
                          <p className="mt-1.5 text-sm font-bold text-slate-900 flex items-center gap-1">
                            <Tag aria-hidden="true" className="w-3 h-3 text-slate-400" />
                            {new Intl.NumberFormat('en-MT', { style: 'currency', currency: product.currency || 'EUR' }).format(product.retail_price)}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {!loadingRecs && recommendations.length === 0 && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-sm text-slate-500 mb-3">
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
