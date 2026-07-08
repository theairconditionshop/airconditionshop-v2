/* eslint-disable react-hooks/static-components */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Phone, ChevronDown, ChevronRight, ArrowLeft,
  LayoutDashboard, LogOut, User,
  Search, Calculator, Wind, Thermometer, Building2, Layers,
  Package, Refrigerator, Zap, LogIn, UserPlus, Snowflake,
  Wrench, PlugZap, ArrowRight, LifeBuoy,
  CheckCircle2, Clock, XCircle, ShieldOff,
  FileText, Bookmark, ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import SearchOverlay from './search-overlay'
import { cn } from '@/lib/utils'

type Brand    = { id: string; name: string; slug: string; logo_url: string | null }
type Category = { id: string; name: string; slug: string; icon: string | null; product_count?: number }
type AuthProfile = { role: string; trade_status: string | null; full_name: string | null }

type CategoryMeta = {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  description: string
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  'air-conditioners':         { icon: Snowflake,  iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',   description: 'Split, multi-split & cassette units' },
  'heat-pumps':               { icon: Thermometer,iconBg: 'bg-orange-50',  iconColor: 'text-orange-500', description: 'Air-to-air & air-to-water systems' },
  'multi-split-systems':      { icon: Layers,     iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-500', description: 'One outdoor, multiple indoor units' },
  'ventilation':              { icon: Wind,       iconBg: 'bg-teal-50',    iconColor: 'text-teal-500',   description: 'Fans, HRVs & ducting solutions' },
  'commercial-refrigeration': { icon: Building2,  iconBg: 'bg-cyan-50',    iconColor: 'text-cyan-600',   description: 'Display cases & commercial units' },
  'cold-rooms':               { icon: Refrigerator,iconBg:'bg-sky-50',     iconColor: 'text-sky-500',    description: 'Walk-in & modular cold storage' },
  'freezers-fridges':         { icon: Refrigerator,iconBg:'bg-slate-100',  iconColor: 'text-slate-500',  description: 'Commercial freezers & fridges' },
  'hvac-tools':               { icon: Wrench,     iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',  description: 'Installation & service tools' },
  'accessories':              { icon: Package,    iconBg: 'bg-slate-100',  iconColor: 'text-slate-500',  description: 'Remotes, brackets & consumables' },
  'controls':                 { icon: PlugZap,    iconBg: 'bg-purple-50',  iconColor: 'text-purple-500', description: 'Thermostats & smart controllers' },
  'vrf-systems':              { icon: Zap,        iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',   description: 'Variable refrigerant flow systems' },
}
const DEFAULT_META: CategoryMeta = { icon: Package, iconBg: 'bg-slate-100', iconColor: 'text-slate-500', description: 'Browse our full range' }

// Mobile panel state
type MobilePanel = 'main' | 'products' | 'brands'

// ── Module-level panel motion helpers (no outer state deps) ─────────────────
const SLIDE_IN  = { opacity: 1 as const, x: 0 as const }
const SLIDE_OUT = (dir: 'left' | 'right') => ({ opacity: 0 as const, x: dir === 'left' ? '-6%' : '6%' })

function PanelMotion({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: '5%' }}
      animate={SLIDE_IN}
      exit={SLIDE_OUT('right')}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute inset-0 overflow-y-auto"
    >
      {children}
    </motion.div>
  )
}

function MainPanelMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      key="main"
      initial={{ opacity: 0, x: '-5%' }}
      animate={SLIDE_IN}
      exit={SLIDE_OUT('left')}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute inset-0 overflow-y-auto"
    >
      {children}
    </motion.div>
  )
}

