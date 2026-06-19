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

  const ip = request.headers.get('x-forwarded-for') || undefined
  const adminDb = createAdminClient()

  const { data: profile } = await adminDb
    .from('profiles')
    .select('email, full_name')
    .eq('id', pendingUserId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found.' }, { status: 400 })
  }

  const code = await createOtpSession(pendingUserId, ip)
  await sendOtpEmail({ email: profile.email, name: profile.full_name || '', code })

  return NextResponse.json({ ok: true })
}
