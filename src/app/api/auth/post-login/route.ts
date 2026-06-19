import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOtpSession } from '@/lib/auth/otp'
import { requiresTwoFactor } from '@/lib/auth/permissions'
import type { UserRole } from '@/types/database'

export async function POST(request: Request) {
  console.log('[post-login] Request received')

  let body: { userId?: string; next?: string }
  try {
    body = await request.json()
  } catch {
    console.error('[post-login] Failed to parse request body')
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { userId, next } = body

  if (!userId) {
    console.error('[post-login] No userId in request body')
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  // Take only the first IP from x-forwarded-for — Vercel sends a comma-separated
  // list (client, proxy, ...) which is invalid for a PostgreSQL INET column.
  const rawIp = request.headers.get('x-forwarded-for')
  const ip = rawIp ? rawIp.split(',')[0].trim() : undefined
  console.log('[post-login] userId:', userId, 'ip:', ip ?? 'none')

  const adminDb = createAdminClient()

  const { data: profile, error: profileError } = await adminDb
    .from('profiles')
    .select('role, trade_status, full_name, email')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('[post-login] Profile lookup error:', profileError.message)
  }

  if (!profile) {
    console.warn('[post-login] No profile found for userId:', userId)
    return NextResponse.json({ redirect: '/' })
  }

  console.log('[post-login] Profile found — role:', profile.role, 'email:', profile.email)

  const role = profile.role as UserRole

  // Admin/staff require 2FA
  if (requiresTwoFactor(role)) {
    console.log('[post-login] 2FA required for role:', role)

    if (!profile.email) {
      console.error('[post-login] Profile has no email — cannot send OTP')
      return NextResponse.json({ error: 'Account email not found. Contact support.' }, { status: 500 })
    }

    let code: string
    try {
      code = await createOtpSession(userId, ip)
      console.log('[post-login] OTP session created successfully')
    } catch (err) {
      console.error('[post-login] createOtpSession failed:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: 'Failed to create verification session. Please try again.' }, { status: 500 })
    }

    try {
      const { sendOtpEmail } = await import('@/lib/resend/send')
      await sendOtpEmail({ email: profile.email, name: profile.full_name || '', code })
      console.log('[post-login] OTP email sent to:', profile.email)
    } catch (err) {
      console.error('[post-login] sendOtpEmail failed:', err instanceof Error ? err.message : err)
      // OTP session was created — return error so admin can retry, don't silently continue
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
    }

    // Build response with pending_2fa cookie
    const response = NextResponse.json({ require2fa: true })
    response.cookies.set('pending_2fa', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    console.log('[post-login] Returning require2fa=true, pending_2fa cookie set')
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
