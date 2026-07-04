import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import QuoteForm from './quote-form'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { CheckCircle2, Clock, FileText, Phone, Globe, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Request a Free Quote',
  description: 'Get a free, no-obligation quote for air conditioning installation, refrigeration or HVAC services across Malta.',
  alternates: { canonical: 'https://www.theairconditionshop.com/quote' },
}

const INCLUDES = [
  'Full site survey by a certified engineer',
  'Itemised quote with no hidden costs',
  'Brand recommendations for your budget',
  'Typical delivery & install timelines',
  'We can discuss available financing options if required.',
  'Written quote valid for 30 days',
]

const TRUST = [
  { icon: Globe,  label: 'Malta Based',      sub: 'Mosta showroom' },
  { icon: Shield, label: 'F-Gas Certified',  sub: 'Fully insured technicians' },
  { icon: Zap,    label: '48h Quote',        sub: 'Fast turnaround' },
]

const STEPS = [
  { n: '01', title: 'Submit this form',      desc: 'Tell us about your space and requirements.' },
  { n: '02', title: 'We review & call back', desc: 'A specialist calls to understand your needs fully.' },
  { n: '03', title: 'Free site survey',      desc: 'Our engineer visits and measures your space.' },
  { n: '04', title: 'Receive written quote', desc: 'Detailed, itemised quote within 48 hours.' },
]

export default function QuotePage() {
  return (
    <>
      <Navbar transparent />
      <main id="main-content" className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[46vh] flex items-end overflow-hidden bg-[#f4f8fb] pt-24">
          <div aria-hidden className="absolute -top-32 left-[-6%] w-[600px] h-[420px] rounded-full bg-blue-400/[0.10] blur-[130px] pointer-events-none" />
          <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <Reveal mode="up">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-5">Free · No Obligation</p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] text-slate-900 leading-[1.0] max-w-2xl mb-4">
                Request a free quote.
              </h1>
            </Reveal>
            <Reveal mode="up" delay={0.1}>
              <p className="text-slate-600 text-lg max-w-lg leading-relaxed">
                Tell us about your project and we&apos;ll provide a detailed, no-obligation quote within 48 hours.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Main grid ── */}
        <section className="py-16 lg:py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 items-start">

              {/* ── Left: trust signals ── */}
              <div>
                <Reveal mode="up"><p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-4">What&apos;s Included</p></Reveal>
                <Reveal mode="blur" delay={0.05}>
                  <h2 className="font-display text-3xl lg:text-4xl tracking-[-0.02em] text-slate-900 mb-8 leading-tight">
                    Your quote includes everything.
                  </h2>
                </Reveal>

                <Stagger className="space-y-3 mb-10" gap={0.04}>
                  {INCLUDES.map(item => (
                    <StaggerItem key={item}>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-[15px] text-slate-700">{item}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>

                {/* Trust badges */}
                <Stagger className="grid grid-cols-3 gap-2 sm:gap-3 mb-10" gap={0.06}>
                  {TRUST.map(({ icon: Icon, label, sub }) => (
                    <StaggerItem key={label}>
                      <div className="text-center p-3 sm:p-4 border border-slate-200" style={{ borderRadius: 2 }}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 border border-slate-200 bg-blue-50 flex items-center justify-center mx-auto mb-1.5 sm:mb-2" style={{ borderRadius: 2 }}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{label}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 leading-tight mt-0.5">{sub}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>

                {/* Process — intentionally dark, matches Services technical section */}
                <Reveal mode="up">
                  <div className="p-6 bg-slate-950 text-white" style={{ borderRadius: 2 }}>
                    <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.22em] mb-5">How It Works</p>
                    <div className="space-y-5">
                      {STEPS.map(({ n, title, desc }) => (
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
                </Reveal>

                {/* Alternative CTA */}
                <Reveal mode="up" delay={0.05}>
                  <div className="mt-6 flex items-center gap-3 p-4 border border-slate-200" style={{ borderRadius: 2 }}>
                    <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Need it faster?</p>
                      <p className="text-xs text-slate-500">Call or message us for an immediate consultation.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <a href="tel:+35679661889" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors duration-150">
                        <Phone className="w-4 h-4" /> Call
                      </a>
                      <span className="text-slate-200">|</span>
                      <a href="https://wa.me/35679661889" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition-colors duration-150">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* ── Right: form ── */}
              <Reveal mode="scale" delay={0.1}>
                <div className="bg-white border border-slate-200 p-8" style={{ borderRadius: 2 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="font-display text-2xl tracking-[-0.02em] text-slate-900">Quote Request</h2>
                  </div>
                  <p className="text-sm text-slate-500 mb-7">
                    Typically takes under 3 minutes. We&apos;ll respond within 48 hours.
                  </p>
                  <QuoteForm />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
