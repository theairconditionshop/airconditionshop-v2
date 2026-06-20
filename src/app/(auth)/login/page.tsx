'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
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
