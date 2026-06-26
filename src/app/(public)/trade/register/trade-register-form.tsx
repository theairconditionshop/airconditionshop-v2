'use client'

import { useState, useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, XCircle, Eye, EyeOff, ArrowRight, Home, Phone as PhoneIcon,
} from 'lucide-react'

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  // Personal
  name:                z.string().min(2, 'Full name required'),
  email:               z.string().email('Valid email required'),
  phone:               z.string().min(4, 'Phone number required'),
  // Business
  company:             z.string().min(2, 'Company name required'),
  business_type:       z.string().min(1, 'Select your business type'),
  vat_number:          z.string().optional(),
  registration_number: z.string().optional(),
  address:             z.string().min(3, 'Business address required'),
  postal_code:         z.string().min(2, 'Postal code required'),
  // Account
  password:            z.string()
    .min(8,  'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  password_confirm:    z.string(),
  // Additional
  message:             z.string().optional(),
}).refine(d => d.password === d.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

type FormData = z.infer<typeof schema>

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  'HVAC Installer / Engineer',
  'Refrigeration Engineer',
  'Electrical Contractor',
  'Facilities Management',
  'Hotel / Hospitality',
  'Construction / Developer',
  'Other',
]

// ─── Password strength ────────────────────────────────────────────────────────

type StrengthLevel = 0 | 1 | 2 | 3 | 4
interface StrengthInfo { level: StrengthLevel; label: string; color: string; textColor: string; segments: number }
interface Requirements  { length: boolean; uppercase: boolean; lowercase: boolean; number: boolean; special: boolean }

function getRequirements(value: string): Requirements {
  return {
    length:    value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number:    /[0-9]/.test(value),
    special:   /[^A-Za-z0-9]/.test(value),
  }
}

function getStrength(value: string): StrengthInfo {
  if (!value) return { level: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400', segments: 0 }
  const r = getRequirements(value)
  const score = [r.length, r.uppercase, r.lowercase, r.number, r.special].filter(Boolean).length
  if (score <= 1) return { level: 0, label: 'Weak',     color: 'bg-red-500',    textColor: 'text-red-500',    segments: 1 }
  if (score === 2) return { level: 1, label: 'Fair',     color: 'bg-orange-400', textColor: 'text-orange-500', segments: 2 }
  if (score === 3) return { level: 2, label: 'Good',     color: 'bg-yellow-400', textColor: 'text-yellow-600', segments: 3 }
  if (score === 4) return { level: 3, label: 'Strong',   color: 'bg-blue-500',   textColor: 'text-blue-600',   segments: 4 }
  return             { level: 4, label: 'Strongest', color: 'bg-green-500',  textColor: 'text-green-600',  segments: 5 }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-3 mb-4 border-b border-slate-100">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
  )
}

function ReqItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      {met
        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" aria-hidden="true" />
        : <XCircle      className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true" />}
      <span className={met ? 'text-green-700' : 'text-slate-400'}>{label}</span>
    </li>
  )
}

