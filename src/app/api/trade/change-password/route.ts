import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { passwordSchema } from '@/lib/auth/password'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const schema = z.object({ password: passwordSchema })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Password changes: 5 per day per user (abuse / account-takeover protection).
  const rl = rateLimit(`change-password:${user.id}`, 5, 24 * 60 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'trade') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid password' }, { status: 400 })
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
