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
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  Phone as PhoneIcon,
} from 'lucide-react'

// ─── Validation schema ────────────────────────────────────────────────────────
const schema = z.object({
  name:             z.string().min(2, 'Name required'),
  email:            z.string().email('Valid email required'),
  phone:            z.string().min(4, 'Phone required'),
  company:          z.string().min(2, 'Company name required'),
  vat_number:       z.string().optional(),
  business_type:    z.string().min(1, 'Select your business type'),
  message:          z.string().optional(),
  password:         z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password cannot exceed 20 characters'),
  password_confirm: z.string(),
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

interface StrengthInfo {
  level: StrengthLevel
  label: string
  color: string        // bar fill colour (Tailwind bg class)
  textColor: string    // text colour class
  segments: number     // filled segments out of 5
}

interface Requirements {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

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

  const isHighlySecure = info.level >= 3

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite" aria-label={`Password strength: ${info.label}`}>
      {/* Bar */}
      <div className="flex gap-1" role="img" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < info.segments ? info.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${info.textColor}`}>{info.label}</span>
        {isHighlySecure && (
          <span className="text-xs text-green-600 font-medium">
            Excellent choice. This password is highly secure.
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────
export default function TradeRegisterForm() {
  const [sent, setSent]                         = useState(false)
  const [showPassword, setShowPassword]         = useState(false)
  const [showConfirm, setShowConfirm]           = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  const passwordValue = useWatch({ control, name: 'password',         defaultValue: '' })
  const confirmValue  = useWatch({ control, name: 'password_confirm', defaultValue: '' })

  const requirements = getRequirements(passwordValue ?? '')

  const confirmMatch = confirmValue.length > 0 && passwordValue === confirmValue
  const confirmMiss  = confirmValue.length > 0 && passwordValue !== confirmValue

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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Trade Application Submitted</h2>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-2">
          Thank you for applying for a Trade Account.
        </p>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
          Our team will review your application and contact you shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/">
            <Button variant="brand" size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4" /> Return Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <PhoneIcon className="w-4 h-4" /> Contact Us
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full name"  {...register('name')}  error={errors.name?.message}  required />
        <Input label="Email"      type="email" {...register('email')} error={errors.email?.message} required />
      </div>

      {/* Phone + Company */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} required placeholder="+356 ···· ····" />
        <Input label="Company name" {...register('company')} error={errors.company?.message} required />
      </div>

      {/* VAT + Business type */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="VAT number" {...register('vat_number')} placeholder="MT·········" />
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

      {/* Password row */}
      <div className="grid sm:grid-cols-2 gap-4 items-start">
        {/* Password field */}
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
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              maxLength={20}
              className={[
                'flex h-10 w-full rounded-lg border bg-white px-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
                errors.password
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : 'border-slate-200',
              ].join(' ')}
              placeholder="Create a password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={togglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded transition-colors duration-150 cursor-pointer"
              tabIndex={0}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                : <Eye    className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password
            ? <p id="password-error" className="text-xs text-red-500" role="alert">{errors.password.message}</p>
            : <p id="password-hint" className="text-xs text-slate-400">8–20 characters</p>}

          {/* Strength meter */}
          <StrengthMeter value={passwordValue ?? ''} />

          {/* Requirements checklist */}
          {(passwordValue?.length ?? 0) > 0 && (
            <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Password requirements</p>
              <ul className="space-y-1.5">
                <ReqItem met={requirements.length}    label="8+ characters" />
                <ReqItem met={requirements.uppercase} label="Uppercase letter" />
                <ReqItem met={requirements.lowercase} label="Lowercase letter" />
                <ReqItem met={requirements.number}    label="Number" />
                <ReqItem met={requirements.special}   label="Special character" />
              </ul>
            </div>
          )}
        </div>

        {/* Confirm password field */}
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
              aria-describedby={errors.password_confirm ? 'confirm-error' : confirmMatch ? 'confirm-match' : undefined}
              className={[
                'flex h-10 w-full rounded-lg border bg-white px-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
                errors.password_confirm
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : confirmMatch
                    ? 'border-green-400 focus:ring-green-400 focus:border-green-400'
                    : 'border-slate-200',
              ].join(' ')}
              placeholder="Repeat your password"
              {...register('password_confirm')}
            />
            <button
              type="button"
              onClick={toggleConfirm}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded transition-colors duration-150 cursor-pointer"
              tabIndex={0}
            >
              {showConfirm
                ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                : <Eye    className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          {/* Live match indicator */}
          {errors.password_confirm ? (
            <p id="confirm-error" className="flex items-center gap-1 text-xs text-red-500" role="alert">
              <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.password_confirm.message}
            </p>
          ) : confirmMatch ? (
            <p id="confirm-match" className="flex items-center gap-1 text-xs text-green-600" aria-live="polite">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Passwords match
            </p>
          ) : confirmMiss ? (
            <p className="flex items-center gap-1 text-xs text-red-500" aria-live="polite">
              <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Passwords do not match
            </p>
          ) : null}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-slate-700">Additional notes</label>
        <textarea
          id="message"
          rows={3}
          placeholder="Tell us about your business and the products you typically work with…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none transition-colors duration-150"
          {...register('message')}
        />
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Submit Application <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  )
}
