import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createOtpSession } from '@/lib/auth/otp'
import { requiresTwoFactor } from '@/lib/auth/permissions'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import type { UserRole } from '@/types/database'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`post-login:${ip}`, 10, 5 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  console.log('[post-login] Request received')

  // SECURITY: derive userId from the verified Supabase session, NOT from the
  // request body. Accepting userId from the client would allow any authenticated
  // user to supply an admin's UUID and DoS their OTP sessions.
  const supabase = await createClient()
  const { data: { user }, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !user) {
    console.error('[post-login] No authenticated session:', sessionError?.message)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = user.id

  let body: { next?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const { next } = body


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


  const role = profile.role as UserRole

  // Admin/staff require 2FA
  if (requiresTwoFactor(role)) {

    if (!profile.email) {
      console.error('[post-login] Profile has no email — cannot send OTP')
      return NextResponse.json({ error: 'Account email not found. Contact support.' }, { status: 500 })
    }

    let code: string
    try {
      code = await createOtpSession(userId, ip)
    } catch (err) {
      console.error('[post-login] createOtpSession failed:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: 'Failed to create verification session. Please try again.' }, { status: 500 })
    }

    try {
      const { sendOtpEmail } = await import('@/lib/resend/send')
      await sendOtpEmail({ email: profile.email, name: profile.full_name || '', code })
      /* OTP email sent */
    } catch (err) {
      console.error('[post-login] sendOtpEmail failed:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
    }

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
