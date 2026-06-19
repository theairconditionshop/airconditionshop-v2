import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyOtpSession } from '@/lib/auth/otp'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const pendingUserId = cookieStore.get('pending_2fa')?.value

  console.log('[verify-otp] Attempt — pendingUserId:', pendingUserId ?? 'MISSING')

  if (!pendingUserId) {
    return NextResponse.json({ success: false, error: 'Session expired. Please log in again.' }, { status: 400 })
  }

  const { code } = await request.json()

  if (!code || code.length !== 6) {
    console.warn('[verify-otp] Invalid code format — length:', code?.length ?? 0)
    return NextResponse.json({ success: false, error: 'Invalid code format.' }, { status: 400 })
  }

  const valid = await verifyOtpSession(pendingUserId, code)
  console.log('[verify-otp] verifyOtpSession result:', valid)

  if (!valid) {
    return NextResponse.json({ success: false, error: 'Incorrect or expired code.' }, { status: 400 })
  }

  // Set verified_2fa session cookie (1 day)
  const response = NextResponse.json({ success: true })
  console.log('[verify-otp] OTP verified — setting verified_2fa cookie for userId:', pendingUserId)
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
