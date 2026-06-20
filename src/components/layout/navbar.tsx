'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Phone, ChevronDown, LayoutDashboard, LogOut, User,
  BedDouble, Sofa, Briefcase, Building2, Thermometer, Wind, Calculator,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const SOLUTIONS = [
  { label: 'Bedroom Cooling',    href: '/products/category/air-conditioners?room=bedroom',      icon: BedDouble },
  { label: 'Living Room Cooling',href: '/products/category/air-conditioners?room=living-room',  icon: Sofa },
  { label: 'Office Cooling',     href: '/products/category/air-conditioners?room=office',        icon: Briefcase },
  { label: 'Commercial HVAC',    href: '/products/category/commercial-refrigeration',            icon: Building2 },
  { label: 'Heat Pumps',         href: '/products/category/heat-pumps',                         icon: Thermometer },
  { label: 'Ventilation',        href: '/products/category/ventilation',                        icon: Wind },
]

type Brand = { id: string; name: string; slug: string; logo_url: string | null }

type AuthProfile = {
  role: string
  trade_status: string | null
  full_name: string | null
}

interface NavbarProps {
  transparent?: boolean
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActive] = useState<string | null>(null)
  const [profile, setProfile]       = useState<AuthProfile | null | 'loading'>('loading')
  const [brands, setBrands]         = useState<Brand[]>([])
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Load auth state
  useEffect(() => {
    const supabase = createClient()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }
      const { data } = await supabase
        .from('profiles')
        .select('role, trade_status, full_name')
        .eq('id', user.id)
        .single()
      setProfile(data ?? null)
    }

    loadProfile()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { loadProfile() })
    return () => subscription.unsubscribe()
  }, [])

  // Load brands for dropdown
  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(data => setBrands(Array.isArray(data) ? data.slice(0, 12) : []))
      .catch(() => {})
  }, [])

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setProfile(null)
    setLoggingOut(false)
    router.push('/')
    router.refresh()
  }, [router])

  const isTransparent = transparent && !scrolled && !mobileOpen
  const isLoading     = profile === 'loading'
  const isLoggedIn    = profile !== null && profile !== 'loading'
  const role          = isLoggedIn ? (profile as AuthProfile).role : null
  const tradeStatus   = isLoggedIn ? (profile as AuthProfile).trade_status : null
  const isAdmin       = role === 'super_admin' || role === 'admin' || role === 'staff'
  const isTrade       = role === 'trade'
  const isApprovedTrader = isTrade && tradeStatus === 'approved'

  function DesktopCta() {
    if (isLoading) return (
      <div className="hidden lg:flex items-center gap-3">
        <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
        <div className="w-24 h-8 bg-slate-200 animate-pulse rounded-lg" />
      </div>
    )

    if (isAdmin) return (
      <div className="hidden lg:flex items-center gap-3">
        <Link href="/admin" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200',
          isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-blue-600')}>
          <LayoutDashboard className="w-3.5 h-3.5" /> Admin
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50',
            isTransparent ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-red-600')}>
          <LogOut className="w-3.5 h-3.5" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )

    if (isApprovedTrader) return (
      <div className="hidden lg:flex items-center gap-3">
        <Link href="/trade/dashboard" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200',
          isTransparent ? 'text-amber-300 hover:text-amber-200' : 'text-amber-600 hover:text-amber-700')}>
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <Link href="/account" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200',
          isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-slate-900')}>
          <User className="w-3.5 h-3.5" /> Account
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50',
            isTransparent ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-red-600')}>
          <LogOut className="w-3.5 h-3.5" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )

    if (isTrade) return (
      <div className="hidden lg:flex items-center gap-3">
        <Link href="/trade" className={cn('text-sm font-medium transition-colors duration-200',
          isTransparent ? 'text-amber-300/80 hover:text-amber-200' : 'text-amber-600/80 hover:text-amber-700')}>
          My Application
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50',
            isTransparent ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-red-600')}>
          <LogOut className="w-3.5 h-3.5" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )

    return (
      <div className="hidden lg:flex items-center gap-3">
        <a href="tel:+35679661889" className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors duration-200',
          isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-slate-900')}>
          <Phone className="w-3.5 h-3.5" /> +356 7966 1889
        </a>
        <Link href="/quote">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
            Get a Quote
          </Button>
        </Link>
      </div>
    )
  }

  function MobileCta() {
    if (isLoading) return null
    if (isAdmin) return (
      <div className="pt-3 border-t border-slate-100 space-y-1">
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    if (isApprovedTrader) return (
      <div className="pt-3 border-t border-slate-100 space-y-1">
        <Link href="/trade/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200">
          <LayoutDashboard className="w-4 h-4" /> Trade Dashboard
        </Link>
        <Link href="/account" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200">
          <User className="w-4 h-4" /> My Account
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    if (isTrade) return (
      <div className="pt-3 border-t border-slate-100 space-y-1">
        <Link href="/trade" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200">
          My Application
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    return (
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <a href="tel:+35679661889" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700">
          <Phone className="w-4 h-4 text-blue-600" /> +356 7966 1889
        </a>
        <Link href="/quote" className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
            Get a Quote
          </Button>
        </Link>
      </div>
    )
  }

  // Shared dropdown trigger/panel factory for desktop
  function DropdownItem({ label, isActive, onEnter, onLeave, children }: {
    label: string; isActive: boolean;
    onEnter: () => void; onLeave: () => void;
    children: React.ReactNode
  }) {
    return (
      <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <button
          aria-haspopup="true"
          aria-expanded={isActive}
          onFocus={onEnter}
          onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) onLeave() }}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
            isActive && !isTransparent && 'text-slate-900 bg-slate-50'
          )}
        >
          {label}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isActive && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.13 }}
              data-dropdown
              className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-slate-100 shadow-2xl shadow-slate-200/60 py-2 z-50"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isTransparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className={cn('text-lg font-bold tracking-tight transition-colors duration-200',
              isTransparent ? 'text-white' : 'text-slate-900')}>
              THE AIRCONDITION SHOP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">

            {/* Products */}
            <Link href="/products" className={cn(
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              pathname === '/products' && !isTransparent && 'text-blue-600 bg-blue-50'
            )}>Products</Link>

            {/* Brands dropdown — dynamic */}
            <DropdownItem
              label="Brands"
              isActive={activeDropdown === 'Brands'}
              onEnter={() => setActive('Brands')}
              onLeave={() => setActive(null)}
            >
              <div className="w-48">
                {brands.length === 0 ? (
                  <Link href="/brands" className="block px-4 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                    All Brands
                  </Link>
                ) : (
                  <>
                    {brands.map(brand => (
                      <Link key={brand.id} href={`/brands/${brand.slug}`}
                        onBlur={(e) => { const d = e.currentTarget.closest('[data-dropdown]'); if (!d?.contains(e.relatedTarget as Node)) setActive(null) }}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 focus-visible:outline-none focus-visible:bg-blue-50 focus-visible:text-blue-600">
                        {brand.name}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <Link href="/brands" className="block px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                      View all brands →
                    </Link>
                  </>
                )}
              </div>
            </DropdownItem>

            {/* Solutions dropdown */}
            <DropdownItem
              label="Solutions"
              isActive={activeDropdown === 'Solutions'}
              onEnter={() => setActive('Solutions')}
              onLeave={() => setActive(null)}
            >
              <div className="w-56">
                {SOLUTIONS.map(s => {
                  const Icon = s.icon
                  return (
                    <Link key={s.href} href={s.href}
                      onBlur={(e) => { const d = e.currentTarget.closest('[data-dropdown]'); if (!d?.contains(e.relatedTarget as Node)) setActive(null) }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 focus-visible:outline-none focus-visible:bg-blue-50 focus-visible:text-blue-600">
                      <Icon aria-hidden="true" className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                      {s.label}
                    </Link>
                  )
                })}
              </div>
            </DropdownItem>

            {/* BTU Calculator */}
            <Link href="/btu-calculator" className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              isTransparent
                ? 'text-sky-300 hover:text-sky-200 hover:bg-white/10'
                : 'text-sky-600 hover:text-sky-700 hover:bg-sky-50',
              pathname === '/btu-calculator' && !isTransparent && 'text-sky-700 bg-sky-50'
            )}>
              <Calculator aria-hidden="true" className="w-3.5 h-3.5" />
              BTU Calculator
            </Link>

            {/* Trade */}
            <Link href="/trade" className={cn(
              'px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200',
              isTransparent ? 'text-amber-300 hover:text-amber-200 hover:bg-white/10' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
              pathname === '/trade' && !isTransparent && 'text-amber-700 bg-amber-50'
            )}>Trade</Link>

            {/* Support */}
            <Link href="/services" className={cn(
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              pathname === '/services' && !isTransparent && 'text-blue-600 bg-blue-50'
            )}>Support</Link>

            {/* Contact */}
            <Link href="/contact" className={cn(
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              pathname === '/contact' && !isTransparent && 'text-blue-600 bg-blue-50'
            )}>Contact</Link>
          </nav>

          <DesktopCta />

          {/* Mobile hamburger */}
          <button
            className={cn('lg:hidden p-2 rounded-lg transition-colors duration-200',
              isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100')}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link href="/products" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">Products</Link>

              {/* Brands mobile */}
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Brands</p>
                {brands.map(brand => (
                  <Link key={brand.id} href={`/brands/${brand.slug}`}
                    className="block px-3 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                    {brand.name}
                  </Link>
                ))}
                <Link href="/brands" className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  All Brands →
                </Link>
              </div>

              {/* Solutions mobile */}
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Solutions</p>
                {SOLUTIONS.map(s => {
                  const Icon = s.icon
                  return (
                    <Link key={s.href} href={s.href}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Icon aria-hidden="true" className="w-4 h-4 text-slate-400 shrink-0" />{s.label}
                    </Link>
                  )
                })}
              </div>

              {/* BTU Calculator mobile */}
              <Link href="/btu-calculator"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors duration-200">
                <Calculator aria-hidden="true" className="w-4 h-4" /> BTU Calculator
              </Link>

              {/* Trade mobile */}
              <div className="mt-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mb-1.5">Trade Account</p>
                  <Link href="/trade" className="block text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors duration-200">
                    Trade Portal →
                  </Link>
                </div>
              </div>

              <Link href="/services" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">Support</Link>
              <Link href="/contact" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">Contact</Link>

              <MobileCta />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
