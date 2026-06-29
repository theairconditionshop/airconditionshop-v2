import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calculator, Phone, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found — THE AIRCONDITION SHOP',
  robots: { index: false },
}

const HELPFUL_LINKS = [
  { href: '/products',       icon: ArrowRight, label: 'Browse Air Conditioners & HVAC' },
  { href: '/btu-calculator', icon: Calculator, label: 'Free BTU Calculator' },
  { href: '/services',       icon: Wrench,     label: 'Installation & Services' },
  { href: '/contact',        icon: Phone,      label: 'Contact Our Team' },
]

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-20 bg-[#FAFAF9] flex items-center">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">

          {/* Visual */}
          <div className="mb-8">
            <p className="font-display text-[8rem] sm:text-[10rem] leading-none font-bold text-slate-100 select-none" aria-hidden="true">
              404
            </p>
            <div className="-mt-6 sm:-mt-10 relative z-10">
              <h1 className="font-display text-2xl sm:text-3xl text-slate-900 mb-3">
                Page not found
              </h1>
              <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find that page. It may have moved, been removed, or the URL might be incorrect.
              </p>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/">
              <Button variant="brand" size="lg" className="w-full sm:w-auto">
                Back to Homepage
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Helpful quick-links */}
          <div className="border-t border-slate-200 pt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-5">
              Popular pages
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
              {HELPFUL_LINKS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 text-left"
                >
                  <Icon aria-hidden="true" className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 transition-colors leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact strip */}
          <p className="mt-10 text-sm text-slate-400">
            Need help?{' '}
            <a href="tel:+35679661889" className="text-blue-600 font-medium hover:underline">
              Call +356 7966 1889
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
