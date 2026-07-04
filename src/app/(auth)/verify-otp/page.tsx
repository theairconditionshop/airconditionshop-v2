'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import OtpInput from '@/components/auth/OtpInput'
import OtpHelpNotice from '@/components/auth/OtpHelpNotice'
import { toast } from 'sonner'
import { ShieldCheck, RefreshCw } from 'lucide-react'

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)
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

  useEffect(() => {
    start()
    return () => { if (ref.current) clearInterval(ref.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { remaining, start }
}

export default function VerifyOtpPage() {
  const router = useRouter()
  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]       = useState('')
  const { remaining, start }    = useCountdown(60)

  const code = digits.join('')

  async function handleVerify() {
    if (code.length !== 6) return
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const result = await res.json().catch(() => ({}))
    setLoading(false)

    if (result.success) {
      router.push('/admin')
    } else {
      setError(result.error || 'Incorrect code. Please try again.')
      setDigits(['', '', '', '', '', ''])
    }
  }

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (code.length === 6 && !loading) handleVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  async function handleResend() {
    if (remaining > 0 || resending) return
    setResending(true)
    setError('')

    const res = await fetch('/api/auth/resend-otp', { method: 'POST' })
    setResending(false)

    if (res.ok) {
      setDigits(['', '', '', '', '', ''])
      start()
      toast.success('A new code has been sent.')
    } else {
      toast.error('Could not resend. Please try logging in again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#0F6FFF] uppercase">
              THE AIRCONDITION SHOP
            </span>
          </Link>

          <div className="mt-5 mx-auto w-16 h-16 bg-white border border-slate-200 flex items-center justify-center" style={{ borderRadius: 2 }}>
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">Two-factor verification</h1>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            Enter the 6-digit code we sent to your email address to continue.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 p-8" style={{ borderRadius: 2 }}>

          {/* OTP Input */}
          <div className="mb-2">
            <OtpInput
              value={digits}
              onChange={setDigits}
              error={!!error}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="mt-3 text-center text-sm text-red-500" role="alert">{error}</p>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">
            Code expires in 10 minutes
          </p>

          {/* Verify button */}
          <Button
            onClick={handleVerify}
            className="w-full mt-6"
            size="lg"
            loading={loading}
            disabled={code.length !== 6 || loading}
          >
            {loading ? 'Verifying…' : 'Verify & Sign in'}
          </Button>

          {/* Resend */}
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

            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>

          <OtpHelpNotice />

        </div>
      </div>
    </div>
  )
}
