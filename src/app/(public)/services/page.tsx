import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ServiceRequestForm from './service-request-form'
import { PremiumImage } from '@/components/shared/premium-image'
import { TrustBadges } from '@/components/shared/trust-badges'
import { InternalLinkPanel } from '@/components/shared/internal-link-panel'
import { FadeUpSection, AnimatedSection, FadeUp } from '@/components/shared/animated-section'
import {
  Wrench, Calendar, Shield, Clock, CheckCircle2, ThumbsUp,
  ArrowRight, Phone, Award, Globe, Thermometer, Snowflake,
  Building2, BarChart3, BatteryCharging, Wind, Leaf, ShieldCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Air Conditioning Installation, Repairs & Servicing in Malta',
  description: 'Professional air conditioning installation, AC repairs and HVAC servicing across Malta. F-Gas certified engineers. Residential and commercial. Fast response, all brands.',
  alternates: { canonical: 'https://www.theairconditionshop.com/services' },
}

const SERVICES = [
  {
    icon: Wrench,
    title: 'Air Conditioning Installation',
    desc: 'F-Gas certified engineers install split, multi-split and VRF systems for homes, apartments, offices and commercial buildings throughout Malta.',
    detail: 'All major brands. Residential and commercial.',
  },
  {
    icon: Thermometer,
    title: 'Heat Pump Installation',
    desc: 'Supply and installation of heat pump systems for efficient heating and cooling across Malta. Ideal for both new builds and retrofit projects.',
    detail: 'Energy-efficient solutions for homes and businesses.',
  },
  {
    icon: Calendar,
    title: 'Preventive Maintenance',
    desc: 'Annual and bi-annual servicing to keep your system running at peak efficiency. Service contracts available for residential and commercial properties.',
    detail: 'Extends equipment lifespan. Preserves manufacturer warranty.',
  },
  {
    icon: Clock,
    title: 'Emergency Repairs',
    desc: 'Fast diagnosis and emergency repairs for all major brands. Same-day response for critical HVAC and refrigeration failures across Malta.',
    detail: 'Genuine manufacturer parts. Most repairs same or next day.',
  },
  {
    icon: Building2,
    title: 'Commercial HVAC',
    desc: 'Design and installation of large-scale VRF and commercial HVAC systems for offices, hotels, retail outlets and industrial premises in Malta.',
    detail: 'Full project management from design to commissioning.',
  },
  {
    icon: Snowflake,
    title: 'Commercial Refrigeration',
    desc: 'Supply and installation of cold rooms, display units and commercial refrigeration equipment for hotels, restaurants, supermarkets and retail outlets.',
    detail: 'All Malta. Industrial and commercial scale.',
  },
  {
    icon: BarChart3,
    title: 'VRF Systems',
    desc: 'Design and installation of Variable Refrigerant Flow systems for large commercial buildings, offices and hospitality venues across Malta.',
    detail: 'High efficiency. Zone control. Long-term reliability.',
  },
  {
    icon: Shield,
    title: 'Annual Service Contracts',
    desc: 'Scheduled maintenance agreements for businesses, landlords and property managers. Priority response, discounted call-out rates and full service records.',
    detail: 'Available for residential and commercial properties.',
  },
]

const PROCESS = [
  { step: '01', title: 'Contact Us', desc: 'Call, WhatsApp or submit the form below. We\'ll confirm your appointment within one business day.' },
  { step: '02', title: 'Free Site Visit', desc: 'Our engineer visits your property, assesses your requirements and provides a detailed written quotation.' },
  { step: '03', title: 'Professional Installation', desc: 'F-Gas certified technicians complete the work cleanly, on time and to manufacturer specification.' },
  { step: '04', title: 'Testing & Demonstration', desc: 'Every installation is fully tested before we leave. We walk you through operation, modes and controls.' },
  { step: '05', title: 'After-Sales Support', desc: '12-month workmanship guarantee. Full manufacturer warranty on parts. We\'re here if you need us.' },
]

