import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Reveal, Stagger, StaggerItem, Magnetic } from '@/components/motion/primitives'
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
      <main id="main-content" className="min-h-screen pt-20 bg-white flex items-center">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">

          {/* Visual */}
          <div className="mb-8">
            <Reveal mode="fade">
              <p className="font-display text-[8rem] sm:text-[10rem] leading-none font-bold text-slate-100 select-none" aria-hidden="true">
                404
              </p>
            </Reveal>
            <div className="-mt-6 sm:-mt-10 relative z-10">
              <Reveal mode="blur">
                <h1 className="font-display text-2xl sm:text-3xl tracking-[-0.02em] text-slate-900 mb-3">
                  Page not found
                </h1>
              </Reveal>
              <Reveal mode="up" delay={0.05}>
                <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
                  We couldn&apos;t find that page. It may have moved, been removed, or the URL might be incorrect.
                </p>
              </Reveal>
            </div>
          </div>

          {/* Primary CTAs */}
          <Reveal mode="up" delay={0.1} className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Magnetic strength={0.2}>
              <Link href="/" className="group inline-flex items-center justify-center gap-2 px-7 h-12 bg-slate-900 text-white text-sm font-semibold hover:bg-blue-600 transition-colors duration-300" style={{ borderRadius: 2 }}>
                Back to Homepage <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Magnetic>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 px-7 h-12 border border-slate-300 text-slate-800 text-sm font-semibold hover:border-slate-900 transition-colors duration-300" style={{ borderRadius: 2 }}>
              Browse Products
            </Link>
          </Reveal>

          {/* Helpful quick-links */}
          <div className="border-t border-slate-200 pt-8">
            <Reveal mode="up">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-5">
                Popular pages
              </p>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-2 max-w-sm mx-auto" gap={0.05}>
              {HELPFUL_LINKS.map(({ href, icon: Icon, label }) => (
                <StaggerItem key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:border-blue-300 transition-colors duration-300 text-left"
                    style={{ borderRadius: 2 }}
                  >
                    <Icon aria-hidden="true" className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
                      {label}
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Contact strip */}
          <Reveal mode="fade" delay={0.1}>
            <p className="mt-10 text-sm text-slate-400">
              Need help?{' '}
              <a href="tel:+35679661889" className="text-blue-600 font-medium hover:underline">
                Call +356 7966 1889
              </a>
            </p>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  )
}
