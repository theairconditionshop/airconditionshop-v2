'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

function RequestForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestData>({ resolver: zodResolver(requestSchema) })

  async function onSubmit(data: RequestData) {
    const supabase = createClient()
    setError(null)
    const { error: e } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (e) setError(e.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <p className="font-semibold text-slate-900 mb-2">Check your inbox</p>
        <p className="text-sm text-slate-500">We&apos;ve sent a reset link. It expires in 1 hour.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} required />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>Send Reset Link</Button>
    </form>
  )
}

function NewPasswordForm() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetData>({ resolver: zodResolver(resetSchema) })

  async function onSubmit(data: ResetData) {
    setError(null)
    const supabase = createClient()
    const { error: e } = await supabase.auth.updateUser({ password: data.password })
    if (e) setError(e.message)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <p className="font-semibold text-slate-900 mb-2">Password updated</p>
        <Link href="/login" className="text-sm text-sky-600 hover:underline">Sign in with your new password</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="New password" type="password" {...register('password')} error={errors.password?.message} required hint="Minimum 8 characters" />
      <Input label="Confirm password" type="password" {...register('confirm')} error={errors.confirm?.message} required />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>Set New Password</Button>
    </form>
  )
}

function ResetPasswordInner() {
  const params = useSearchParams()
  const hasToken = params.has('access_token') || params.has('code')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">THE AIRCONDITION SHOP</Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {hasToken ? 'Set new password' : 'Reset your password'}
          </h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {hasToken ? <NewPasswordForm /> : <RequestForm />}
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
