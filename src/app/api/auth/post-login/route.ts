import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOtpSession } from '@/lib/auth/otp'
import { requiresTwoFactor } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export async function POST(request: Request) {
  const { userId, next } = await request.json()
  const ip = request.headers.get('x-forwarded-for') || undefined

  const adminDb = createAdminClient()

  const { data: profile } = await adminDb
    .from('profiles')
    .select('role, trade_status, full_name, email')
    .eq('id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ redirect: '/' })
  }

  const role = profile.role as UserRole

  // Admin/staff require 2FA
  if (requiresTwoFactor(role)) {
    const code = await createOtpSession(userId, ip)

    // Send OTP via Resend
    const { sendOtpEmail } = await import('@/lib/resend/send')
    await sendOtpEmail({ email: profile.email, name: profile.full_name || '', code })

    // Build response with pending_2fa cookie
    const response = NextResponse.json({ require2fa: true })
    response.cookies.set('pending_2fa', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  }

  // Trade user
  if (role === 'trade') {
    if (profile.trade_status === 'approved') {
      return NextResponse.json({ redirect: next || '/trade/dashboard' })
    }
    return NextResponse.json({ redirect: '/trade?status=' + (profile.trade_status || 'pending') })
  }

  // Regular customer
  return NextResponse.json({ redirect: next || '/' })
}
