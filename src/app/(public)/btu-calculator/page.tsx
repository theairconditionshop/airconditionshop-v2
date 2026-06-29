import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import BtuCalculatorForm from './btu-calculator-form'
import { TrustBadges, InlineTrust } from '@/components/shared/trust-badges'
import { InternalLinkPanel } from '@/components/shared/internal-link-panel'
import { FadeUpSection, AnimatedSection, FadeUp } from '@/components/shared/animated-section'
import { PremiumImage } from '@/components/shared/premium-image'
import {
  Info, Phone, Thermometer, Wind, Zap, ArrowRight,
  ShoppingCart, FileText, CalendarCheck, Users,
  BatteryCharging, Timer, Droplets, Volume2, Leaf,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'BTU Calculator Malta — Find the Right Air Conditioner Size',
  description: 'Free BTU Calculator for Malta. Enter your room dimensions and get an instant BTU and kW recommendation calibrated for Malta\'s climate. No registration required.',
  alternates: { canonical: 'https://www.theairconditionshop.com/btu-calculator' },
}

const TIPS = [
  {
    icon: Thermometer,
    title: 'Malta Climate',
    desc: 'Malta experiences higher summer temperatures than many European countries. Our calculator automatically considers this when estimating the recommended cooling capacity.',
  },
  {
    icon: Wind,
    title: 'Ceiling Height',
    desc: 'Higher ceilings require additional cooling capacity. Enter your actual ceiling height for a more accurate recommendation.',
  },
  {
    icon: Zap,
    title: 'Room Usage',
    desc: 'Bedrooms, living rooms, offices and commercial spaces all generate different heat loads. Select the room type for better results.',
  },
]

const SIZING_MATTERS = [
  {
    icon: BatteryCharging,
    title: 'Lower Electricity Bills',
    desc: 'A correctly sized unit runs efficiently without short-cycling or working harder than necessary — reducing your monthly energy costs.',
  },
  {
    icon: Timer,
    title: 'Longer AC Lifespan',
    desc: 'Oversized units cycle on and off repeatedly, stressing the compressor. Correct sizing means fewer breakdowns and a longer service life.',
  },
  {
    icon: Droplets,
    title: 'Better Humidity Control',
    desc: 'Air conditioners dehumidify as they cool. An undersized unit can\'t keep up with Malta\'s humid summers, leaving rooms feeling clammy.',
  },
  {
    icon: Leaf,
    title: 'More Comfort',
    desc: 'The right size holds a steady temperature without constant switching — fewer hot and cold swings throughout the day.',
  },
  {
    icon: Volume2,
    title: 'Less Noise',
    desc: 'A well-matched unit runs at lower intensity rather than continuously at full power, keeping operation quieter.',
  },
]

const NEXT_STEPS = [
  { icon: ShoppingCart,  label: 'Browse air conditioners',               href: '/products' },
  { icon: FileText,      label: 'Request a free quotation',              href: '/quote' },
  { icon: CalendarCheck, label: 'Book a free site survey',               href: '/contact' },
  { icon: Users,         label: 'Speak with one of our HVAC specialists', href: '/contact' },
]

const FAQS = [
  {
    q: 'What does BTU mean for air conditioning?',
    a: 'BTU stands for British Thermal Unit — a measure of the heat energy an air conditioner can remove from a room per hour. The higher the BTU rating, the more powerful the unit.',
  },
  {
    q: 'How do I convert BTU to kW?',
    a: 'Divide the BTU figure by 3,412 to get kW. For example, 12,000 BTU ÷ 3,412 = 3.52 kW. Most air conditioners in Malta and Europe are labelled in kW.',
  },
  {
    q: 'What is an inverter air conditioner?',
    a: 'An inverter AC adjusts its compressor speed rather than switching fully on and off. This is more energy-efficient, quieter, and maintains a more consistent room temperature — particularly important in Malta\'s long cooling season.',
  },
  {
    q: 'What size air conditioner do I need for a typical Maltese bedroom?',
    a: 'A standard Maltese bedroom of 12–18 m² typically requires a 9,000–12,000 BTU (2.5–3.5 kW) unit. Higher rooms, south-facing windows or poor insulation may require additional capacity.',
  },
  {
    q: 'Do I need a professional to install an air conditioner in Malta?',
    a: 'Yes. By law, air conditioning installation in Malta must be carried out by a certified F-Gas engineer. Our team is fully certified and covers all Malta for residential and commercial installations.',
  },
]

