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
  phone:        z.string().min(4, 'Phone required'),
  address:      z.string().min(5, 'Address required'),
  service_type: z.string().min(1, 'Select a service type'),
  description:  z.string().min(10, 'Please describe the issue or job'),
  preferred_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SERVICE_TYPES = [
  'Installation',
  'Maintenance / Service',
  'Repair',
  'Emergency Call-Out',
  'Cold Room',
  'Other',
]

export default function ServiceRequestForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSent(true)
    } else {
      toast.error('Something went wrong. Please call us on +356 7966 1889.')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Request received!</h3>
        <p className="text-sm text-slate-500">We&apos;ll confirm your appointment within 2 business hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} required />
        <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} required placeholder="+356 ···· ····" />
      </div>
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      <Input label="Address" {...register('address')} error={errors.address?.message} required placeholder="Where do you need the service?" />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Service type <span className="text-red-500">*</span></label>
        <select {...register('service_type')}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
          <option value="">Select…</option>
          {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.service_type && <p className="text-xs text-red-500">{errors.service_type.message}</p>}
      </div>

      <Input label="Preferred date" type="date" {...register('preferred_date')} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe the issue or what you need done…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Book Service
      </Button>
    </form>
  )
}