const FEATURES = [
  'F-Gas certified and insured engineers',
  'Official stockist — Daikin, Gree, Fujitsu',
  'Same-day emergency response across Malta',
  'All major brands installed and serviced',
  'Full manufacturer warranty on equipment',
  'Residential and commercial projects',
  'Free site survey for new installations',
  'Experienced engineers for homes and businesses',
]

const SERVICING_BENEFITS = [
  {
    icon: BatteryCharging,
    title: 'Lower Electricity Use',
    desc: 'A dirty or poorly maintained system works harder to reach the set temperature. Annual servicing restores efficiency and reduces your energy bills.',
  },
  {
    icon: Clock,
    title: 'Longer Equipment Lifespan',
    desc: 'Regular servicing catches minor issues before they become major failures, extending the working life of your system significantly.',
  },
  {
    icon: Wind,
    title: 'Cleaner Air',
    desc: 'Blocked filters and contaminated coils circulate dust, bacteria and allergens. A full service clean improves air quality throughout your home or office.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Protection',
    desc: 'Most manufacturers require annual servicing to keep the warranty valid. Our service records provide the documentation you need.',
  },
  {
    icon: Leaf,
    title: 'Environmental Responsibility',
    desc: 'Efficient systems use less energy. Regular checks also identify refrigerant leaks, which harm the environment and reduce cooling performance.',
  },
]

const AREAS = [
  'Mosta', 'Valletta', 'Sliema', "St Julian's", 'Birkirkara',
  'Mellieħa', 'Naxxar', 'Bugibba', 'Qormi', 'Rabat', 'Marsaskala', 'Gozo',
]

