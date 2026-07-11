'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { Profile } from '@/types/database'
import { LogOut, User, Menu } from 'lucide-react'
import { useSidebar } from './admin-shell'

// ─── Derive a human-readable page title from the pathname ────────────────────

const TITLE_MAP: Record<string, string> = {
  '/admin':                         'Dashboard',
  '/admin/homepage':                'Homepage',
  '/admin/homepage-cards':          'Homepage Cards',
  '/admin/products':                'Products',
  '/admin/categories':              'Categories',
  '/admin/brands':                  'Brands',
  '/admin/product-import':          'Product Import',
  '/admin/trade':                   'Trade Accounts',
  '/admin/quotes':                  'Quotes',
  '/admin/services':                'Service Requests',
  '/admin/enquiries':               'Enquiries',
  '/admin/emails':                  'Email Templates',
  '/admin/media':                   'Media',
  '/admin/users':                   'Users',
  '/admin/settings':                'Settings',
  '/admin/marketing/campaigns':     'Campaigns',
  '/admin/marketing/analytics':     'Analytics',
  '/admin/crm':                     'CRM',
}

function PageTitle() {
  const pathname = usePathname()

  // Exact match first
  if (TITLE_MAP[pathname]) return (
    <span className="text-sm font-semibold text-slate-900 truncate">{TITLE_MAP[pathname]}</span>
  )

  // Prefix match (e.g. /admin/products/123/edit → Products)
  const entry = Object.entries(TITLE_MAP)
    .filter(([k]) => k !== '/admin')
    .find(([k]) => pathname.startsWith(k + '/'))

  const title = entry ? entry[1] : 'Admin'

  // Detect create/edit sub-pages for a richer label
  const isNew  = pathname.endsWith('/new')   || pathname.includes('/new/')
  const isEdit = pathname.endsWith('/edit')  || pathname.includes('/edit/')
  const suffix = isNew ? ' — New' : isEdit ? ' — Edit' : ''

  return (
    <span className="text-sm font-semibold text-slate-900 truncate">
      {title}{suffix}
    </span>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function AdminHeader({ profile }: { profile: Profile }) {
  const router = useRouter()
  const { toggle } = useSidebar()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6 shrink-0 gap-3">

      {/* Mobile: hamburger */}
      <button
        onClick={toggle}
        aria-label="Open navigation"
        className="lg:hidden p-2 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Mobile: page title (centered on mobile, left-aligned on desktop) */}
      <div className="flex-1 flex items-center lg:hidden">
        <PageTitle />
      </div>

      {/* Desktop: spacer */}
      <div className="hidden lg:flex flex-1" />

      {/* Right: user info + sign out */}
      <div className="flex items-center gap-3">
        {/* Avatar + name (hide name on very small screens) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-800 max-w-[140px] truncate">
              {profile.full_name || profile.email}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">
              {profile.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-slate-100" />

        {/* Sign out */}
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline text-xs font-medium">Sign out</span>
        </button>
      </div>
    </header>
  )
}
