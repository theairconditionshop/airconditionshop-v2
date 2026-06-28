'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import OtpInput from '@/components/auth/OtpInput'
import OtpHelpNotice from '@/components/auth/OtpHelpNotice'
import PasswordField, { StrengthMeter, RequirementsList, getPasswordRequirements } from '@/components/auth/PasswordField'
import { CheckCircle2, Mail, KeyRound, RefreshCw, ArrowLeft } from 'lucide-react'

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  function start(from = seconds) {
    setRemaining(from)
    if (ref.current) clearInterval(ref.current)
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])
  return { remaining, start }
}

// ─── Brand header ─────────────────────────────────────────────────────────────

function BrandHeader() {
  return (
    <div className="text-center mb-8">
      <Link href="/">
        <span className="text-[11px] font-bold tracking-[0.14em] text-[#0F6FFF] uppercase">
          THE AIRCONDITION SHOP
        </span>
      </Link>
    </div>
  )
}

// ─── Step 1: Enter email ──────────────────────────────────────────────────────

function RequestStep({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body?.error || 'Failed to send reset code. Please try again.')
      return
    }

    onNext(email)
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
            Send Reset Code
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500">
          <Link href="/login" className="text-blue-600 hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </>
  )
}

// ─── Step 2: Enter OTP ────────────────────────────────────────────────────────

function OtpStep({
  email,
  onNext,
  onBack,
}: {
  email: string
  onNext: () => void
  onBack: () => void
}) {
  const [digits, setDigits]   = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]     = useState('')
  const { remaining, start }  = useCountdown(60)
  const code = digits.join('')

  useEffect(() => { start() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleVerify() {
    if (code.length !== 6) return
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/verify-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    setLoading(false)

    if (res.ok) {
      onNext()
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body?.error || 'Incorrect code. Please try again.')
      setDigits(['', '', '', '', '', ''])
    }
  }

  // Auto-submit on 6 digits
  useEffect(() => {
    if (code.length === 6 && !loading) handleVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  async function handleResend() {
    if (remaining > 0 || resending) return
    setResending(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setResending(false)

    if (res.ok) {
      setDigits(['', '', '', '', '', ''])
      start()
    } else {
      setError('Could not resend. Please try again.')
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Check your email</h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          We sent a 6-digit code to<br />
          <strong className="text-slate-800">{email}</strong>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <OtpInput value={digits} onChange={setDigits} error={!!error} disabled={loading} />

        {error && (
          <p className="mt-3 text-center text-sm text-red-500" role="alert">{error}</p>
        )}
        <p className="mt-2 text-center text-xs text-slate-400">Code expires in 10 minutes</p>

        <Button
          onClick={handleVerify}
          variant="brand"
          size="lg"
          className="w-full mt-6"
          loading={loading}
          disabled={code.length !== 6 || loading}
        >
          Continue
        </Button>

        <div className="mt-5 flex flex-col items-center gap-3">
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
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Use a different email
          </button>
        </div>

        <OtpHelpNotice />
      </div>
    </>
  )
}

// ─── Step 3: Set new password ─────────────────────────────────────────────────

function NewPasswordStep({ onNext }: { onNext: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const req = getPasswordRequirements(password)
  const allMet = Object.values(req).every(Boolean)
  const matches = password === confirm && confirm.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!allMet) { setError('Password does not meet all requirements.'); return }
    if (!matches) { setError('Passwords do not match.'); return }

    setLoading(true)
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)

    if (res.ok) {
      onNext()
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body?.error || 'Failed to update password. Please try again.')
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Choose a new password</h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Make it strong and unique.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <PasswordField
              label="New password"
              required
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <StrengthMeter value={password} />
            <RequirementsList value={password} />
          </div>

          <PasswordField
            label="Confirm password"
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={confirm && !matches ? 'Passwords do not match' : undefined}
          />

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={!allMet || !matches}
          >
            Set New Password
          </Button>
        </form>
      </div>
    </>
  )
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────

function SuccessStep() {
  return (
    <>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Password updated</h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Your password has been successfully changed.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-sm text-slate-500 mb-6">
          You can now sign in with your new password.
        </p>
        <Link href="/login">
          <Button variant="brand" size="lg" className="w-full">
            Sign in
          </Button>
        </Link>
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ResetStep = 'request' | 'otp' | 'password' | 'success'

function ResetPasswordFlow() {
  const [step,  setStep]  = useState<ResetStep>('request')
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] px-4 py-12">
      <div className="w-full max-w-md">
        <BrandHeader />

        {step === 'request'  && <RequestStep  onNext={e => { setEmail(e); setStep('otp') }} />}
        {step === 'otp'      && <OtpStep      email={email} onNext={() => setStep('password')} onBack={() => setStep('request')} />}
        {step === 'password' && <NewPasswordStep onNext={() => setStep('success')} />}
        {step === 'success'  && <SuccessStep />}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordFlow />
    </Suspense>
  )
}
