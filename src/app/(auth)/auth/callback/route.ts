import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Supabase sends password-reset and email-confirmation links to /auth/callback.
// This route exchanges the one-time code for a session and redirects the user.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] Code exchange failed:', error.message)
      return NextResponse.redirect(`${origin}/login?error=link_expired`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
