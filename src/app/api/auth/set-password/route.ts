import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordChangedEmail } from '@/lib/resend/send'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const schema = z.object({
  password: z
    .string()
    .min(8,  'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`set-password:${ip}`, 5, 15 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl.resetAt)

  const cookieStore = await cookies()
  const email = cookieStore.get('pwd_reset_verified')?.value

  if (!email) {
    return NextResponse.json({ error: 'Session expired. Please restart the reset process.' }, { status: 400 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid password'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { password } = parsed.data
  const db = createAdminClient()

  // Find user by email
  const { data: users } = await db.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
  }

  const { error } = await db.auth.admin.updateUserById(user.id, { password })

  if (error) {
    console.error('[set-password] updateUserById failed:', error.message)
    return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 })
  }

  // Invalidate verified cookie
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('pwd_reset_verified')

  // Send password changed confirmation email (non-blocking)
  const name = user.user_metadata?.full_name as string | undefined
  sendPasswordChangedEmail({ email, name: name || '' }).catch(err =>
    console.error('[set-password] email send failed:', err),
  )

  return response
}