function StrengthMeter({ value }: { value: string }) {
  const info = getStrength(value)
  if (!value) return null
  return (
    <div className="mt-2 space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < info.segments ? info.color : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${info.textColor}`}>{info.label}</span>
        {info.level >= 3 && <span className="text-xs text-green-600 font-medium">Highly secure</span>}
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function TradeRegisterForm() {
  const [sent, setSent]                 = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  const passwordValue = useWatch({ control, name: 'password',         defaultValue: '' })
  const confirmValue  = useWatch({ control, name: 'password_confirm', defaultValue: '' })

  const requirements  = getRequirements(passwordValue ?? '')
  const confirmMatch  = confirmValue.length > 0 && passwordValue === confirmValue
  const confirmMiss   = confirmValue.length > 0 && passwordValue !== confirmValue

  const togglePassword = useCallback(() => setShowPassword(v => !v), [])
  const toggleConfirm  = useCallback(() => setShowConfirm(v => !v),  [])

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

  // ── Success screen ─────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-6 px-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5 ring-4 ring-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-500" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Application Submitted</h2>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-2">
          Thank you for applying to our Trade Programme.
        </p>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
          Our team will review your application within 2 business days and contact you with a decision.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/"><Button variant="brand" size="lg" className="w-full sm:w-auto"><Home className="w-4 h-4" /> Return Home</Button></Link>
          <Link href="/contact"><Button variant="outline" size="lg" className="w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> Contact Us</Button></Link>
        </div>
      </div>
    )
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>

      {/* ── Personal Information ─────────────────────────────────────────── */}
      <section>
        <SectionHeading title="Personal Information" description="Your contact details" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name"  required {...register('name')}  error={errors.name?.message} />
            <Input label="Email address" type="email" required {...register('email')} error={errors.email?.message} />
          </div>
          <div className="sm:w-1/2 sm:pr-2">
            <Input label="Phone number" type="tel" required placeholder="+356 ···· ····" {...register('phone')} error={errors.phone?.message} />
          </div>
        </div>
      </section>

      {/* ── Business Information ─────────────────────────────────────────── */}
      <section>
        <SectionHeading title="Business Information" description="Details about your company" />
        <div className="space-y-4">

          {/* Company name + Business type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Company name" required {...register('company')} error={errors.company?.message} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="business_type" className="text-sm font-medium text-slate-700">
                Business type <span className="text-red-500">*</span>
              </label>
              <select
                id="business_type"
                {...register('business_type')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-150"
                aria-required="true"
                aria-invalid={!!errors.business_type}
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.business_type && (
                <p className="text-xs text-red-500" role="alert">{errors.business_type.message}</p>
              )}
            </div>
          </div>

          {/* VAT + Registration */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="VAT number" placeholder="MT·········" {...register('vat_number')} error={errors.vat_number?.message} />
            <div className="flex flex-col gap-1.5">
              <Input
                label="Registration number"
                placeholder="Optional"
                {...register('registration_number')}
                error={errors.registration_number?.message}
              />
              <p className="text-xs text-slate-400 -mt-0.5">Company registration number (optional)</p>
            </div>
          </div>

          {/* Business address */}
          <Input
            label="Business address"
            required
            placeholder="Street address, building"
            {...register('address')}
            error={errors.address?.message}
          />

          {/* Postal code — half width */}
          <div className="sm:w-1/2 sm:pr-2">
            <Input
              label="Postal code"
              required
              placeholder="e.g. VLT 1000"
              {...register('postal_code')}
              error={errors.postal_code?.message}
            />
          </div>
        </div>
      </section>

      {/* ── Account Security ─────────────────────────────────────────────── */}
      <section>
        <SectionHeading title="Account Security" description="Set a password for your trade account" />
        <div className="grid sm:grid-cols-2 gap-4 items-start">

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!errors.password}
                className={[
                  'flex h-10 w-full rounded-lg border bg-white px-3 pr-10 py-2 text-sm text-slate-900',
                  'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
                  errors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-200',
                ].join(' ')}
                placeholder="Create a password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={togglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password
              ? <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>
              : <p className="text-xs text-slate-400">Minimum 8 characters</p>}
            <StrengthMeter value={passwordValue ?? ''} />
            {(passwordValue?.length ?? 0) > 0 && (
              <div className="mt-1 rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Requirements</p>
                <ul className="space-y-1">
                  <ReqItem met={requirements.length}    label="8+ characters" />
                  <ReqItem met={requirements.uppercase} label="Uppercase letter" />
                  <ReqItem met={requirements.lowercase} label="Lowercase letter" />
                  <ReqItem met={requirements.number}    label="Number" />
                  <ReqItem met={requirements.special}   label="Special character" />
                </ul>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password_confirm" className="text-sm font-medium text-slate-700">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password_confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!errors.password_confirm}
                className={[
                  'flex h-10 w-full rounded-lg border bg-white px-3 pr-10 py-2 text-sm text-slate-900',
                  'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
                  errors.password_confirm ? 'border-red-400'
                    : confirmMatch        ? 'border-green-400 focus:ring-green-400'
                    : 'border-slate-200',
                ].join(' ')}
                placeholder="Repeat your password"
                {...register('password_confirm')}
              />
              <button
                type="button"
                onClick={toggleConfirm}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password_confirm ? (
              <p className="flex items-center gap-1 text-xs text-red-500" role="alert">
                <XCircle className="w-3.5 h-3.5 shrink-0" /> {errors.password_confirm.message}
              </p>
            ) : confirmMatch ? (
              <p className="flex items-center gap-1 text-xs text-green-600" aria-live="polite">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Passwords match
              </p>
            ) : confirmMiss ? (
              <p className="flex items-center gap-1 text-xs text-red-500" aria-live="polite">
                <XCircle className="w-3.5 h-3.5 shrink-0" /> Passwords do not match
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Additional Notes ─────────────────────────────────────────────── */}
      <section>
        <SectionHeading title="Additional Notes" description="Optional — anything else you'd like us to know" />
        <textarea
          id="message"
          rows={3}
          placeholder="Tell us about your business and the products you typically work with…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none transition-colors duration-150"
          {...register('message')}
        />
      </section>

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Submit Application <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  )
}
