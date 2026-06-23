'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

const schema = z.object({
  name:         z.string().min(2, 'Name required'),
  email:        z.string().email('Valid email required'),
  phone:        z.string().optional(),
  company:      z.string().optional(),
  address:      z.string().optional(),
  service_type: z.string().optional(),
  budget_range: z.string().optional(),
  message:      z.string().min(10, 'Please describe what you need'),
})

type FormData = z.infer<typeof schema>

const SERVICE_TYPES = [
  'Air Conditioning Installation',
  'Multi-Split System',
  'VRF / Commercial HVAC',
  'Refrigeration Equipment',
  'Cold Room',
  'Maintenance / Service',
  'Other',
]

const BUDGET_RANGES = ['Under €500', '€500–€2,000', '€2,000–€10,000', '€10,000+', 'Not sure']

export default function QuoteForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSent(true)
    } else {
      toast.error('Something went wrong. Please try again or call us.')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Quote request received!</h3>
        <p className="text-sm text-slate-500">We&apos;ll review your requirements and send you a detailed quote within 2 business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} required placeholder="Your full name" />
        <Input label="Phone" type="tel" {...register('phone')} placeholder="+356 ···· ····" />
      </div>
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      <Input label="Company" {...register('company')} placeholder="Optional — leave blank if you're a homeowner" />
      <Input label="Property / site address" {...register('address')} placeholder="Where is the installation?" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quote-service-type" className="text-sm font-medium text-slate-700">Service type</label>
          <select id="quote-service-type" {...register('service_type')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Select…</option>
            {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quote-budget-range" className="text-sm font-medium text-slate-700">Budget range</label>
          <select id="quote-budget-range" {...register('budget_range')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Select…</option>
            {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="quote-message" className="text-sm font-medium text-slate-700">
          Project details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="quote-message"
          {...register('message')}
          rows={5}
          placeholder="Describe your requirements — room sizes, number of units, current system, any specific preferences…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Request Free Quote
      </Button>
    </form>
  )
}
