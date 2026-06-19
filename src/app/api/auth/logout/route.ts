import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Server-side logout — the only place that can clear HttpOnly cookies.
// Client-side supabase.auth.signOut() only destroys the Supabase session;
// it cannot touch HttpOnly cookies, so verified_2fa would persist and let
// a re-authenticated admin skip OTP for up to 24 hours.
export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('verified_2fa')
  response.cookies.delete('pending_2fa')
  return response
}
