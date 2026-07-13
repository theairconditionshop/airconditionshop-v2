import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyOtpSession } from '@/lib/auth/otp'
import { audit } from '@/lib/audit'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  // 10 attempts per 5 minutes per IP — brute-force protection at the network layer.
  // The OTP itself also locks after 5 wrong attempts at the DB layer (defence in depth).
  const rl = rateLimit(`verify-otp:${ip}`, 10, 5 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const cookieStore = await cookies()
  const pendingUserId = cookieStore.get('pending_2fa')?.value


  if (!pendingUserId) {
    return NextResponse.json({ success: false, error: 'Session expired. Please log in again.' }, { status: 400 })
  }

  const { code } = await request.json()

  if (!code || code.length !== 6) {
    console.warn('[verify-otp] Invalid code format — length:', code?.length ?? 0)
    return NextResponse.json({ success: false, error: 'Invalid code format.' }, { status: 400 })
  }

  const valid = await verifyOtpSession(pendingUserId, code)

  if (!valid) {
    await audit({ action: 'auth.2fa_failed', actorId: pendingUserId, request, metadata: { reason: 'invalid_or_expired_code' } })
    return NextResponse.json({ success: false, error: 'Incorrect or expired code.' }, { status: 400 })
  }

  await audit({ action: 'auth.login', actorId: pendingUserId, entityType: 'profile', entityId: pendingUserId, request })

  // Set verified_2fa session cookie (1 day)
  const response = NextResponse.json({ success: true })
  response.cookies.set('verified_2fa', pendingUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  })
  response.cookies.delete('pending_2fa')

  return response
}
