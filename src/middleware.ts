import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin', 'staff']
const SUPER_ADMIN_ONLY: UserRole[] = ['super_admin']
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

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // ── Public routes — no auth needed ──────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/favicon')
  ) {
    return supabaseResponse
  }

  // ── Auth routes — redirect if already logged in ──────────────────
  const isAuthRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password')

  if (isAuthRoute && user) {
    const profile = await getProfileRole(user.id)
    if (profile && ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (profile?.role === 'trade' && profile.trade_status === 'approved') {
      return NextResponse.redirect(new URL('/trade/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ── /verify-otp — needs pending_2fa cookie ──────────────────────
  if (pathname.startsWith('/verify-otp')) {
    const pending = request.cookies.get('pending_2fa')
    if (!pending) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // ── /admin/* — requires admin role + completed 2FA ───────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url))
    }

    const profile = await getProfileRole(user.id)

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/?error=forbidden', request.url))
    }

    // Enforce 2FA: if no verified_2fa cookie redirect to OTP
    const verified2fa = request.cookies.get('verified_2fa')
    if (!verified2fa) {
      // Set pending cookie so /verify-otp knows who to verify
      const response = NextResponse.redirect(new URL('/verify-otp', request.url))
      response.cookies.set('pending_2fa', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes to complete OTP
        path: '/',
      })
      return response
    }

    // /admin/users — super_admin only
    if (pathname.startsWith('/admin/users') && profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin?error=forbidden', request.url))
    }

    // /admin/settings — admin + super_admin only
    if (pathname.startsWith('/admin/settings') && !SETTINGS_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/admin?error=forbidden', request.url))
    }

    return supabaseResponse
  }

  // ── /trade/dashboard — requires approved trade ───────────────────
  if (pathname.startsWith('/trade/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url))
    }
    const profile = await getProfileRole(user.id)
    if (!profile || profile.role !== 'trade' || profile.trade_status !== 'approved') {
      return NextResponse.redirect(new URL('/trade?error=not_approved', request.url))
    }
    return supabaseResponse
  }

  // ── /account/* — requires any authenticated user ─────────────────
  if (pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url))
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
