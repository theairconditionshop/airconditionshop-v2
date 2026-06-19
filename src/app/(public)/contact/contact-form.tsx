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
  name:    z.string().min(2, 'Name is required'),
  email:   z.string().email('Valid email required'),
  phone:   z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Please provide more detail'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSent(true)
    } else {
      toast.error('Something went wrong. Please try again or call us directly.')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Message sent!</h3>
        <p className="text-sm text-slate-500">We&apos;ll be in touch within 1 business day. For urgent enquiries call <a href="tel:+35679661889" className="text-sky-600 hover:underline">+356 7966 1889</a>.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} required placeholder="John Borg" />
        <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} required placeholder="john@example.com" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Phone" type="tel" {...register('phone')} placeholder="+356 ···· ····" />
        <Input label="Company" {...register('company')} placeholder="Optional" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="Tell us what you need..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Send Message
      </Button>
    </form>
  )
}
