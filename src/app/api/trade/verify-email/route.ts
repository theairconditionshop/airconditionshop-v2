import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { verifyEmailOtp } from '@/lib/auth/otp'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const schema = z.object({ code: z.string().length(6).regex(/^\d{6}$/) })

const ERROR_MESSAGES: Record<string, string> = {
  not_found:    'No active code found. Please request a new one.',
  expired:      'This code has expired. Please request a new one.',
  max_attempts: 'Too many incorrect attempts. Please request a new code.',
  invalid:      'Incorrect code. Please check and try again.',
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`trade-verify-otp:${ip}`, 10, 5 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl.resetAt)

  const cookieStore = await cookies()
  const email = cookieStore.get('trade_email_pending')?.value

  if (!email) {
    return NextResponse.json({ error: 'Session expired. Please go back and try again.' }, { status: 400 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
  }

  const result = await verifyEmailOtp(email, 'trade_registration', parsed.data.code)

  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.reason] ?? 'Verification failed. Please try again.' },
      { status: 400 },
    )
  }

  // Upgrade cookie: pending → verified (15 min to complete registration)
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('trade_email_pending')
  response.cookies.set('trade_email_verified', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })
  return response
}