export default function BtuCalculatorPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-20">

        {/* ── Hero ── */}
        <section className="bg-slate-950 pt-14 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            <FadeUpSection className="flex-1 max-w-2xl">
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">
                Free Air Conditioning Tool
              </p>
              <h1 className="font-display text-3xl sm:text-5xl text-white leading-tight mb-4">
                BTU Calculator Malta —{' '}
                <span className="block sm:inline">Find the Right Air Conditioner Size</span>
                <span className="block text-blue-400 italic text-2xl sm:text-4xl mt-1">in under 30 seconds</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-7 max-w-xl">
                Use our free BTU Calculator to estimate the right air conditioner size for your room. Simply enter your room dimensions and receive an instant BTU and kW recommendation based on Malta&apos;s climate.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-7">
                <a href="#calculator"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20">
                  Calculate My BTU <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 text-white hover:bg-white/[0.07] text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
                  Speak to an Expert
                </Link>
              </div>
              <InlineTrust
                items={['Free Tool', 'Malta Climate Adjusted', 'Instant Results', 'No Registration Required']}
                variant="dark"
              />
            </FadeUpSection>

            {/* Right column — hero image */}
            <div className="hidden lg:block lg:w-[420px] xl:w-[480px] shrink-0">
              <FadeUpSection>
                <PremiumImage
                  src={null}
                  alt="Modern bright living room in Malta with wall-mounted air conditioner providing comfortable cooling"
                  fill={false}
                  width={480}
                  height={380}
                  sizes="480px"
                  containerClassName="w-full aspect-[5/4]"
                  rounded="2xl"
                  shadow
                  hoverZoom
                  placeholderLabel="Add room / AC photo via Admin → BTU Calculator"
                />
              </FadeUpSection>
            </div>
            </div>
          </div>
        </section>

        {/* ── Why AC Sizing Matters ── */}
        <section className="bg-[#FAFAF9] py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-12 max-w-2xl">
              <FadeUp>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Why It Matters</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight mb-4">
                  Why Correct AC Sizing Matters
                </h2>
              </FadeUp>
              <FadeUp>
                <p className="text-slate-500 text-base leading-relaxed max-w-lg">
                  Getting the size wrong is one of the most common — and costly — air conditioning mistakes. Too small and it runs non-stop. Too large and it short-cycles, wastes energy and can't control humidity.
                </p>
              </FadeUp>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5" staggerChildren={0.08}>
              {SIZING_MATTERS.map(({ icon: Icon, title, desc }) => (
                <FadeUp key={title}>
                  <div className="h-full flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-[0_8px_32px_-8px_rgba(14,165,233,0.12)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm mb-1.5">{title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Main: tips + calculator ── */}
        <section id="calculator" className="bg-white scroll-mt-20 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-14 items-start">

              {/* ── Left: tips & context ── */}
              <div>
                <FadeUpSection>
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-6">Before You Calculate</p>
                </FadeUpSection>

                <AnimatedSection className="space-y-4 mb-10" staggerChildren={0.1}>
                  {TIPS.map(({ icon: Icon, title, desc }) => (
                    <FadeUp key={title}>
                      <div className="flex gap-4 p-5 rounded-2xl bg-[#FAFAF9] border border-slate-100 hover:border-blue-100 transition-colors duration-200">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    </FadeUp>
                  ))}
                </AnimatedSection>

                {/* BTU reference table */}
                <FadeUpSection>
                  <div className="rounded-2xl bg-[#FAFAF9] border border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Typical Air Conditioner Sizes</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Room Size</th>
                          <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">BTU</th>
                          <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">kW</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { size: 'Up to 15 m²', btu: '9,000 BTU',  kw: '2.5 kW' },
                          { size: '15–25 m²',    btu: '12,000 BTU', kw: '3.5 kW' },
                          { size: '25–35 m²',    btu: '18,000 BTU', kw: '5.0 kW' },
                          { size: '35–50 m²',    btu: '24,000 BTU', kw: '7.0 kW' },
                          { size: '50–80 m²',    btu: '36,000 BTU', kw: '10.5 kW' },
                        ].map(({ size, btu, kw }) => (
                          <tr key={size} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-3 sm:px-5 py-3 text-slate-700 font-medium text-sm">{size}</td>
                            <td className="px-3 sm:px-5 py-3 text-blue-600 font-semibold text-sm">{btu}</td>
                            <td className="px-3 sm:px-5 py-3 text-slate-500 text-sm">{kw}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                      <p className="text-[11px] text-slate-400">Estimates for standard 2.5 m ceiling height in Malta climate.</p>
                    </div>
                  </div>
                </FadeUpSection>

                {/* Expert advice CTA */}
                <FadeUpSection className="mt-6">
                  <div className="p-6 rounded-2xl bg-blue-600 text-white">
                    <p className="font-semibold text-base mb-1.5">Need Professional Advice?</p>
                    <p className="text-sm text-blue-100 mb-5 leading-relaxed">
                      Our team can visit your property, measure the room and recommend the ideal air conditioning system for maximum efficiency.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/contact"
                        className="group inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-150 cursor-pointer">
                        Book Free Site Survey <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                      <a href="tel:+35679661889"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-white/30 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors duration-150 cursor-pointer">
                        <Phone className="w-3.5 h-3.5" /> Call Our Team
                      </a>
                    </div>
                  </div>
                </FadeUpSection>
              </div>

              {/* ── Right: calculator ── */}
              <FadeUpSection delay={0.1}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_48px_-12px_rgba(0,0,0,0.1)] p-8">
                  <h2 className="font-display text-2xl text-slate-900 mb-1">BTU / kW Calculator</h2>
                  <p className="text-sm text-slate-500 mb-7">
                    Calibrated for Malta&apos;s climate — results include a 12% heat load buffer.
                  </p>
                  <BtuCalculatorForm />
                </div>

                {/* Disclaimer */}
                <div className="mt-5 flex gap-3 p-5 rounded-xl bg-amber-50 border border-amber-100">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Estimates only.</strong> Actual requirements vary by insulation, glazing, sun exposure and occupancy.
                    For guaranteed accuracy, book a{' '}
                    <Link href="/contact" className="text-amber-700 underline hover:text-amber-900">free site survey</Link>.
                  </p>
                </div>

                {/* What happens next */}
                <div className="mt-5 bg-[#FAFAF9] rounded-2xl border border-slate-100 p-6">
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-4">What Happens Next?</p>
                  <p className="text-sm text-slate-500 mb-5 leading-relaxed">After calculating your BTU requirement you can:</p>
                  <div className="space-y-3">
                    {NEXT_STEPS.map(({ icon: Icon, label, href }) => (
                      <Link key={label} href={href}
                        className="group flex items-center gap-3 text-sm text-slate-700 hover:text-blue-600 transition-colors duration-150 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{label}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-5">
                  <TrustBadges set="core" variant="light" />
                </div>
              </FadeUpSection>
            </div>
          </div>
        </section>

        {/* ── Internal linking ── */}
        <section className="bg-[#FAFAF9] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <InternalLinkPanel
                heading="What would you like to do next?"
                links={[
                  {
                    label: 'Browse Air Conditioners',
                    description: 'Shop our full range of split, multi-split and VRF systems from Daikin, Gree, Fujitsu and more.',
                    href: '/products',
                    cta: 'Find Your Air Conditioner',
                  },
                  {
                    label: 'Book a Site Survey',
                    description: 'Our F-Gas certified engineers visit your property and recommend the exact system for your needs.',
                    href: '/contact',
                    cta: 'Book a Free Site Survey',
                  },
                  {
                    label: 'View Our Services',
                    description: 'Professional installation, maintenance and emergency repair across Malta. All brands, all properties.',
                    href: '/services',
                    cta: 'View HVAC Services',
                  },
                ]}
              />
            </FadeUpSection>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-12">
              <FadeUp>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3 text-center">Common Questions</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-2xl sm:text-3xl text-slate-900 leading-snug text-center">
                  Frequently Asked Questions About BTU &amp; Air Conditioning in Malta
                </h2>
              </FadeUp>
            </AnimatedSection>

            <AnimatedSection className="space-y-4" staggerChildren={0.07}>
              {FAQS.map(({ q, a }) => (
                <FadeUp key={q}>
                  <div className="bg-[#FAFAF9] rounded-xl border border-slate-100 p-6 hover:border-blue-100 transition-colors duration-200">
                    <p className="font-semibold text-slate-900 text-sm mb-2">{q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>

            <FadeUpSection className="mt-10 text-center">
              <p className="text-sm text-slate-500 mb-4">Still not sure which AC is right for you?</p>
              <Link href="/contact"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-blue-600/20">
                Speak to an HVAC Specialist <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </FadeUpSection>
          </div>
        </section>

        {/* ── SEO footer section ── */}
        <section className="bg-slate-50 py-12 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <h2 className="font-display text-xl text-slate-800 mb-4">BTU Calculator for Air Conditioning in Malta</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Choosing the right air conditioner size is one of the most important decisions you can make before purchasing a new system. In Malta, where summer temperatures regularly exceed 35°C and humidity remains high throughout the cooling season, an undersized unit will struggle to maintain comfort, whilst an oversized unit will cycle inefficiently and fail to dehumidify properly.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                THE AIRCONDITION SHOP supplies and installs air conditioning systems throughout Malta, including split units, multi-split systems, heat pumps and commercial HVAC. Our F-Gas certified engineers provide free site surveys to ensure every installation is correctly specified for the space. <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link> for expert advice or <Link href="/services" className="text-blue-600 hover:underline">view our installation services</Link>.
              </p>
            </FadeUpSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
