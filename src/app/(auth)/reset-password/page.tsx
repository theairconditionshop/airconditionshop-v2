'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

const requestSchema = z.object({ email: z.string().email('Valid email required') })
const resetSchema   = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type RequestData = z.infer<typeof requestSchema>
type ResetData   = z.infer<typeof resetSchema>

// Convert any Supabase error to a human-readable string.
// Supabase occasionally returns error objects whose .message is a raw JSON
// string like "{}" when its own email delivery fails — we never pass that
// raw value to the UI.
function toErrorMessage(e: unknown): string {
  if (!e) return 'An unexpected error occurred. Please try again.'
  if (typeof e === 'string' && e.trim() && e !== '{}') return e
  if (e instanceof Error && e.message && e.message !== '{}') return e.message
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>
    if (typeof obj.message === 'string' && obj.message.trim() && obj.message !== '{}') {
      return obj.message
    }
    // Supabase AuthApiError: sometimes status 500 with no message
    if (typeof obj.status === 'number' && obj.status >= 500) {
      return 'Email service temporarily unavailable. Please try again in a few minutes.'
    }
    if (typeof obj.status === 'number' && obj.status === 429) {
      return 'Too many attempts. Please wait a few minutes before trying again.'
    }
  }
  return 'Failed to send reset link. Please try again.'
}

function RequestForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RequestData>({ resolver: zodResolver(requestSchema) })

  async function onSubmit(data: RequestData) {
    setError(null)
    console.log('[reset-password] Requesting reset for:', data.email)

    try {
      const supabase = createClient()
      // redirectTo must point to /auth/callback so the PKCE code is exchanged
      // for a session before the user reaches this page to set a new password.
      const { error: e } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (e) {
        // Log the full error object so it shows in browser devtools
        console.error('[reset-password] Supabase error:', JSON.stringify(e), e)
        setError(toErrorMessage(e))
      } else {
        console.log('[reset-password] Reset email request succeeded (Supabase always returns success for security)')
        setSent(true)
      }
    } catch (err) {
      console.error('[reset-password] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <p className="font-semibold text-slate-900 mb-2">Check your inbox</p>
        <p className="text-sm text-slate-500">If an account exists for that email, we&apos;ve sent a reset link. It expires in 1 hour.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        required
      />
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Send Reset Link
      </Button>
    </form>
  )
}

function NewPasswordForm() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ResetData>({ resolver: zodResolver(resetSchema) })

  async function onSubmit(data: ResetData) {
    setError(null)
    console.log('[reset-password] Setting new password')

    try {
      const supabase = createClient()
      const { error: e } = await supabase.auth.updateUser({ password: data.password })
      if (e) {
        console.error('[reset-password] updateUser error:', JSON.stringify(e), e)
        setError(toErrorMessage(e))
      } else {
        console.log('[reset-password] Password updated successfully')
        setDone(true)
      }
    } catch (err) {
      console.error('[reset-password] Unexpected error on updateUser:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <p className="font-semibold text-slate-900 mb-2">Password updated</p>
        <Link href="/login" className="text-sm text-sky-600 hover:underline">
          Sign in with your new password
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="New password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        required
        hint="Minimum 8 characters"
      />
      <Input
        label="Confirm password"
        type="password"
        {...register('confirm')}
        error={errors.confirm?.message}
        required
      />
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
        Set New Password
      </Button>
    </form>
  )
}

function ResetPasswordInner() {
  // After the auth/callback route exchanges the PKCE code for a session, the
  // user arrives here with no token in the URL — the session lives in a cookie.
  // We detect an active session to decide which form to show.
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      console.log('[reset-password] Session check — user:', user?.email ?? 'none', 'error:', error?.message ?? 'none')
      setHasSession(!!user)
    })
  }, [])

  if (hasSession === null) {
    return <div className="py-8 text-center text-slate-400 text-sm">Loading…</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">
            THE AIRCONDITION SHOP
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {hasSession ? 'Set new password' : 'Reset your password'}
          </h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {hasSession ? <NewPasswordForm /> : <RequestForm />}
          <p className="mt-6 text-sm text-center text-slate-500">
            <Link href="/login" className="text-sky-600 hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  )
}
