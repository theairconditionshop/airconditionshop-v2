import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { audit } from '@/lib/audit'

// Server-side logout — the only place that can clear HttpOnly cookies.
// Client-side supabase.auth.signOut() only destroys the Supabase session;
// it cannot touch HttpOnly cookies, so verified_2fa would persist and let
// a re-authenticated admin skip OTP for up to 24 hours.
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`logout:${ip}`, 20, 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.auth.signOut()
  if (user) await audit({ action: 'auth.logout', actorId: user.id, request })

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('verified_2fa')
  response.cookies.delete('pending_2fa')
  return response
}
