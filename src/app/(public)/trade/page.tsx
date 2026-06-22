import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Percent, Phone, Package, Users, ArrowRight, LogIn, Tag, Zap, Headphones } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trade Account — Exclusive Pricing for Installers',
  description: 'Apply for a trade account and access exclusive pricing, priority stock and dedicated support for HVAC and refrigeration products in Malta.',
  alternates: { canonical: 'https://theairconditionshop.com/trade' },
}

const BENEFITS = [
  {
    icon: Tag,
    title: 'Installer Pricing',
    desc: 'Trade-only rates across our full catalogue of Daikin, Mitsubishi Electric, Panasonic and more.',
  },
  {
    icon: Zap,
    title: 'Priority Quotations',
    desc: 'Fast-track quotes and dedicated account management for project work.',
  },
  {
    icon: Package,
    title: 'Priority Stock',
    desc: 'Pre-order and reserve stock before it goes to retail. Never lose a job to lead time.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'Direct line to our technical team for spec queries, warranty and service support.',
  },
]

const ELIGIBLE = [
  'Registered HVAC installers',
  'Refrigeration engineers',
  'Electrical contractors',
  'Facilities management companies',
  'Hotels and hospitality groups',
  'Construction & development companies',
]

export default function TradePage() {
  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[52vh] flex items-end overflow-hidden bg-slate-950">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80"
            alt="Professional HVAC trade and installation"
            fill
            className="object-cover object-center"
            priority
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-40 w-full">
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.28em] mb-4">
              For Installers &amp; Contractors
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-2xl mb-5">
              The Trade
              <br />
              <span className="text-amber-400 italic">Programme</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed mb-8">
              Join Malta&apos;s trusted HVAC trade network. Access exclusive pricing, priority stock and
              dedicated commercial support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/trade/register">
                <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-lg shadow-amber-500/20">
                  Apply for Trade Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" className="gap-2 border border-white/20 bg-transparent text-white hover:bg-white/[0.08] cursor-pointer">
                  <LogIn className="w-4 h-4" /> Trade Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-[0.22em] mb-3">Trade Benefits</p>
              <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight">Built for the trade</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-7 hover:bg-slate-50/60 transition-colors duration-200">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-[15px] mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Eligibility + CTA ── */}
        <section className="py-14 lg:py-20 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

              {/* Who can apply */}
              <div>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Eligibility</p>
                <h2 className="font-display text-3xl text-slate-900 mb-8 leading-tight">Who can apply?</h2>
                <div className="space-y-3 mb-8">
                  {ELIGIBLE.map(e => (
                    <div key={e} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-[15px] text-slate-700">{e}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-100 pt-5">
                  Applications reviewed within 2 business days. A valid Malta VAT number or business registration is required.
                </p>
              </div>

              {/* CTA card */}
              <div className="bg-slate-950 rounded-2xl p-8 lg:p-10">
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.22em] mb-3">Apply Today</p>
                <h3 className="font-display text-2xl text-white mb-3 leading-tight">Ready to get trade pricing?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  The application takes under 5 minutes. Once approved, trade pricing is activated immediately on your account.
                </p>

                {/* Process */}
                <div className="space-y-4 mb-8">
                  {[
                    { n: '01', t: 'Submit application',   d: 'Business details + VAT number' },
                    { n: '02', t: 'Review within 48h',    d: 'Our team verifies your business' },
                    { n: '03', t: 'Pricing activated',    d: 'Trade prices shown across the site' },
                  ].map(({ n, t, d }) => (
                    <div key={n} className="flex items-start gap-4">
                      <span className="font-display text-2xl font-black text-white/[0.12] leading-none w-7 shrink-0">{n}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{t}</p>
                        <p className="text-xs text-slate-500">{d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/trade/register" className="block">
                    <Button size="lg" className="w-full gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer">
                      Apply for Trade Account <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button size="lg" variant="outline" className="w-full gap-2 border-white/15 text-white hover:bg-white/[0.08] cursor-pointer">
                      <LogIn className="w-4 h-4" /> Trade Login
                    </Button>
                  </Link>
                </div>

                <div className="mt-5 flex items-center gap-2 pt-5 border-t border-white/[0.07]">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-500">Questions? Call us on{' '}
                    <a href="tel:+35679661889" className="text-slate-300 hover:text-white transition-colors">+356 7966 1889</a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
