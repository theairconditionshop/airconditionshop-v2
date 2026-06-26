import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createEmailOtp } from '@/lib/auth/otp'
import { sendTradeVerificationEmail } from '@/lib/resend/send'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const schema = z.object({ email: z.string().email().max(254) })

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

  // 3 OTP requests per email per hour
  const emailRl = rateLimit(`trade-verify-email:${ip}`, 3, 60 * 60 * 1000)
  if (emailRl.limited) return rateLimitResponse(emailRl)

  // 5 requests per IP per day
  const ipRl = rateLimit(`trade-verify-ip:${ip}`, 5, 24 * 60 * 60 * 1000)
  if (ipRl.limited) return rateLimitResponse(ipRl)

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { email } = parsed.data

  let code: string
  try {
    code = await createEmailOtp(email, 'trade_registration', ip)
  } catch {
    return NextResponse.json({ error: 'Failed to generate code. Please try again.' }, { status: 500 })
  }

  try {
    await sendTradeVerificationEmail({ email, code })
  } catch (err) {
    console.error('[trade/send-verification] Email send failed:', err)
    return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
  }

  // Set pending cookie so the verify endpoint knows which email to verify
  const response = NextResponse.json({ ok: true })
  response.cookies.set('trade_email_pending', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })
  return response
}