const FAQS = [
  {
    q: 'How much does air conditioning installation cost in Malta?',
    a: 'Installation costs vary depending on the type of system, the number of units and the complexity of the job. We offer free site surveys and written quotations before any work begins — contact us for a no-obligation quote.',
  },
  {
    q: 'Do you service all brands of air conditioner?',
    a: 'Yes. Our certified engineers service and repair all major brands including Daikin, Gree, Fujitsu, Mitsubishi, LG, Samsung, Panasonic and others. We carry a wide range of genuine parts.',
  },
  {
    q: 'How long does a standard AC installation take?',
    a: 'A single split unit installation typically takes 3–5 hours. Multi-split and commercial systems vary depending on scope. We\'ll give you a clear time estimate during your free site survey.',
  },
  {
    q: 'Do you offer emergency repairs in Malta?',
    a: 'Yes. We offer same-day emergency response for critical HVAC and refrigeration failures across Malta. Call +356 7966 1889 for immediate assistance.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <Navbar transparent />
      <main id="main-content" className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[56vh] flex items-end overflow-hidden bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-500/8 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 sm:pt-36 lg:pt-44 lg:pb-20 w-full">
            <FadeUpSection>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">
                Professional HVAC Services
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[3.25rem] text-white leading-tight max-w-3xl mb-3">
                Air Conditioning Installation, Repairs &amp; Servicing in Malta
              </h1>
              <p className="text-blue-400 italic text-xl sm:text-2xl mb-5">by F-Gas Certified Engineers</p>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                Whether you need a new air conditioner installed, an urgent repair or scheduled servicing, our experienced team delivers reliable HVAC solutions across Malta for homes and businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href="#book"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20">
                  Book a Service <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link href="/quote"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 text-white hover:bg-white/[0.07] text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
                  Request a Quote
                </Link>
                <a href="tel:+35679661889"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-red-500/40 text-red-400 hover:bg-red-600/10 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
                  <Phone className="w-4 h-4" /> Emergency Call
                </a>
              </div>
              <TrustBadges set="service" variant="dark" />
            </FadeUpSection>
          </div>
        </section>

        {/* ── Services grid ── */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-14">
              <FadeUp>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">What We Do</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight max-w-2xl">
                  Our Air Conditioning Services
                </h2>
              </FadeUp>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerChildren={0.07}>
              {SERVICES.map(({ icon: Icon, title, desc, detail }) => (
                <FadeUp key={title}>
                  <div className="group h-full flex flex-col p-7 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-[0_12px_40px_-12px_rgba(14,165,233,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-[15px] mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3 flex-1">{desc}</p>
                    <p className="text-xs text-slate-400 italic">{detail}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Why regular servicing saves money ── */}
        <section className="py-16 lg:py-24 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

              {/* Left — image */}
              <FadeUpSection>
                <div className="relative aspect-[4/3]">
                  <PremiumImage
                    src={null}
                    alt="F-Gas certified engineer servicing an air conditioning system in Malta"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    containerClassName="absolute inset-0"
                    rounded="2xl"
                    shadow
                    hoverZoom
                    placeholderLabel="Add engineer / service photo via Admin → Services"
                    placeholderIcon={<Wrench className="w-5 h-5 text-slate-400" aria-hidden="true" />}
                  />
                  <div className="absolute bottom-5 left-5 z-10">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-[12px] font-medium text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      F-Gas Certified Engineers
                    </span>
                  </div>
                </div>
              </FadeUpSection>

              {/* Right — copy */}
              <div>
                <AnimatedSection staggerChildren={0.1}>
                  <FadeUp>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Preventive Care</p>
                  </FadeUp>
                  <FadeUp>
                    <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight mb-5">
                      Why Regular Servicing Saves You Money
                    </h2>
                  </FadeUp>
                  <FadeUp>
                    <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
                      An air conditioner that is never serviced works progressively harder to maintain the same output. The result is higher electricity bills, more frequent breakdowns and a shorter lifespan. Annual maintenance is one of the most cost-effective investments you can make.
                    </p>
                  </FadeUp>

                  <AnimatedSection className="space-y-4 mb-8" staggerChildren={0.08}>
                    {SERVICING_BENEFITS.map(({ icon: Icon, title, desc }) => (
                      <FadeUp key={title}>
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-4.5 h-4.5 text-blue-600" aria-hidden="true" style={{ width: 18, height: 18 }} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm mb-0.5">{title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      </FadeUp>
                    ))}
                  </AnimatedSection>

                  <FadeUp>
                    <a href="#book"
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-blue-600/15">
                      Book a Service <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </FadeUp>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* ── Installation process ── */}
        <section className="py-16 lg:py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-16 text-center max-w-2xl mx-auto">
              <FadeUp>
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.22em] mb-3">Our Process</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-3xl lg:text-4xl text-white leading-tight">
                  How Our Installation Process Works
                </h2>
              </FadeUp>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5" staggerChildren={0.08}>
              {PROCESS.map(({ step, title, desc }) => (
                <FadeUp key={step}>
                  <div className="h-full p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-200">
                    <span className="block text-5xl font-black text-white/[0.07] leading-none mb-5 font-display select-none">
                      {step}
                    </span>
                    <h3 className="font-bold text-white text-[15px] mb-2">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Why us + booking ── */}
        <section id="book" className="py-16 lg:py-24 bg-[#FAFAF9] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-start">

              {/* Left — features */}
              <div>
                <AnimatedSection staggerChildren={0.08}>
                  <FadeUp>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Why Choose Us</p>
                  </FadeUp>
                  <FadeUp>
                    <h2 className="font-display text-3xl lg:text-4xl text-slate-900 mb-8 leading-tight">
                      Why Customers Choose THE AIRCONDITION SHOP
                    </h2>
                  </FadeUp>

                  <FadeUp>
                    <div className="space-y-3 mb-10">
                      {FEATURES.map(f => (
                        <div key={f} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                          <span className="text-slate-700 text-[15px]">{f}</span>
                        </div>
                      ))}
                    </div>
                  </FadeUp>

                  {/* Trust badges */}
                  <FadeUp>
                    <div className="grid grid-cols-3 gap-3 mb-10">
                      {[
                        { icon: Globe,  label: 'F-Gas Certified',      sub: 'All engineers' },
                        { icon: Award,  label: 'Official Brands',       sub: 'Daikin · Gree · Fujitsu' },
                        { icon: Shield, label: 'Manufacturer Warranty', sub: 'On all equipment' },
                      ].map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="text-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                        </div>
                      ))}
                    </div>
                  </FadeUp>

                  {/* Guarantee */}
                  <FadeUp>
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 mb-8">
                      <div className="flex items-start gap-3">
                        <ThumbsUp className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm mb-1">12-Month Workmanship Guarantee</p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            All workmanship is guaranteed for 12 months. Parts carry the original manufacturer warranty. No hidden costs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </FadeUp>

                  {/* Areas served */}
                  <FadeUp>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.22em] mb-3">Areas We Cover</p>
                      <div className="flex flex-wrap gap-2">
                        {AREAS.map(area => (
                          <span key={area} className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                            {area}
                          </span>
                        ))}
                        <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold">
                          All Malta
                        </span>
                      </div>
                    </div>
                  </FadeUp>
                </AnimatedSection>
              </div>

              {/* Right — form */}
              <FadeUpSection delay={0.1}>
                {/* Emergency banner */}
                <div className="mb-5 flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-200">
                  <span className="flex-none w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-red-600" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-red-800">Emergency?</p>
                    <p className="text-xs text-red-600">Don&apos;t fill this form — call us now for same-day dispatch.</p>
                  </div>
                  <a href="tel:+35679661889" className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                    +356 79661889
                  </a>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_48px_-12px_rgba(0,0,0,0.08)] p-8">
                  <h2 className="font-display text-2xl text-slate-900 mb-1">Request an Air Conditioning Service</h2>
                  <p className="text-sm text-slate-500 mb-7">
                    We&apos;ll contact you within one business day to confirm your appointment.
                  </p>
                  <ServiceRequestForm />
                </div>

                {/* WhatsApp CTA */}
                <a href="https://wa.me/35679661889" target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Prefer to message us?</p>
                    <p className="text-xs text-green-600">Send us a WhatsApp — +356 7966 1889</p>
                  </div>
                </a>

                <div className="mt-5">
                  <TrustBadges set="core" variant="light" />
                </div>
              </FadeUpSection>
            </div>
          </div>
        </section>

        {/* ── Internal links ── */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <InternalLinkPanel
                heading="Explore more"
                links={[
                  { label: 'BTU Calculator', description: 'Not sure what size AC you need? Get an instant BTU and kW recommendation tailored to Malta\'s climate.', href: '/btu-calculator', cta: 'Calculate My BTU' },
                  { label: 'Shop Air Conditioners', description: 'Browse our full range of Daikin, Gree, Fujitsu and other leading HVAC brands available in Malta.', href: '/products', cta: 'Browse Products' },
                  { label: 'Trade Accounts', description: 'HVAC installer or contractor? Apply for a trade account and access exclusive pricing and support.', href: '/trade', cta: 'View Trade Pricing' },
                ]}
              />
            </FadeUpSection>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14 lg:py-16 bg-[#FAFAF9]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-10">
              <FadeUp>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3 text-center">Common Questions</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-2xl sm:text-3xl text-slate-900 leading-snug text-center">
                  Frequently Asked Questions About Air Conditioning Services in Malta
                </h2>
              </FadeUp>
            </AnimatedSection>
            <AnimatedSection className="space-y-4" staggerChildren={0.07}>
              {FAQS.map(({ q, a }) => (
                <FadeUp key={q}>
                  <div className="bg-white rounded-xl border border-slate-100 p-6 hover:border-blue-100 transition-colors duration-200">
                    <p className="font-semibold text-slate-900 text-sm mb-2">{q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── SEO footer ── */}
        <section className="bg-white py-12 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <h2 className="font-display text-xl text-slate-800 mb-4">Air Conditioning Installation &amp; HVAC Services in Malta</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                THE AIRCONDITION SHOP provides professional air conditioning installation, AC repairs and scheduled servicing across Malta. Our F-Gas certified engineers work on residential properties, commercial buildings, hotels, offices and industrial facilities throughout the island, including Gozo.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                We are an authorised installer and stockist for Daikin, Gree and Fujitsu air conditioning systems. All installations include a 12-month workmanship guarantee and full manufacturer warranty on equipment. <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link> for a free site survey and quotation, or <Link href="/trade" className="text-blue-600 hover:underline">apply for a trade account</Link> if you are a registered HVAC installer or contractor.
              </p>
            </FadeUpSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
