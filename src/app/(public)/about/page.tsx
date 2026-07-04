import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { PremiumImage } from '@/components/shared/premium-image'
import { Reveal, Stagger, StaggerItem, Magnetic } from '@/components/motion/primitives'
import { getCachedAboutPageData } from '@/lib/data/about-page-cache'
import { MapPin, Phone, Mail, Globe, Building2, Briefcase, Home, CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: "About Us — Malta's HVAC Specialists",
  description: "Learn about THE AIRCONDITION SHOP — Malta's specialist in HVAC, refrigeration and climate control.",
  alternates: { canonical: 'https://www.theairconditionshop.com/about' },
}

const PILLARS = [
  { icon: Globe,     value: 'Malta Based',             label: 'Locally owned and operated from Mosta' },
  { icon: Home,      value: 'Homes & Trade',           label: 'Serving homeowners, contractors and businesses' },
  { icon: Building2, value: 'Residential & Commercial', label: 'From domestic split units to full VRF systems' },
  { icon: Briefcase, value: 'Expert Support',           label: 'Technical guidance and after-sales service' },
]

const VALUES = [
  { title: 'Expert Knowledge', desc: 'Technical knowledge across leading HVAC and refrigeration brands. We know the products inside out.' },
  { title: 'Quality First',    desc: 'We only stock brands we trust. Every product is backed by manufacturer warranty and our own after-sales support.' },
  { title: 'Fast Response',    desc: 'Emergency call-outs answered quickly. Scheduled service confirmed the same business day.' },
  { title: 'Transparent Pricing', desc: 'No hidden fees. Clear trade and retail pricing. Honest quotes with no surprises.' },
]

