'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import OtpInput from '@/components/auth/OtpInput'
import PasswordField, { StrengthMeter, RequirementsList } from '@/components/auth/PasswordField'
import {
  CheckCircle2, ArrowRight, Mail, ArrowLeft, RefreshCw,
} from 'lucide-react'
import { phoneZodField } from '@/lib/phone'
import { passwordSchema } from '@/lib/auth/password'
import OtpHelpNotice from '@/components/auth/OtpHelpNotice'

// ─── Schema ───────────────────────────────────────────────────────────────────

const IDENTIFICATION_TYPES = ['Maltese ID Card', 'Residence Card (TRC)'] as const
type IdentificationType = typeof IDENTIFICATION_TYPES[number]

const ID_NUMBER_PLACEHOLDER: Record<IdentificationType, string> = {
  'Maltese ID Card':       'Enter Maltese ID Card Number',
  'Residence Card (TRC)':  'Enter Residence Card Number',
}

const schema = z.object({
  name:                  z.string().min(2, 'Full name required'),
  email:                 z.string().email('Valid email required'),
  phone:                 phoneZodField,
  company:               z.string().min(2, 'Company name required'),
  business_type:         z.string().min(1, 'Select your business type'),
  vat_number:            z.string().optional(),
  registration_number:   z.string().optional(),
  identification_type:   z.string().min(1, 'Please select an identification type'),
  identification_number: z.string()
    .min(1, 'Identification Number is required')
    .min(5, 'Identification Number must be at least 5 characters')
    .max(20, 'Identification Number must be 20 characters or fewer'),
  address:               z.string().min(3, 'Business address required'),
  postal_code:           z.string().min(2, 'Postal code required'),
  password:              passwordSchema,
  password_confirm:      z.string(),
  message:               z.string().optional(),
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

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map(n => (
        <div key={n} className="flex items-center gap-2">
          {n > 1 && <div className={`h-px flex-1 w-12 transition-colors duration-300 ${step >= n ? 'bg-blue-500' : 'bg-slate-200'}`} />}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            step > n  ? 'bg-blue-500 text-white' :
            step === n ? 'bg-blue-500 text-white ring-4 ring-blue-100' :
            'bg-slate-100 text-slate-400'
          }`}>
            {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
          </div>
        </div>
      ))}
      <div className="ml-1 flex flex-col">
        <span className="text-xs font-semibold text-slate-700">
          {step === 1 ? 'Your details' : 'Verify email'}
        </span>
        <span className="text-[11px] text-slate-400">
          {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
        </span>
      </div>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-3 mb-4 border-b border-slate-100">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
  )
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start(from = seconds) {
    setRemaining(from)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return { remaining, start }
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 'form' | 'verify'

export default function TradeRegisterForm() {
  const router                      = useRouter()
  const [step, setStep]             = useState<Step>('form')
  const [submittedEmail, setEmail]  = useState('')
  const [otpDigits, setOtpDigits]   = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying]   = useState(false)
  const [resending, setResending]   = useState(false)
  const [otpError, setOtpError]     = useState('')
  const { remaining, start }        = useCountdown(60)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  const passwordValue      = useWatch({ control, name: 'password',             defaultValue: '' })
  const confirmValue       = useWatch({ control, name: 'password_confirm',     defaultValue: '' })
  const identificationTypeValue = useWatch({ control, name: 'identification_type', defaultValue: '' })
  const confirmMatch       = confirmValue.length > 0 && passwordValue === confirmValue
  const idNumberPlaceholder = ID_NUMBER_PLACEHOLDER[identificationTypeValue as IdentificationType] ?? 'Enter your identification number'

  const toggleShowPassword = useCallback(() => {}, []) // PasswordField handles internally

  // ── Step 1: submit form → send verification OTP ────────────────────────────
  async function onSubmit(data: FormData) {
    const res = await fetch('/api/trade/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error || 'Failed to send verification email. Please try again.')
      return
    }

    // Store form data in sessionStorage so it survives the step transition
    sessionStorage.setItem('trade_form', JSON.stringify(data))
    setEmail(data.email)
    start()
    setStep('verify')
  }

  // ── Step 2: verify OTP → complete registration ─────────────────────────────
  async function handleVerify() {
    const code = otpDigits.join('')
    if (code.length !== 6) return
    setOtpError('')
    setVerifying(true)

    // Verify OTP
    const verifyRes = await fetch('/api/trade/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (!verifyRes.ok) {
      const body = await verifyRes.json().catch(() => ({}))
      setOtpError(body?.error || 'Incorrect code. Please try again.')
      setOtpDigits(['', '', '', '', '', ''])
      setVerifying(false)
      return
    }

    // OTP verified — now submit the full application
    const formData: FormData | null = JSON.parse(sessionStorage.getItem('trade_form') || 'null')
    if (!formData) {
      setOtpError('Session expired. Please go back and fill in the form again.')
      setVerifying(false)
      return
    }

    const registerRes = await fetch('/api/trade/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setVerifying(false)

    if (!registerRes.ok) {
      const body = await registerRes.json().catch(() => ({}))
      toast.error(body?.error || 'Something went wrong. Please try again.')
      return
    }

    sessionStorage.removeItem('trade_form')

    // Redirect to dedicated success page with context in URL
    const params = new URLSearchParams({
      email:     formData.email,
      name:      formData.name,
      company:   formData.company,
      submitted: new Date().toISOString(),
    })
    router.push(`/trade/application-submitted?${params.toString()}`)
  }

  async function handleResend() {
    if (remaining > 0 || resending) return
    setResending(true)
    setOtpError('')

    const formData: FormData | null = JSON.parse(sessionStorage.getItem('trade_form') || 'null')
    const email = formData?.email || submittedEmail

    const res = await fetch('/api/trade/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setResending(false)

    if (res.ok) {
      setOtpDigits(['', '', '', '', '', ''])
      start()
      toast.success('A new code has been sent to your email.')
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error || 'Failed to resend. Please try again.')
    }
  }

  // ── Verify email step ──────────────────────────────────────────────────────
  if (step === 'verify') {
    const code = otpDigits.join('')
    return (
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
          <Mail className="w-7 h-7 text-blue-500" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Verify your email</h2>
        <p className="text-sm text-slate-500 text-center mb-1 leading-relaxed">
          We&apos;ve sent a 6-digit code to
        </p>
        <p className="text-sm font-semibold text-slate-800 text-center mb-7">{submittedEmail}</p>

        {/* OTP input */}
        <div className="w-full">
          <OtpInput
            value={otpDigits}
            onChange={setOtpDigits}
            error={!!otpError}
            disabled={verifying}
          />
          {otpError && (
            <p className="mt-3 text-center text-sm text-red-500" role="alert">{otpError}</p>
          )}
          <p className="mt-3 text-center text-xs text-slate-400">
            Code expires in 10 minutes
          </p>
        </div>

        {/* Verify button */}
        <Button
          onClick={handleVerify}
          variant="brand"
          size="lg"
          className="w-full mt-6"
          loading={verifying}
          disabled={code.length !== 6 || verifying}
        >
          Verify & Submit Application
        </Button>

        {/* Resend */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={remaining > 0 || resending}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending…' : remaining > 0 ? `Resend in ${remaining}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('form'); setOtpDigits(['', '', '', '', '', '']); setOtpError('') }}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change email
          </button>
        </div>

        <OtpHelpNotice />
      </div>
    )
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <StepIndicator step={1} />

      {/* Personal Information */}
      <section>
        <SectionHeading title="Personal Information" description="Your contact details" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name"     required {...register('name')}  error={errors.name?.message} />
            <Input label="Email address" type="email" required {...register('email')} error={errors.email?.message} />
          </div>
          <div className="sm:w-1/2 sm:pr-2">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label="Phone number"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.phone?.message}
                  required
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* Business Information */}
      <section>
        <SectionHeading title="Business Information" description="Details about your company" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Company name" required {...register('company')} error={errors.company?.message} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="business_type" className="text-sm font-medium text-slate-700">
                Business type <span className="text-red-500">*</span>
              </label>
              <select
                id="business_type"
                {...register('business_type')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.business_type && (
                <p className="text-xs text-red-500" role="alert">{errors.business_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="VAT number" placeholder="MT·········" {...register('vat_number')} error={errors.vat_number?.message} />
            <Input label="Registration number" placeholder="Optional" {...register('registration_number')} error={errors.registration_number?.message} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Identification Type dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="identification_type" className="text-sm font-medium text-slate-700">
                Identification Type <span className="text-red-500">*</span>
              </label>
              <select
                id="identification_type"
                {...register('identification_type')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
              >
                <option value="">Select…</option>
                {IDENTIFICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.identification_type && (
                <p className="text-xs text-red-500" role="alert">{errors.identification_type.message}</p>
              )}
            </div>

            {/* Identification Number — placeholder changes with type */}
            {(() => {
              const field = register('identification_number')
              return (
                <Input
                  label="Identification Number"
                  required
                  placeholder={idNumberPlaceholder}
                  {...field}
                  onChange={e => {
                    e.target.value = e.target.value.trimStart().toUpperCase()
                    field.onChange(e)
                  }}
                  error={errors.identification_number?.message}
                />
              )
            })()}
          </div>

          <Input
            label="Business address"
            required
            placeholder="Street address, building"
            {...register('address')}
            error={errors.address?.message}
          />

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

      {/* Account Security */}
      <section>
        <SectionHeading title="Account Security" description="Set a password for your trade account" />
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div>
            <PasswordField
              label="Password"
              required
              autoComplete="new-password"
              placeholder="Create a password"
              value={passwordValue ?? ''}
              {...register('password')}
              error={errors.password?.message}
            />
            <StrengthMeter value={passwordValue ?? ''} />
            <RequirementsList value={passwordValue ?? ''} />
          </div>

          <div className="flex flex-col gap-1.5">
            <PasswordField
              label="Confirm password"
              required
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmValue ?? ''}
              {...register('password_confirm')}
              error={errors.password_confirm?.message}
            />
            {!errors.password_confirm && confirmMatch && (
              <p className="flex items-center gap-1 text-xs text-green-600 mt-1" aria-live="polite">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Passwords match
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Additional Notes */}
      <section>
        <SectionHeading title="Additional Notes" description="Optional — anything else you'd like us to know" />
        <textarea
          rows={3}
          placeholder="Tell us about your business and the products you typically work with…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-150"
          {...register('message')}
        />
      </section>

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting} disabled={!isValid || isSubmitting}>
        Continue to Email Verification <ArrowRight className="w-4 h-4" />
      </Button>

      <p className="text-center text-xs text-slate-400">
        We will send a verification code to your email address before submitting your application.
      </p>
    </form>
  )
}
