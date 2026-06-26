import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createEmailOtp } from '@/lib/auth/otp'
import { sendPasswordResetOtpEmail } from '@/lib/resend/send'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

const schema = z.object({ email: z.string().email().max(254) })

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

  // 3 OTP requests per IP per 15 minutes
  const rl = rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl.resetAt)

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { email } = parsed.data

  // Always respond with success — never reveal whether an account exists
  const db = createAdminClient()
  const { data: users } = await db.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    // Artificial delay to prevent timing attacks
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300))
    const response = NextResponse.json({ ok: true })
    response.cookies.set('pwd_reset_pending', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    })
    return response
  }

  let code: string
  try {
    code = await createEmailOtp(email, 'password_reset', ip)
  } catch (err) {
    console.error('[forgot-password] createEmailOtp failed:', err)
    return NextResponse.json({ error: 'Failed to generate reset code. Please try again.' }, { status: 500 })
  }

  const name = user.user_metadata?.full_name as string | undefined

  try {
    await sendPasswordResetOtpEmail({ email, name: name || '', code })
  } catch (err) {
    console.error('[forgot-password] email send failed:', err)
    return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('pwd_reset_pending', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  })
  return response
}
