import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOtpSession } from '@/lib/auth/otp'
import { sendOtpEmail } from '@/lib/resend/send'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const pendingUserId = cookieStore.get('pending_2fa')?.value

  if (!pendingUserId) {
    return NextResponse.json({ error: 'No pending session.' }, { status: 400 })
  }

  // Rate limit per pending user ID: 5 resends per 15 minutes
  const rl = rateLimit(`resend-otp:${pendingUserId}`, 5, 15 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const rawIp = request.headers.get('x-forwarded-for')
  const ip = rawIp ? rawIp.split(',')[0].trim() : undefined

  const adminDb = createAdminClient()

  const { data: profile } = await adminDb
    .from('profiles')
    .select('email, full_name')
    .eq('id', pendingUserId)
    .single()

  if (!profile || !profile.email) {
    return NextResponse.json({ error: 'User not found.' }, { status: 400 })
  }

  let code: string
  try {
    code = await createOtpSession(pendingUserId, ip)
  } catch (err) {
    console.error('[resend-otp] createOtpSession failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to create verification session. Please try again.' }, { status: 500 })
  }

  try {
    await sendOtpEmail({ email: profile.email, name: profile.full_name || '', code })
    /* OTP email resent */
  } catch (err) {
    console.error('[resend-otp] sendOtpEmail failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
