import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import QuoteForm from './quote-form'
import { CheckCircle2, Clock, FileText, Phone, Shield, Star, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Request a Free Quote',
  description: 'Get a free, no-obligation quote for air conditioning installation, refrigeration or HVAC services across Malta.',
  alternates: { canonical: 'https://theairconditionshop.com/quote' },
}

const INCLUDES = [
  'Full site survey by a certified engineer',
  'Itemised quote with no hidden costs',
  'Brand recommendations for your budget',
  'Typical delivery & install timelines',
  'Available financing options',
  'Written quote valid for 30 days',
]

const TRUST = [
  { icon: Star,   label: '5-Star Rated',    sub: 'Across Google & Facebook' },
  { icon: Shield, label: 'F-Gas Certified',  sub: 'Fully insured technicians' },
  { icon: Zap,    label: '48h Quote',        sub: 'Fast turnaround guaranteed' },
]

export default function QuotePage() {
  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[46vh] flex items-end overflow-hidden bg-slate-950">
          <Image
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&q=80"
            alt="Professional HVAC quote and consultation"
            fill
            className="object-cover object-center"
            priority
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-40 w-full">
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">Free · No Obligation</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-2xl mb-5">
              Request a
              <br />
              <span className="text-blue-400 italic">Free Quote</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
              Tell us about your project and we&apos;ll provide a detailed, no-obligation quote within 48 hours.
            </p>
          </div>
        </section>

        {/* ── Main grid ── */}
        <section className="py-20 lg:py-24 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 items-start">

              {/* ── Left: trust signals ── */}
              <div>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">What&apos;s Included</p>
                <h2 className="font-display text-3xl text-slate-900 mb-8 leading-tight">
                  Your quote includes everything
                </h2>

                <div className="space-y-3 mb-10">
                  {INCLUDES.map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-[15px] text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-10">
                  {TRUST.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-100">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{label}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 leading-tight mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Process */}
                <div className="p-6 rounded-2xl bg-slate-950 text-white">
                  <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.22em] mb-5">How It Works</p>
                  <div className="space-y-5">
                    {[
                      { n: '01', title: 'Submit this form',      desc: 'Tell us about your space and requirements.' },
                      { n: '02', title: 'We review & call back', desc: 'A specialist calls to understand your needs fully.' },
                      { n: '03', title: 'Free site survey',       desc: 'Our engineer visits and measures your space.' },
                      { n: '04', title: 'Receive written quote',  desc: 'Detailed, itemised quote within 48 hours.' },
                    ].map(({ n, title, desc }) => (
                      <div key={n} className="flex items-start gap-4">
                        <span className="text-2xl font-black text-white/[0.12] font-display w-8 shrink-0 leading-none">{n}</span>
                        <div>
                          <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative CTA */}
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Need it faster?</p>
                    <p className="text-xs text-slate-500">Call us for an immediate consultation.</p>
                  </div>
                  <a href="tel:+35679661889" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors duration-150 shrink-0">
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                </div>
              </div>

              {/* ── Right: form ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.08)] p-8">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="font-display text-2xl text-slate-900">Quote Request</h2>
                </div>
                <p className="text-sm text-slate-500 mb-7">
                  Typically takes under 3 minutes. We&apos;ll respond within 48 hours.
                </p>
                <QuoteForm />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