interface NavbarProps { transparent?: boolean }

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('main')
  const [activeDropdown, setActive]   = useState<string | null>(null)
  const [profile, setProfile]         = useState<AuthProfile | null>(null)
  const [brands, setBrands]           = useState<Brand[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [searchOpen, setSearchOpen]   = useState(false)
  const [loggingOut, setLoggingOut]   = useState(false)
  const closeTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Reset panel after menu closes
  useEffect(() => {
    if (!mobileOpen) {
      const t = setTimeout(() => setMobilePanel('main'), 250)
      return () => clearTimeout(t)
    }
  }, [mobileOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Auth — re-runs on every auth state change (login/logout/approval)
  useEffect(() => {
    const supabase = createClient()
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }
      const { data } = await supabase.from('profiles').select('role, trade_status, full_name').eq('id', user.id).single()
      setProfile(data ?? null)
    }
    loadProfile()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadProfile())
    return () => subscription.unsubscribe()
  }, [])

  // Brands + Categories
  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d.slice(0, 12) : [])).catch(() => {})
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setProfile(null); setLoggingOut(false)
    router.push('/'); router.refresh()
  }, [router])

  // Desktop hover dropdown
  function dropdownEnter(name: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActive(name)
  }
  function dropdownLeave() {
    closeTimer.current = setTimeout(() => setActive(null), 120)
  }

  const isTransparent    = transparent && !scrolled && !mobileOpen
  const role             = profile?.role ?? null
  const tradeStatus      = profile?.trade_status ?? null
  const isAdmin          = role === 'super_admin' || role === 'admin' || role === 'staff'
  const isTrade          = role === 'trade'
  const firstName        = profile?.full_name?.split(' ')[0] ?? 'there'

  // ── Desktop dropdown wrapper ─────────────────────────────────────────────
  function Dropdown({ name, label, href, children, wide }: {
    name: string; label: string; href?: string; children: React.ReactNode; wide?: boolean
  }) {
    const active = activeDropdown === name
    const triggerClass = cn(
      'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
      isTransparent
        ? 'text-white/90 hover:text-white hover:bg-white/10'
        : cn('text-slate-600 hover:text-slate-900 hover:bg-slate-50', active && 'text-slate-900 bg-slate-50')
    )
    return (
      <div className="relative" onMouseEnter={() => dropdownEnter(name)} onMouseLeave={dropdownLeave}>
        {href ? (
          <Link
            href={href}
            aria-haspopup="true"
            aria-expanded={active}
            className={triggerClass}
            onClick={() => setActive(null)}
          >
            {label}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', active && 'rotate-180')} />
          </Link>
        ) : (
          <button
            aria-haspopup="true"
            aria-expanded={active}
            className={triggerClass}
          >
            {label}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', active && 'rotate-180')} />
          </button>
        )}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.13 }}
              className={cn(
                'absolute top-full left-0 mt-1.5 bg-white rounded-2xl border border-slate-100/80 shadow-2xl shadow-slate-200/60 z-50',
                wide ? 'w-80' : 'w-56 py-2'
              )}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Desktop trade dropdown content — status-aware ────────────────────────
  function TradeDropdownContent() {
    const statusBadge = {
      approved:  { label: 'Approved',  dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  Icon: CheckCircle2 },
      pending:   { label: 'Pending',   dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',  Icon: Clock        },
      rejected:  { label: 'Rejected',  dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    Icon: XCircle      },
      suspended: { label: 'Suspended', dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', Icon: ShieldOff    },
    }[tradeStatus ?? ''] ?? {
      label: 'Unknown', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', Icon: User
    }

    return (
      <div className="p-2">
        {/* Account header */}
        <div className="px-3 py-2.5 mb-1">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em]">Trade Account</p>
          {profile?.full_name && (
            <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{profile.full_name}</p>
          )}
          <div className={cn('mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold', statusBadge.bg, statusBadge.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusBadge.dot)} />
            {statusBadge.label}
          </div>
        </div>
        <div className="mx-2 mb-2 border-t border-slate-100" />

        {tradeStatus === 'approved' && (
          <>
            {[
              { label: 'Trade Dashboard',       href: '/trade/dashboard', icon: LayoutDashboard },
              { label: 'View Products',          href: '/products',        icon: Package          },
              { label: 'Request Quote',          href: '/quote',           icon: FileText         },
              { label: 'Account Information',    href: '/trade/profile',   icon: User             },
              { label: 'Contact Trade Support',  href: '/contact',         icon: LifeBuoy         },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setActive(null)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group"
              >
                <Icon aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors flex-none" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
              </Link>
            ))}
          </>
        )}

        {tradeStatus === 'pending' && (
          <>
            <div className="mx-3 mb-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700 leading-relaxed">Your application is under review. We&apos;ll notify you by email once approved.</p>
            </div>
            <Link href="/trade/dashboard" onClick={() => setActive(null)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group">
              <LayoutDashboard aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors flex-none" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">View Application Status</span>
            </Link>
          </>
        )}

        {tradeStatus === 'rejected' && (
          <>
            <div className="mx-3 mb-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-xs text-red-700 leading-relaxed">Your application was not approved. Contact us for more information.</p>
            </div>
            <Link href="/trade/register" onClick={() => setActive(null)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group">
              <UserPlus aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors flex-none" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Edit Application</span>
            </Link>
            <Link href="/contact" onClick={() => setActive(null)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group">
              <LifeBuoy aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors flex-none" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Contact Support</span>
            </Link>
          </>
        )}

        {tradeStatus === 'suspended' && (
          <>
            <div className="mx-3 mb-2 p-3 rounded-xl bg-orange-50 border border-orange-100">
              <p className="text-xs text-orange-700 leading-relaxed">Your account has been suspended. Contact our team for assistance.</p>
            </div>
            <Link href="/contact" onClick={() => setActive(null)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group">
              <LifeBuoy aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors flex-none" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Contact Our Team</span>
            </Link>
          </>
        )}

        <div className="mx-2 mt-2 border-t border-slate-100" />
        <button
          onClick={() => { setActive(null); handleLogout() }}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors duration-150 group disabled:opacity-50 mt-1"
        >
          <LogOut aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors flex-none" />
          <span className="text-sm font-medium text-slate-500 group-hover:text-red-600 transition-colors">
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </span>
        </button>
      </div>
    )
  }

  // ── Desktop CTA ──────────────────────────────────────────────────────────
  function DesktopCta() {
    if (isAdmin) return (
      <div className="hidden lg:flex items-center gap-3">
        <Link href="/admin" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors',
          isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-blue-600')}>
          <LayoutDashboard className="w-3.5 h-3.5" /> Admin
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50',
            isTransparent ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-red-600')}>
          <LogOut className="w-3.5 h-3.5" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    if (isTrade) return (
      <div className="hidden lg:flex items-center gap-3">
        <span className={cn('text-sm font-medium',
          isTransparent ? 'text-white/70' : 'text-slate-500')}>
          Hi, {firstName}
        </span>
      </div>
    )
    return (
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className={cn('p-2 rounded-lg transition-colors',
            isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')}
          aria-label="Search"
        >
          <Search className="w-4.5 h-4.5" />
        </button>
        <a href="tel:+35679661889" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors px-2',
          isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-slate-900')}>
          <Phone className="w-3.5 h-3.5" /> +356 7966 1889
        </a>
        <a href="https://wa.me/35679661889" target="_blank" rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors px-2',
            isTransparent ? 'text-green-300 hover:text-green-200' : 'text-green-600 hover:text-green-700')}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <Link href="/quote">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4">
            Get a Quote
          </Button>
        </Link>
      </div>
    )
  }

  // ── Mobile menu bottom bar ───────────────────────────────────────────────
  function MobileBottomBar() {
    if (isAdmin) return (
      <div className="p-4 border-t border-slate-100 space-y-2">
        <Link href="/admin" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    // Trade users: Sign Out is embedded in the inline trade card — no bottom bar needed
    if (isTrade) return null
    return (
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:+35679661889"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors">
            <Phone className="w-4 h-4 text-blue-500 shrink-0" /> Call
          </a>
          <a href="https://wa.me/35679661889" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
        <Link href="/quote" onClick={() => setMobileOpen(false)}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" size="lg">
            Get a Quote
          </Button>
        </Link>
        {/* Authenticated (non-admin, non-trade) customers: Sign Out */}
        {profile && (
          <button onClick={handleLogout} disabled={loggingOut}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        )}
      </div>
    )
  }

  // ── Mobile trade section — status-aware inline card ──────────────────────
  function MobileTradeSection() {
    if (!isTrade) {
      // Guest: Apply + Login
      return (
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">Trade Programme</p>
          <div className="space-y-2">
            <Link
              href="/trade/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Apply for Trade Account
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Trade Login
            </Link>
          </div>
        </div>
      )
    }

    if (tradeStatus === 'approved') {
      // Approved: full premium account card, all actions inline
      return (
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 overflow-hidden">
          {/* Identity header */}
          <div className="px-4 pt-4 pb-3 border-b border-amber-100/80">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Trade Account</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              Welcome back, {firstName}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[11px] font-semibold text-green-700">Approved</span>
              <CheckCircle2 className="w-3 h-3 text-green-600" aria-hidden="true" />
            </div>
          </div>

          {/* Menu items */}
          <div className="px-3 py-2 space-y-0.5">
            <Link href="/trade/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 active:bg-white/70 transition-colors group">
              <LayoutDashboard className="w-4 h-4 text-amber-600 flex-none" aria-hidden="true" />
              <span className="text-[14px] font-medium text-slate-800 group-hover:text-slate-900">Trade Dashboard</span>
            </Link>
            <Link href="/products" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 active:bg-white/70 transition-colors group">
              <Package className="w-4 h-4 text-amber-600 flex-none" aria-hidden="true" />
              <span className="text-[14px] font-medium text-slate-800 group-hover:text-slate-900">View Products</span>
            </Link>
            <Link href="/quote" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 active:bg-white/70 transition-colors group">
              <FileText className="w-4 h-4 text-amber-600 flex-none" aria-hidden="true" />
              <span className="text-[14px] font-medium text-slate-800 group-hover:text-slate-900">Request Quote</span>
            </Link>
            {/* Coming soon */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl opacity-40 select-none" aria-hidden="true">
              <Bookmark className="w-4 h-4 text-slate-400 flex-none" />
              <span className="text-[14px] font-medium text-slate-500">Saved Products</span>
              <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">Soon</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl opacity-40 select-none" aria-hidden="true">
              <ShoppingBag className="w-4 h-4 text-slate-400 flex-none" />
              <span className="text-[14px] font-medium text-slate-500">Orders</span>
              <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">Soon</span>
            </div>
            <Link href="/trade/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 active:bg-white/70 transition-colors group">
              <User className="w-4 h-4 text-amber-600 flex-none" aria-hidden="true" />
              <span className="text-[14px] font-medium text-slate-800 group-hover:text-slate-900">Account Information</span>
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 active:bg-white/70 transition-colors group">
              <LifeBuoy className="w-4 h-4 text-amber-600 flex-none" aria-hidden="true" />
              <span className="text-[14px] font-medium text-slate-800 group-hover:text-slate-900">Contact Trade Support</span>
            </Link>

            {/* Sign Out — always visible at bottom */}
            <div className="pt-1 mt-1 border-t border-amber-100">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors group disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors flex-none" aria-hidden="true" />
                <span className="text-[14px] font-medium text-slate-500 group-hover:text-red-600 transition-colors">
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (tradeStatus === 'pending') {
      return (
        <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">Trade Application Submitted</p>
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                Your application is currently under review. We&apos;ll notify you by email once approved.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/trade/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
              View Application Status
            </Link>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-medium transition-colors disabled:opacity-50">
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      )
    }

    if (tradeStatus === 'rejected') {
      return (
        <div className="mt-3 rounded-2xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">Trade Application Rejected</p>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                Your application was not approved. Contact us for more information.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/trade/register" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> Edit Application
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-700 text-sm font-medium transition-colors">
              <LifeBuoy className="w-3.5 h-3.5" aria-hidden="true" /> Contact Support
            </Link>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-red-100 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors disabled:opacity-50">
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      )
    }

    if (tradeStatus === 'suspended') {
      return (
        <div className="mt-3 rounded-2xl bg-orange-50 border border-orange-200 p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <ShieldOff className="w-4 h-4 text-orange-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-orange-800">Account Suspended</p>
              <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
                Your trade account has been suspended. Please contact our team.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
              <LifeBuoy className="w-3.5 h-3.5" aria-hidden="true" /> Contact Our Team
            </Link>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-orange-100 hover:bg-orange-50 text-orange-700 text-sm font-medium transition-colors disabled:opacity-50">
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isTransparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Header bar ─────────────────────────────────────────────── */}
          <div className="relative flex items-center h-16 lg:h-[68px]">

            {/* Mobile: hamburger (left) */}
            <button
              className={cn('lg:hidden p-2 -ml-1 rounded-xl transition-colors',
                isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100')}
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo: centered on mobile, left on desktop */}
            <Link
              href="/"
              className={cn(
                'absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:left-auto shrink-0',
                'flex items-center'
              )}
            >
              <span className={cn('text-[15px] sm:text-[17px] font-bold tracking-tight transition-colors duration-200',
                isTransparent ? 'text-white' : 'text-slate-900')}>
                THE AIRCONDITION SHOP
              </span>
            </Link>

            {/* Desktop: nav (center) */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-4">
              {/* Products ▼ */}
              <Dropdown name="Products" label="Products" href="/products" wide>
                <div className="p-2">
                  {categories.length === 0 ? (
                    <Link href="/products" className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      Browse All Products
                    </Link>
                  ) : (
                    <>
                      {categories.map(cat => {
                        const meta = CATEGORY_META[cat.slug] ?? DEFAULT_META
                        const Icon = meta.icon
                        return (
                          <Link
                            key={cat.id}
                            href={`/products/category/${cat.slug}`}
                            onClick={() => setActive(null)}
                            className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 group"
                          >
                            <div className={cn(
                              'flex-none w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150',
                              meta.iconBg, 'group-hover:opacity-80'
                            )}>
                              <Icon aria-hidden="true" className={cn('w-5 h-5', meta.iconColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-150 leading-tight">{cat.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5 leading-tight truncate">{meta.description}</p>
                            </div>
                            <ChevronRight className="flex-none w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors duration-150 -mr-0.5" />
                          </Link>
                        )
                      })}
                      <div className="mx-3 my-2 border-t border-slate-100" />
                      <Link
                        href="/products"
                        onClick={() => setActive(null)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors duration-150 group"
                      >
                        <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">View All Products</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-150" />
                      </Link>
                    </>
                  )}
                </div>
              </Dropdown>

              {/* Brands ▼ */}
              <Dropdown name="Brands" label="Brands" href="/brands">
                <div className="px-2">
                  {brands.length === 0 ? (
                    <Link href="/brands" className="block px-3 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      All Brands
                    </Link>
                  ) : (
                    <>
                      {brands.map(brand => (
                        <Link key={brand.id} href={`/brands/${brand.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                          {brand.logo_url ? (
                            <div className="flex-none w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1">
                              <Image src={brand.logo_url} alt={brand.name} width={28} height={28} className="object-contain w-full h-full" />
                            </div>
                          ) : (
                            <div className="flex-none w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-slate-500">{brand.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{brand.name}</span>
                        </Link>
                      ))}
                      <div className="mx-2 my-1.5 border-t border-slate-100" />
                      <Link href="/brands"
                        className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        All Brands <span className="text-xs text-blue-400">View all →</span>
                      </Link>
                    </>
                  )}
                </div>
              </Dropdown>

              <Link href="/btu-calculator" className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-sky-300 hover:text-sky-200 hover:bg-white/10' : 'text-sky-600 hover:text-sky-700 hover:bg-sky-50',
                pathname === '/btu-calculator' && !isTransparent && 'text-sky-700 bg-sky-50'
              )}>
                <Calculator aria-hidden="true" className="w-3.5 h-3.5" /> BTU Calculator
              </Link>

              <Link href="/services" className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                pathname === '/services' && !isTransparent && 'text-blue-600 bg-blue-50'
              )}>Services</Link>

              <Link href="/contact" className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                pathname === '/contact' && !isTransparent && 'text-blue-600 bg-blue-50'
              )}>Contact</Link>

              {/* Trade — status-aware desktop dropdown */}
              {isTrade ? (
                <Dropdown name="TradeAccount" label={`Hi, ${firstName}`} wide>
                  <TradeDropdownContent />
                </Dropdown>
              ) : (
                <Link href="/trade" className={cn(
                  'px-3 py-2 text-sm font-semibold rounded-lg transition-colors',
                  isTransparent ? 'text-amber-300 hover:text-amber-200 hover:bg-white/10' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
                  pathname === '/trade' && !isTransparent && 'text-amber-700 bg-amber-50'
                )}>Trade</Link>
              )}
            </nav>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-1">
              {/* Mobile: search icon (right) */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true) }}
                className={cn('lg:hidden p-2 rounded-xl transition-colors',
                  isTransparent ? 'text-white/90 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Desktop CTA */}
              <DesktopCta />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile menu (outside header to escape stacking context) ─────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed inset-0 top-16 bg-white z-[45] flex flex-col"
          >
              {/* Sliding panels container */}
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* ── MAIN PANEL ──────────────────────────────────────── */}
                  {mobilePanel === 'main' && (
                    <MainPanelMotion>
                      <div className="px-4 pt-2 pb-4 space-y-0.5">

                        {/* Products → */}
                        <button
                          onClick={() => setMobilePanel('products')}
                          className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                        >
                          <span className="text-[15px] font-semibold text-slate-900">Products</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" aria-hidden="true" />
                        </button>

                        {/* Brands → */}
                        <button
                          onClick={() => setMobilePanel('brands')}
                          className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                        >
                          <span className="text-[15px] font-semibold text-slate-900">Brands</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" aria-hidden="true" />
                        </button>

                        {/* BTU Calculator */}
                        <Link
                          href="/btu-calculator"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl hover:bg-sky-50 active:bg-sky-100 transition-colors"
                        >
                          <Calculator className="w-4 h-4 text-sky-500" aria-hidden="true" />
                          <span className="text-[15px] font-semibold text-sky-600">BTU Calculator</span>
                        </Link>

                        {/* Divider */}
                        <div className="my-1 border-t border-slate-100" />

                        <Link href="/services" onClick={() => setMobileOpen(false)}
                          className="block px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                          Services
                        </Link>
                        <Link href="/contact" onClick={() => setMobileOpen(false)}
                          className="block px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                          Contact
                        </Link>

                        {/* Trade section — status-aware */}
                        <MobileTradeSection />
                      </div>

                      <MobileBottomBar />
                    </MainPanelMotion>
                  )}

                  {/* ── PRODUCTS SUB-PANEL ───────────────────────────────── */}
                  {mobilePanel === 'products' && (
                    <PanelMotion id="products">
                      {/* Back header */}
                      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                        <button
                          onClick={() => setMobilePanel('main')}
                          className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          aria-label="Back to menu"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="text-sm font-semibold text-slate-900">Products</span>
                      </div>

                      <div className="px-4 py-3 space-y-0.5">
                        {categories.map(cat => {
                          const meta = CATEGORY_META[cat.slug] ?? DEFAULT_META
                          const Icon = meta.icon
                          return (
                            <Link
                              key={cat.id}
                              href={`/products/category/${cat.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3.5 px-3 py-3.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                            >
                              <div className={cn('flex-none w-9 h-9 rounded-xl flex items-center justify-center transition-colors', meta.iconBg)}>
                                <Icon aria-hidden="true" className={cn('w-4 h-4', meta.iconColor)} />
                              </div>
                              <span className="text-[15px] font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                            </Link>
                          )
                        })}

                        <div className="pt-2 border-t border-slate-100 mt-2">
                          <Link
                            href="/products"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between px-3 py-3.5 rounded-xl text-[15px] font-semibold text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                          >
                            View all products <ChevronRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </PanelMotion>
                  )}

                  {/* ── BRANDS SUB-PANEL ─────────────────────────────────── */}
                  {mobilePanel === 'brands' && (
                    <PanelMotion id="brands">
                      {/* Back header */}
                      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                        <button
                          onClick={() => setMobilePanel('main')}
                          className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          aria-label="Back to menu"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="text-sm font-semibold text-slate-900">Brands</span>
                      </div>

                      <div className="px-4 py-3 space-y-0.5">
                        {brands.map(brand => (
                          <Link
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3.5 px-3 py-3.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="flex-none w-9 h-9 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center p-1.5">
                                <Image src={brand.logo_url} alt={brand.name} width={32} height={32} className="object-contain w-full h-full" />
                              </div>
                            ) : (
                              <div className="flex-none w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500">{brand.name.slice(0, 2).toUpperCase()}</span>
                              </div>
                            )}
                            <span className="text-[15px] font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{brand.name}</span>
                          </Link>
                        ))}

                        <div className="pt-2 border-t border-slate-100 mt-2">
                          <Link
                            href="/brands"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between px-3 py-3.5 rounded-xl text-[15px] font-semibold text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                          >
                            View all brands <ChevronRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </PanelMotion>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
