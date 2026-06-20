'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Phone, ChevronDown, LayoutDashboard, LogOut, User,
  Search, Calculator, Wind, Thermometer, Building2, Layers,
  Package, Refrigerator, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import SearchOverlay from './search-overlay'
import { cn } from '@/lib/utils'

type Brand    = { id: string; name: string; slug: string; logo_url: string | null }
type Category = { id: string; name: string; slug: string; icon: string | null }

type AuthProfile = { role: string; trade_status: string | null; full_name: string | null }

// Map category slug → Lucide icon
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'air-conditioners':        Zap,
  'multi-split-systems':     Layers,
  'heat-pumps':              Thermometer,
  'ventilation':             Wind,
  'commercial-refrigeration':Building2,
  'cold-rooms':              Refrigerator,
  'accessories':             Package,
}
const DEFAULT_ICON = Package

interface NavbarProps { transparent?: boolean }

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
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

  useEffect(() => { setMobileOpen(false) }, [pathname])

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

  // Hover with delay — prevents flicker when moving mouse between button and panel
  function dropdownEnter(name: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActive(name)
  }
  function dropdownLeave() {
    closeTimer.current = setTimeout(() => setActive(null), 120)
  }

  const isTransparent  = transparent && !scrolled && !mobileOpen
  const isLoading      = profile === 'loading'
  const role           = profile && profile !== 'loading' ? (profile as AuthProfile).role : null
  const tradeStatus    = profile && profile !== 'loading' ? (profile as AuthProfile).trade_status : null
  const isAdmin        = role === 'super_admin' || role === 'admin' || role === 'staff'
  const isTrade        = role === 'trade'
  const isApprovedTrader = isTrade && tradeStatus === 'approved'

  // Shared dropdown panel wrapper
  function Dropdown({ name, label, children, wide }: {
    name: string; label: string; children: React.ReactNode; wide?: boolean
  }) {
    const active = activeDropdown === name
    return (
      <div
        className="relative"
        onMouseEnter={() => dropdownEnter(name)}
        onMouseLeave={dropdownLeave}
      >
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

  function MobileCta() {
    if (isLoading) return null
    if (isAdmin) return (
      <div className="pt-3 border-t border-slate-100 space-y-1">
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    if (isApprovedTrader) return (
      <div className="pt-3 border-t border-slate-100 space-y-1">
        <Link href="/trade/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors">
          <LayoutDashboard className="w-4 h-4" /> Trade Dashboard
        </Link>
        <Link href="/account" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
          <User className="w-4 h-4" /> My Account
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" />{loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    )
    return (
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <button onClick={() => { setMobileOpen(false); setSearchOpen(true) }}
          className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
          <Search className="w-4 h-4 text-blue-600" /> Search products
        </button>
        <a href="tel:+35679661889" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700">
          <Phone className="w-4 h-4 text-blue-600" /> +356 7966 1889
        </a>
        <Link href="/quote" className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get a Quote</Button>
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
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <span className={cn('text-[17px] font-bold tracking-tight transition-colors duration-200',
                isTransparent ? 'text-white' : 'text-slate-900')}>
                THE AIRCONDITION SHOP
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">

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
                        All Products
                        <span className="text-xs text-blue-400">View all →</span>
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
                              <Image src={brand.logo_url} alt={brand.name} width={28} height={28}
                                className="object-contain w-full h-full" />
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
                        All Brands
                        <span className="text-xs text-blue-400">View all →</span>
                      </Link>
                    </>
                  )}
                </div>
              </Dropdown>

              {/* BTU Calculator */}
              <Link href="/btu-calculator" className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-sky-300 hover:text-sky-200 hover:bg-white/10' : 'text-sky-600 hover:text-sky-700 hover:bg-sky-50',
                pathname === '/btu-calculator' && !isTransparent && 'text-sky-700 bg-sky-50'
              )}>
                <Calculator aria-hidden="true" className="w-3.5 h-3.5" /> BTU Calculator
              </Link>

              {/* Support */}
              <Link href="/services" className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                pathname === '/services' && !isTransparent && 'text-blue-600 bg-blue-50'
              )}>Support</Link>

              {/* Contact */}
              <Link href="/contact" className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                pathname === '/contact' && !isTransparent && 'text-blue-600 bg-blue-50'
              )}>Contact</Link>

              {/* Trade */}
              <Link href="/trade" className={cn(
                'px-3 py-2 text-sm font-semibold rounded-lg transition-colors',
                isTransparent ? 'text-amber-300 hover:text-amber-200 hover:bg-white/10' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
                pathname === '/trade' && !isTransparent && 'text-amber-700 bg-amber-50'
              )}>Trade</Link>
            </nav>

            <DesktopCta />

            {/* Mobile hamburger */}
            <button
              className={cn('lg:hidden p-2 rounded-lg transition-colors',
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
                {/* Products */}
                <div>
                  <Link href="/products" className="block px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50 rounded-lg transition-colors">
                    Products
                  </Link>
                  {categories.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.slug] ?? DEFAULT_ICON
                    return (
                      <Link key={cat.id} href={`/products/category/${cat.slug}`}
                        className="flex items-center gap-2 pl-6 pr-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Icon aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" /> {cat.name}
                      </Link>
                    )
                  })}
                </div>

                {/* Brands */}
                <div>
                  <Link href="/brands" className="block px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50 rounded-lg transition-colors">
                    Brands
                  </Link>
                  {brands.slice(0, 6).map(brand => (
                    <Link key={brand.id} href={`/brands/${brand.slug}`}
                      className="block pl-6 pr-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      {brand.name}
                    </Link>
                  ))}
                </div>

                <Link href="/btu-calculator" className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                  <Calculator aria-hidden="true" className="w-4 h-4" /> BTU Calculator
                </Link>
                <Link href="/services" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Support</Link>
                <Link href="/contact" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Contact</Link>

                {/* Trade */}
                <div className="mt-2">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mb-1.5">Trade Account</p>
                    <Link href="/trade" className="block text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
                      Trade Portal →
                    </Link>
                  </div>
                </div>

                <MobileCta />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
