'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email:     z.string().email('Valid email required'),
  password:  z.string().min(8, 'Minimum 8 characters'),
})

type FormData = z.infer<typeof schema>

function RegisterForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    })
    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Check your inbox</h3>
        <p className="text-sm text-slate-500">We&apos;ve sent a confirmation link. Click it to activate your account.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Full name" {...register('full_name')} error={errors.full_name?.message} required />
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      <Input label="Password" type="password" {...register('password')} error={errors.password?.message} required hint="Minimum 8 characters" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>Create Account</Button>
      <p className="text-sm text-center text-slate-500">
        Already have an account? <Link href="/login" className="text-sky-600 hover:underline">Sign in</Link>
      </p>
      <p className="text-sm text-center text-slate-500">
        Trade professional? <Link href="/trade/register" className="text-sky-600 hover:underline">Apply for trade account</Link>
      </p>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">THE AIRCONDITION SHOP</Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-500">Save your details for faster checkout and order tracking</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
