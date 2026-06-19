'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { calculateBtu, type BtuResult } from '@/lib/btu/calculator'

const schema = z.object({
  length:      z.number().min(1, 'Enter room length'),
  width:       z.number().min(1, 'Enter room width'),
  height:      z.number().min(1.5).max(10),
  roomType:    z.enum(['bedroom', 'living', 'kitchen', 'office', 'commercial']),
  occupancy:   z.enum(['1-2', '3-5', '6+']),
  sunExposure: z.enum(['shaded', 'partial', 'full_sun']),
})

type FormData = z.infer<typeof schema>

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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { height: 2.7, roomType: 'bedroom', occupancy: '1-2', sunExposure: 'partial' },
  })

  function onSubmit(data: FormData) {
    setResult(calculateBtu(data))
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
            <select {...register('roomType')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
              {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Occupants</label>
            <select {...register('occupancy')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
              {OCCUPANCY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Sun exposure</label>
          <select {...register('sunExposure')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
            {SUN_EXPOSURE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full">Calculate</Button>
      </form>

      {result && (
        <div className="mt-8 p-6 rounded-2xl bg-sky-50 border border-sky-100">
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
              <p className="text-2xl font-bold text-sky-600">{result.recommendedBtuRange.min.toLocaleString()}–{result.recommendedBtuRange.max.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Recommended BTU range</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            We recommend a unit in the <strong>{result.recommendedBtuRange.min.toLocaleString()}–{result.recommendedBtuRange.max.toLocaleString()} BTU</strong>{' '}
            ({(result.recommendedBtuRange.min / 3412).toFixed(1)}–{(result.recommendedBtuRange.max / 3412).toFixed(1)} kW) range for your room.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products" className="flex-1">
              <Button variant="brand" className="w-full">Browse Matching Units</Button>
            </Link>
            <Link href="/quote" className="flex-1">
              <Button variant="outline" className="w-full">Request a Quote</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
