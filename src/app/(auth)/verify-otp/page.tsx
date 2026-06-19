'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function VerifyOtpPage() {
  const router = useRouter()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join('')

  function handleDigit(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) return
    setLoading(true)

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const result = await res.json()
    setLoading(false)

    if (result.success) {
      router.push('/admin')
    } else {
      toast.error(result.error || 'Invalid code. Please try again.')
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    }
  }

  async function handleResend() {
    setResending(true)
    const res = await fetch('/api/auth/resend-otp', { method: 'POST' })
    setResending(false)
    if (res.ok) {
      toast.success('A new code has been sent to your email.')
    } else {
      toast.error('Could not resend. Please try logging in again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              THE AIRCONDITION SHOP
            </span>
          </Link>
          <div className="mt-6 flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 border border-sky-100 mx-auto">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Check your email</h1>
          <p className="mt-1 text-sm text-slate-500">
            We sent a 6-digit verification code to your email address.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                Verification code
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">Code expires in 10 minutes</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={code.length !== 6}
            >
              Verify & Sign in
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-sky-600 hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending…' : "Didn't receive it? Resend code"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
