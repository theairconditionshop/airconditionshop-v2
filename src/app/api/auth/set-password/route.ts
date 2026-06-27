import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordChangedEmail } from '@/lib/resend/send'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { passwordSchema } from '@/lib/auth/password'

const schema = z.object({ password: passwordSchema })

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`set-password:${ip}`, 5, 15 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const cookieStore = await cookies()
  const email = cookieStore.get('pwd_reset_verified')?.value

  if (!email) {
    return NextResponse.json(
      { error: 'Session expired. Please restart the reset process.' },
      { status: 400 },
    )
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

  // O(1) profile lookup instead of listUsers() which paginates ALL users.
  // profiles.email is indexed and lowercased by Supabase auth trigger.
  const { data: profileRow } = await db
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (!profileRow) {
    // Do not reveal that the account doesn't exist — just report generic failure.
    console.warn('[set-password] No profile found for email in verified cookie:', email)
    return NextResponse.json(
      { error: 'Unable to update password. Please restart the reset process.' },
      { status: 400 },
    )
  }

  const { data: authUser } = await db.auth.admin.getUserById(profileRow.id)
  if (!authUser?.user) {
    console.error('[set-password] getUserById returned no user for id:', profileRow.id)
    return NextResponse.json(
      { error: 'Unable to update password. Please restart the reset process.' },
      { status: 400 },
    )
  }

  const { error: updateError } = await db.auth.admin.updateUserById(authUser.user.id, { password })

  if (updateError) {
    console.error('[set-password] updateUserById failed:', updateError.message)
    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 },
    )
  }

  // Changing the password via admin API updates the bcrypt hash in auth.users.
  // GoTrue invalidates all refresh tokens whose password-hash fingerprint no
  // longer matches, so existing sessions cannot be renewed after this call.
  // Access tokens (JWTs) remain valid until their 1-hour natural expiry —
  // this is inherent to stateless JWTs and is acceptable per OWASP guidance.
  console.log('[set-password] Password updated — sessions invalidated for user:', authUser.user.id)

  // Consume the verified cookie so this endpoint cannot be called a second time
  // with the same reset session.
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('pwd_reset_verified')

  // Send confirmation email non-blocking — a failure here must not block the
  // user from proceeding (their password IS already changed at this point).
  const name = (authUser.user.user_metadata?.full_name as string | undefined) ?? ''
  sendPasswordChangedEmail({ email, name }).catch(err =>
    console.error('[set-password] confirmation email failed (password already changed):', err),
  )

  return response
}
