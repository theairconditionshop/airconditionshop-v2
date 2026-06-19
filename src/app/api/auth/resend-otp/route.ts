import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOtpSession } from '@/lib/auth/otp'
import { sendOtpEmail } from '@/lib/resend/send'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const pendingUserId = cookieStore.get('pending_2fa')?.value

  if (!pendingUserId) {
    return NextResponse.json({ error: 'No pending session.' }, { status: 400 })
  }

  // Take only the first IP — Vercel sends "client, proxy, ..." which is invalid
  // for a PostgreSQL INET column.
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
    console.log('[resend-otp] OTP session created for:', pendingUserId)
  } catch (err) {
    console.error('[resend-otp] createOtpSession failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to create verification session. Please try again.' }, { status: 500 })
  }

  try {
    await sendOtpEmail({ email: profile.email, name: profile.full_name || '', code })
    console.log('[resend-otp] OTP email resent to:', profile.email)
  } catch (err) {
    console.error('[resend-otp] sendOtpEmail failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