export default async function AboutPage() {
  const { showroomPhotoUrl } = await getCachedAboutPageData()

  return (
    <>
      <Navbar transparent />
      <main id="main-content" className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[52vh] flex items-end overflow-hidden bg-[#f4f8fb] pt-24">
          <div aria-hidden className="absolute -top-32 right-[-6%] w-[600px] h-[420px] rounded-full bg-blue-400/[0.10] blur-[130px] pointer-events-none" />
          <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <Reveal mode="up"><p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-5">About Us</p></Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] text-slate-900 leading-[1.0] max-w-2xl mb-4">
                Malta&apos;s HVAC specialists.
              </h1>
            </Reveal>
            <Reveal mode="up" delay={0.1}>
              <p className="text-slate-600 text-lg max-w-lg leading-relaxed">
                Supplying, installing, and servicing HVAC and refrigeration equipment across Malta. Based in Mosta. Serving the whole island.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Pillars strip ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Stagger className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100" gap={0.06}>
              {PILLARS.map(({ icon: Icon, value, label }) => (
                <StaggerItem key={value}>
                  <div className="flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
                    <div className="w-10 h-10 border border-slate-200 bg-blue-50 flex items-center justify-center mb-1" style={{ borderRadius: 2 }}>
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="font-display text-base font-semibold text-slate-900 leading-snug">{value}</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{label}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="py-16 lg:py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-start">

              <div>
                <Reveal mode="up"><p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Our Story</p></Reveal>
                <Reveal mode="blur" delay={0.05}>
                  <h2 className="font-display text-3xl lg:text-4xl tracking-[-0.02em] text-slate-900 mb-8 leading-tight">
                    Built in Mosta,<br />serving all Malta.
                  </h2>
                </Reveal>

                <Stagger className="space-y-5 text-slate-600 leading-relaxed text-[15px]" gap={0.06}>
                  <StaggerItem>
                    <p>
                      THE AIRCONDITION SHOP is a Malta-based specialist in HVAC and refrigeration equipment.
                      Operating from our showroom in Mosta, we supply products to retail and trade customers,
                      run our own installation teams, and provide maintenance and service contracts across
                      residential and commercial properties.
                    </p>
                  </StaggerItem>
                  <StaggerItem>
                    <p>
                      We supply and support a comprehensive range of HVAC and refrigeration equipment from leading
                      manufacturers. Our range covers domestic split systems, multi-split configurations, VRF commercial
                      systems, refrigeration cabinets, cold rooms, heat pumps, ventilation, and HVAC accessories.
                    </p>
                  </StaggerItem>
                  <StaggerItem>
                    <p>
                      Whether you are a homeowner upgrading your living room unit, a property manager
                      overseeing multiple sites, or a contractor fitting out a hotel, we have the products,
                      technical expertise, and support to get the job done right.
                    </p>
                  </StaggerItem>
                </Stagger>

                <Reveal mode="up" delay={0.1} className="mt-8 flex flex-wrap gap-3">
                  <Magnetic strength={0.2}>
                    <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-6 h-12 bg-slate-900 text-white text-sm font-semibold hover:bg-blue-600 transition-colors duration-300" style={{ borderRadius: 2 }}>
                      Get in Touch <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Magnetic>
                  <Link href="/trade" className="inline-flex items-center justify-center gap-2 px-6 h-12 border border-slate-300 text-slate-800 text-sm font-semibold hover:border-slate-900 transition-colors duration-300" style={{ borderRadius: 2 }}>
                    Trade Accounts
                  </Link>
                </Reveal>
              </div>

              <div className="space-y-3">
                <Reveal mode="scale">
                  <div className="relative aspect-[16/9] mb-5 border border-slate-200">
                    <PremiumImage
                      src={showroomPhotoUrl}
                      alt="THE AIRCONDITION SHOP — Mosta showroom, Malta"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      rounded="none"
                      placeholderLabel="Add showroom photo via Admin → Homepage → About Page Photo"
                      hoverZoom
                    />
                  </div>
                </Reveal>
                <Stagger gap={0.05}>
                  {VALUES.map(v => (
                    <StaggerItem key={v.title}>
                      <div className="flex gap-4 p-5 bg-white border border-slate-200 hover:border-blue-300 transition-colors duration-300 mb-3" style={{ borderRadius: 2 }}>
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 text-[15px] mb-1">{v.title}</p>
                          <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          </div>
        </section>

        {/* ── Google Review CTA ── */}
        <section className="py-12 bg-[#f8f9fa] border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal mode="up" className="max-w-xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 border border-amber-200 bg-amber-50 mb-4" style={{ borderRadius: 2 }}>
                <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 0 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
                </svg>
              </div>
              <h2 className="font-display text-2xl tracking-[-0.02em] text-slate-900 mb-2">Happy with our service?</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                A Google review takes under a minute and helps other Maltese homeowners and businesses find a trustworthy HVAC supplier.
              </p>
              <a
                href="https://g.page/r/CdjWGAZmBi4pEAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors duration-300"
                style={{ borderRadius: 2 }}
              >
                Leave a Google Review <ArrowRight className="w-4 h-4" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ── Contact info — intentionally dark, matches Services/Trade technical language ── */}
        <section className="relative py-16 bg-slate-950 overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Reveal mode="blur"><h2 className="font-display text-3xl tracking-[-0.02em] text-white">Visit our showroom.</h2></Reveal>
              <Reveal mode="up" delay={0.05}><p className="text-slate-400 mt-2 text-sm">Come and see our full range in person — Mosta, Malta</p></Reveal>
            </div>
            <Stagger className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto" gap={0.06}>
              <StaggerItem>
                <div className="flex flex-col items-center gap-3 p-6 border border-white/[0.10] bg-white/[0.02] text-center h-full" style={{ borderRadius: 2 }}>
                  <div className="w-11 h-11 border border-blue-500/20 bg-blue-600/20 flex items-center justify-center" style={{ borderRadius: 2 }}>
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Address</p>
                  <p className="text-sm text-slate-300 leading-relaxed">220 Vjal L-Indipendenza<br />Mosta MST 9022, Malta</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col items-center gap-3 p-6 border border-white/[0.10] bg-white/[0.02] text-center h-full" style={{ borderRadius: 2 }}>
                  <div className="w-11 h-11 border border-blue-500/20 bg-blue-600/20 flex items-center justify-center" style={{ borderRadius: 2 }}>
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Phone</p>
                  <a href="tel:+35679661889" className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors">+356 7966 1889</a>
                  <p className="text-xs text-slate-500">Mon–Fri 08:00–18:00</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col items-center gap-3 p-6 border border-white/[0.10] bg-white/[0.02] text-center h-full" style={{ borderRadius: 2 }}>
                  <div className="w-11 h-11 border border-blue-500/20 bg-blue-600/20 flex items-center justify-center" style={{ borderRadius: 2 }}>
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</p>
                  <a href="mailto:support@theairconditionshop.com"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors break-all">
                    support@theairconditionshop.com
                  </a>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
