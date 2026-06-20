'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Products', href: '/products' },
  {
    label: 'Solutions',
    children: [
      { label: 'Air Conditioning',         href: '/products/category/air-conditioners' },
      { label: 'Multi-Split Systems',       href: '/products/category/multi-split-systems' },
      { label: 'Commercial Refrigeration',  href: '/products/category/commercial-refrigeration' },
      { label: 'Cold Rooms',               href: '/products/category/cold-rooms' },
      { label: 'Heat Pumps',               href: '/products/category/heat-pumps' },
      { label: 'HVAC Tools',               href: '/products/category/hvac-tools' },
    ],
  },
  { label: 'Brands',   href: '/brands' },
  { label: 'Services', href: '/services' },
  { label: 'Blog',     href: '/blog' },
  { label: 'About',    href: '/about' },
  { label: 'Trade',    href: '/trade', isTrade: true },
]

interface NavbarProps {
  transparent?: boolean
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActive] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isTransparent = transparent && !scrolled && !mobileOpen

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className={cn(
              'text-lg font-bold tracking-tight transition-colors duration-200',
              isTransparent ? 'text-white' : 'text-slate-900'
            )}>
              THE AIRCONDITION SHOP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActive(item.label)}
                  onMouseLeave={() => setActive(null)}
                >
                  <button className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer',
                    isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}>
                    {item.label}
                    <ChevronDown className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      activeDropdown === item.label && 'rotate-180'
                    )} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-50"
                      >
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer',
                    // Trade item — amber highlight
                    (item as { isTrade?: boolean }).isTrade
                      ? isTransparent
                        ? 'text-amber-300 hover:text-amber-200 hover:bg-white/10 font-semibold'
                        : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-semibold'
                      : isTransparent
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    pathname === item.href && !isTransparent && !(item as { isTrade?: boolean }).isTrade && 'text-blue-600 bg-blue-50'
                  )}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+35679661889"
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer',
                isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Phone className="w-3.5 h-3.5" />
              +356 7966 1889
            </a>

            {/* Trade Login */}
            <Link
              href="/trade/login"
              className={cn(
                'text-sm font-medium transition-colors duration-200 cursor-pointer',
                isTransparent
                  ? 'text-amber-300/80 hover:text-amber-200'
                  : 'text-amber-600/80 hover:text-amber-700'
              )}
            >
              Trade Login
            </Link>

            {/* Get a Quote — blue-600 */}
            <Link href="/quote">
              <Button
                size="sm"
                className={cn(
                  'transition-all duration-200 cursor-pointer',
                  isTransparent
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                )}
              >
                Get a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors duration-200 cursor-pointer',
              isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
            )}
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
              {NAV_ITEMS.map(item =>
                item.children ? (
                  <div key={item.label}>
                    <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (item as { isTrade?: boolean }).isTrade ? (
                  /* Trade — prominent amber block */
                  <div key={item.href} className="mt-2">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mb-1.5">
                        Trade Account
                      </p>
                      <Link
                        href={item.href!}
                        className="block text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors duration-200"
                      >
                        Trade Portal →
                      </Link>
                      <Link
                        href="/trade/login"
                        className="block mt-1 text-sm text-amber-600/80 hover:text-amber-700 transition-colors duration-200"
                      >
                        Trade Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )
              )}

              {/* Mobile bottom: phone + CTA */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <a
                  href="tel:+35679661889"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  +356 7966 1889
                </a>
                <Link href="/quote" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 cursor-pointer">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
