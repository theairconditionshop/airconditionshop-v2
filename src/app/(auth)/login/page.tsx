'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    console.log('[login] Attempting sign-in for:', email)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('[login] Supabase signInWithPassword error:', JSON.stringify(error), 'status:', error.status, 'message:', error.message)
      toast.error('Invalid email or password')
      setLoading(false)
      return
    }

    console.log('[login] Supabase sign-in succeeded — userId:', data.user.id, 'email:', data.user.email, 'email_confirmed_at:', data.user.email_confirmed_at)

    // Check role — API route will set OTP cookie + redirect if admin/staff
    const res = await fetch('/api/auth/post-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ next }),
    })

    const result = await res.json().catch(() => ({}))
    console.log('[login] post-login response — status:', res.status, 'body:', JSON.stringify(result))
    setLoading(false)

    if (!res.ok) {
      toast.error(result.error || 'Login failed. Please try again.')
      return
    }

    if (result.require2fa) {
      router.push('/verify-otp')
    } else {
      router.push(result.redirect || next)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              THE AIRCONDITION SHOP
            </span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            <div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded transition-colors duration-150 cursor-pointer"
                    tabIndex={0}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                      : <Eye    className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <div className="mt-1.5 text-right">
                <Link href="/reset-password" className="text-xs text-sky-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-sky-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Installer or contractor?{' '}
            <Link href="/trade/register" className="text-sky-600 font-medium hover:underline">
              Apply for trade pricing
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
