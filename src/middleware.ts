import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

const ADMIN_ROLES: UserRole[]    = ['super_admin', 'admin', 'staff']
const SETTINGS_ROLES: UserRole[] = ['super_admin', 'admin']

async function getProfileRole(userId: string): Promise<{ role: UserRole; trade_status: string | null } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('role, trade_status')
    .eq('id', userId)
    .single()
  return data
}

export default async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // ── Static / public ─────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/favicon')
  ) {
    return supabaseResponse
  }

  // ── Auth routes (/login, /register, /reset-password) ──────────────
  // Only auto-redirect logged-in users if they have fully completed auth.
  // Admin users who still need 2FA must NOT be bounced back to /admin —
  // they need to stay on /login to receive and complete the OTP flow.
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password')

  if (isAuthRoute && user) {
    const profile = await getProfileRole(user.id)

    if (profile && ADMIN_ROLES.includes(profile.role)) {
      // Only redirect admins to /admin when 2FA is already verified for this user.
      const verified2fa = request.cookies.get('verified_2fa')
      if (verified2fa?.value === user.id) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return supabaseResponse
    }

    if (profile?.role === 'trade' && profile.trade_status === 'approved') {
      return NextResponse.redirect(new URL('/trade/dashboard', request.url))
    }

    return NextResponse.redirect(new URL('/', request.url))
  }

  // ── /verify-otp — requires pending_2fa cookie ──────────────────
  if (pathname.startsWith('/verify-otp')) {
    if (!request.cookies.get('pending_2fa')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // ── /admin/* — requires admin role + valid verified_2fa ──────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    const profile = await getProfileRole(user.id)

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2FA gate: verified_2fa must exist and belong to the current user.
    const verified2fa = request.cookies.get('verified_2fa')
    if (!verified2fa || verified2fa.value !== user.id) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      const response = NextResponse.redirect(url)
      if (verified2fa) response.cookies.delete('verified_2fa')
      return response
    }

    // /admin/users — super_admin only
    if (pathname.startsWith('/admin/users') && profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // /admin/settings — admin + super_admin only
    if (pathname.startsWith('/admin/settings') && !SETTINGS_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return supabaseResponse
  }

  // ── /trade/dashboard — requires approved trade account ──────────
  if (pathname.startsWith('/trade/dashboard')) {
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    const profile = await getProfileRole(user.id)
    if (!profile || profile.role !== 'trade' || profile.trade_status !== 'approved') {
      return NextResponse.redirect(new URL('/trade?error=not_approved', request.url))
    }
    return supabaseResponse
  }

  // ── /trade/profile — requires any authenticated trade account ────
  if (pathname.startsWith('/trade/profile')) {
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    const profile = await getProfileRole(user.id)
    if (!profile || profile.role !== 'trade') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // ── /trade/register — redirect already-approved traders ──────────
  if (pathname.startsWith('/trade/register') && user) {
    const profile = await getProfileRole(user.id)
    if (profile?.role === 'trade' && profile.trade_status === 'approved') {
      return NextResponse.redirect(new URL('/trade/dashboard', request.url))
    }
    return supabaseResponse
  }

  // ── /account/* — any authenticated user ─────────────────────────
  if (pathname.startsWith('/account')) {
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
