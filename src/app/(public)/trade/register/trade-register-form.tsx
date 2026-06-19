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
  name:          z.string().min(2, 'Name required'),
  email:         z.string().email('Valid email required'),
  phone:         z.string().min(4, 'Phone required'),
  company:       z.string().min(2, 'Company name required'),
  vat_number:    z.string().optional(),
  business_type: z.string().min(1, 'Select your business type'),
  message:       z.string().optional(),
  password:      z.string().min(8, 'Minimum 8 characters'),
  password_confirm: z.string(),
}).refine(d => d.password === d.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

type FormData = z.infer<typeof schema>

const BUSINESS_TYPES = [
  'HVAC Installer / Engineer',
  'Refrigeration Engineer',
  'Electrical Contractor',
  'Facilities Management',
  'Hotel / Hospitality',
  'Construction / Developer',
  'Other',
]

export default function TradeRegisterForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/trade/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSent(true)
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error || 'Something went wrong. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Application submitted!</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          We&apos;ll review your application within 2 business days. You&apos;ll receive an email once your trade account is activated.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} required />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} required placeholder="+356 ···· ····" />
        <Input label="Company name" {...register('company')} error={errors.company?.message} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="VAT number" {...register('vat_number')} placeholder="MT·········" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Business type <span className="text-red-500">*</span></label>
          <select {...register('business_type')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Select…</option>
            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.business_type && <p className="text-xs text-red-500">{errors.business_type.message}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} required />
        <Input label="Confirm password" type="password" {...register('password_confirm')} error={errors.password_confirm?.message} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Additional notes</label>
        <textarea {...register('message')} rows={3}
          placeholder="Tell us about your business and the products you typically work with…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
      </div>
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Submit Application
      </Button>
    </form>
  )
}
