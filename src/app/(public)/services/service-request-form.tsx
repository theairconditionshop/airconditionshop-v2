'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Phone, Home } from 'lucide-react'
import { phoneZodField } from '@/lib/phone'

// DB constraint: service_type must be one of these exact values
const SERVICE_TYPE_VALUES = ['installation', 'repair', 'maintenance', 'inspection', 'commercial', 'coldroom', 'other'] as const
type ServiceTypeValue = typeof SERVICE_TYPE_VALUES[number]

const SERVICE_OPTIONS: { label: string; value: ServiceTypeValue }[] = [
  { label: 'Installation',        value: 'installation' },
  { label: 'Repair',              value: 'repair' },
  { label: 'Maintenance / Service', value: 'maintenance' },
  { label: 'Inspection',          value: 'inspection' },
  { label: 'Commercial / HVAC',   value: 'commercial' },
  { label: 'Cold Room',           value: 'coldroom' },
  { label: 'Other',               value: 'other' },
]

const schema = z.object({
  name:           z.string().min(2, 'Name required'),
  email:          z.string().email('Valid email required'),
  phone:          phoneZodField,
  address:        z.string().min(5, 'Address required'),
  service_type:   z.enum(SERVICE_TYPE_VALUES, { error: 'Please select a service type' }),
  description:    z.string().min(10, 'Please describe the issue or job (min 10 characters)'),
  preferred_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ServiceRequestForm() {
  const [reference, setReference] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const body = await res.json().catch(() => ({}))

      if (res.ok && body.reference) {
        setReference(body.reference)
      } else if (res.ok) {
        setReference('SR-PENDING')
      } else {
        toast.error(body?.error || 'Something went wrong. Please call us on +356 7966 1889.')
      }
    } catch {
      toast.error('Network error. Please call us on +356 7966 1889.')
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (reference) {
    return (
      <div className="flex flex-col items-center text-center py-6 px-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5 ring-4 ring-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-500" aria-hidden="true" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Thank you. Your service request has been received.
        </h2>

        <p className="text-slate-500 mb-5 max-w-sm leading-relaxed">
          We&apos;ll contact you within 2 business hours to confirm your appointment.
          A confirmation email has been sent to you.
        </p>

        <div className="mb-6 px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl w-full max-w-xs">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">
            Your reference number
          </p>
          <p className="text-xl font-bold text-blue-700 tracking-wide font-mono">
            {reference}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Keep this for your records
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/">
            <Button variant="brand" size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4" /> Return Home
            </Button>
          </Link>
          <a href="tel:+35679661889">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Phone className="w-4 h-4" /> Call Us
            </Button>
          </a>
        </div>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Full name"
          {...register('name')}
          error={errors.name?.message}
          required
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label="Phone"
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.phone?.message}
              required
            />
          )}
        />
      </div>

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <Input
        label="Address"
        {...register('address')}
        error={errors.address?.message}
        required
        placeholder="Where do you need the service?"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="service_type" className="text-sm font-medium text-slate-700">
          Service type <span className="text-red-500">*</span>
        </label>
        <select
          id="service_type"
          {...register('service_type')}
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 cursor-pointer"
          aria-required="true"
          aria-invalid={!!errors.service_type}
        >
          <option value="">Select…</option>
          {SERVICE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.service_type && (
          <p className="text-xs text-red-500" role="alert">{errors.service_type.message}</p>
        )}
      </div>

      <Input
        label="Preferred date"
        type="date"
        {...register('preferred_date')}
        hint="Optional — leave blank if flexible"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          placeholder="Describe the issue or what you need done…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-150"
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500" role="alert">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Book Service
      </Button>
    </form>
  )
}
