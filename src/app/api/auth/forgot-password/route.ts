import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createEmailOtp } from '@/lib/auth/otp'
import { sendPasswordResetOtpEmail } from '@/lib/resend/send'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

const schema = z.object({ email: z.string().email().max(254) })

// Artificial delay keeps timing identical whether or not the account exists,
// preventing account enumeration through response-time differences.
const ANTI_TIMING_MS = () => 200 + Math.random() * 300

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

  const rl = rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { email } = parsed.data
  const normalised = email.toLowerCase()

  // Look up via profiles (O(1) with index) instead of listUsers() which
  // fetches paginated batches and silently misses users beyond the page size.
  const db = createAdminClient()
  const { data: profileRow } = await db
    .from('profiles')
    .select('id')
    .eq('email', normalised)
    .maybeSingle()

  // Always respond with generic success — never reveal whether the account exists.
  if (!profileRow) {
    await new Promise(r => setTimeout(r, ANTI_TIMING_MS()))
    const response = NextResponse.json({ ok: true })
    response.cookies.set('pwd_reset_pending', normalised, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   10 * 60,
      path:     '/',
    })
    return response
  }

  // Fetch the full user record we need for the email name
  const { data: authUser } = await db.auth.admin.getUserById(profileRow.id)

  let code: string
  try {
    code = await createEmailOtp(normalised, 'password_reset', ip)
  } catch (err) {
    console.error('[forgot-password] createEmailOtp failed:', err)
    return NextResponse.json(
      { error: 'Failed to generate reset code. Please try again.' },
      { status: 500 },
    )
  }

  const name = (authUser?.user?.user_metadata?.full_name as string | undefined) ?? ''

  try {
    await sendPasswordResetOtpEmail({ email: normalised, name, code })
  } catch (err) {
    console.error('[forgot-password] email send failed:', err)
    return NextResponse.json(
      { error: 'Failed to send reset email. Please try again.' },
      { status: 500 },
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('pwd_reset_pending', normalised, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   10 * 60,
    path:     '/',
  })
  return response
}
