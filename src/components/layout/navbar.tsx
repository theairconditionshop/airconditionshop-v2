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
  Package, Refrigerator, Zap, LogIn, UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import SearchOverlay from './search-overlay'
import { cn } from '@/lib/utils'

type Brand    = { id: string; name: string; slug: string; logo_url: string | null }
type Category = { id: string; name: string; slug: string; icon: string | null }
type AuthProfile = { role: string; trade_status: string | null; full_name: string | null }

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'air-conditioners':         Zap,
  'multi-split-systems':      Layers,
  'heat-pumps':               Thermometer,
  'ventilation':              Wind,
  'commercial-refrigeration': Building2,
  'cold-rooms':               Refrigerator,
  'accessories':              Package,
}
const DEFAULT_ICON = Package

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
  const [profile, setProfile]         = useState<AuthProfile | null | 'loading'>('loading')
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

  // Auth
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
  const isLoading        = profile === 'loading'
  const role             = profile && profile !== 'loading' ? (profile as AuthProfile).role : null
  const tradeStatus      = profile && profile !== 'loading' ? (profile as AuthProfile).trade_status : null
  const isAdmin          = role === 'super_admin' || role === 'admin' || role === 'staff'
  const isTrade          = role === 'trade'
  const isApprovedTrader = isTrade && tradeStatus === 'approved'

  // ── Desktop dropdown wrapper ─────────────────────────────────────────────
  function Dropdown({ name, label, children, wide }: {
    name: string; label: string; children: React.ReactNode; wide?: boolean
  }) {
    const active = activeDropdown === name
    return (
      <div className="relative" onMouseEnter={() => dropdownEnter(name)} onMouseLeave={dropdownLeave}>
        <button
          aria-haspopup="true"
          aria-expanded={active}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            isTransparent
              ? 'text-white/90 hover:text-white hover:bg-white/10'
              : cn('text-slate-600 hover:text-slate-900 hover:bg-slate-50', active && 'text-slate-900 bg-slate-50')
          )}
        >
          {label}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', active && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.13 }}
              className={cn(
                'absolute top-full left-0 mt-1 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 py-2 z-50',
                wide ? 'w-72' : 'w-56'
              )}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Desktop CTA ──────────────────────────────────────────────────────────
  function DesktopCta() {
    if (isLoading) return (
      <div className="hidden lg:flex items-center gap-3">
        <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
        <div className="w-24 h-8 bg-slate-200 animate-pulse rounded-lg" />
      </div>
    )
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
    if (isApprovedTrader) return (
      <div className="hidden lg:flex items-center gap-3">
        <Link href="/trade/dashboard" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors',
          isTransparent ? 'text-amber-300 hover:text-amber-200' : 'text-amber-600 hover:text-amber-700')}>
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
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
        <Link href="/trade" className={cn('text-sm font-medium transition-colors',
          isTransparent ? 'text-amber-300/80 hover:text-amber-200' : 'text-amber-600/80 hover:text-amber-700')}>
          My Application
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50',
            isTransparent ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-red-600')}>
          <LogOut className="w-3.5 h-3.5" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
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
        <Link href="/quote">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4">
            Get a Quote
          </Button>
        </Link>
      </div>
    )
  }

  // ── Mobile menu bottom CTA bar ───────────────────────────────────────────
  function MobileBottomBar() {
    if (isLoading) return null
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
    if (isApprovedTrader) return (
      <div className="p-4 border-t border-slate-100 space-y-2">
        <Link href="/trade/dashboard" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
          <LayoutDashboard className="w-4 h-4" /> Trade Dashboard
        </Link>
        <Link href="/account" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <User className="w-4 h-4" /> My Account
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    return (
      <div className="p-4 border-t border-slate-100 space-y-2">
        <a href="tel:+35679661889"
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Phone className="w-4 h-4 text-blue-500" /> +356 7966 1889
        </a>
        <Link href="/quote" onClick={() => setMobileOpen(false)}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" size="lg">
            Get a Quote
          </Button>
        </Link>
      </div>
    )
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
              <Dropdown name="Products" label="Products" wide>
                <div className="px-2">
                  {categories.length === 0 ? (
                    <Link href="/products" className="block px-3 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      All Products
                    </Link>
                  ) : (
                    <>
                      {categories.map(cat => {
                        const Icon = CATEGORY_ICONS[cat.slug] ?? DEFAULT_ICON
                        return (
                          <Link key={cat.id} href={`/products/category/${cat.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                            <div className="flex-none w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <Icon aria-hidden="true" className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                          </Link>
                        )
                      })}
                      <div className="mx-2 my-1.5 border-t border-slate-100" />
                      <Link href="/products"
                        className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        All Products <span className="text-xs text-blue-400">View all →</span>
                      </Link>
                    </>
                  )}
                </div>
              </Dropdown>

              {/* Brands ▼ */}
              <Dropdown name="Brands" label="Brands">
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
              )}>Support</Link>

              <Link href="/contact" className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                pathname === '/contact' && !isTransparent && 'text-blue-600 bg-blue-50'
              )}>Contact</Link>

              <Link href="/trade" className={cn(
                'px-3 py-2 text-sm font-semibold rounded-lg transition-colors',
                isTransparent ? 'text-amber-300 hover:text-amber-200 hover:bg-white/10' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
                pathname === '/trade' && !isTransparent && 'text-amber-700 bg-amber-50'
              )}>Trade</Link>
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

        {/* ── placeholder so header height is preserved ─────────────────── */}
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
                          Support
                        </Link>
                        <Link href="/contact" onClick={() => setMobileOpen(false)}
                          className="block px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                          Contact
                        </Link>

                        {/* Trade section */}
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
                          const Icon = CATEGORY_ICONS[cat.slug] ?? DEFAULT_ICON
                          return (
                            <Link
                              key={cat.id}
                              href={`/products/category/${cat.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3.5 px-3 py-3.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                            >
                              <div className="flex-none w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Icon aria-hidden="true" className="w-4 h-4 text-blue-600" />
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
