import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ServiceRequestForm from './service-request-form'
import {
  Wrench, Calendar, Shield, Clock, CheckCircle2, ThumbsUp,
  ArrowRight, Phone, Star, Award, Zap,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'HVAC & Refrigeration Services — Installation, Maintenance & Repair',
  description: 'Professional HVAC installation, servicing and emergency repair across Malta. Certified technicians, all major brands, 24/7 emergency response.',
  alternates: { canonical: 'https://theairconditionshop.com/services' },
}

const SERVICES = [
  {
    icon: Wrench,
    title: 'Installation',
    desc: 'New AC and refrigeration equipment installed by certified technicians. Residential and commercial.',
    detail: 'From single split units to full VRF commercial systems.',
  },
  {
    icon: Calendar,
    title: 'Maintenance',
    desc: 'Annual and bi-annual servicing to keep your system running at peak efficiency year-round.',
    detail: 'Service contracts available for residential and commercial properties.',
  },
  {
    icon: Shield,
    title: 'Repair',
    desc: 'Fast diagnosis and repair of all faults. Most repairs completed same or next day.',
    detail: 'All major brands. Genuine manufacturer parts used.',
  },
  {
    icon: Clock,
    title: 'Emergency',
    desc: '24/7 emergency response for critical refrigeration and HVAC failures across Malta.',
    detail: 'Average response time under 4 hours.',
  },
]

const PROCESS = [
  { step: '01', title: 'Book Online or Call', desc: 'Submit your request below or call +356 7966 1889. We confirm within 2 hours.' },
  { step: '02', title: 'Free Site Survey', desc: 'Our engineer visits, assesses your needs, and provides a detailed quotation.' },
  { step: '03', title: 'Professional Installation', desc: 'Certified technicians complete the work cleanly and on time.' },
  { step: '04', title: 'After-Care Support', desc: '12-month workmanship guarantee. Full manufacturer warranty on parts.' },
]

const FEATURES = [
  'Certified & insured technicians',
  'Same-day response for emergencies',
  'All major brands serviced',
  'Warranty on all parts & labour',
  'Free site survey for new installs',
  'Post-service report provided',
]

const AREAS = [
  'Mosta', "St Julian's", 'Sliema', 'Valletta', 'Mdina', 'Naxxar',
  'Mellieħa', 'Bugibba', 'Birkirkara', 'Qormi', 'Rabat', 'Marsaskala',
]

export default function ServicesPage() {
  return (
    <>
      <Navbar transparent />
      <main id="top" className="min-h-screen">

        {/* Hero */}
        <section className="relative min-h-[68vh] flex items-end overflow-hidden bg-slate-950">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=85"
            alt="HVAC technician performing professional installation"
            fill
            className="object-cover object-center"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20 pt-44 w-full">
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">
              Professional Services
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-3xl mb-5">
              HVAC &amp; Refrigeration
              <br />
              <span className="text-blue-400 italic">Services in Malta</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed mb-8">
              Expert installation, maintenance, and repair for homes and businesses.
              Fast response, certified technicians, guaranteed workmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#book" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
                Book a Service <ArrowRight className="w-4 h-4" />
              </a>
              <a href="tel:+35679661889" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 text-white hover:bg-white/[0.07] text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
                <Phone className="w-4 h-4" /> +356 7966 1889
              </a>
            </div>
          </div>
        </section>

        {/* Service types */}
        <section className="py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-14 max-w-2xl">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">What We Do</p>
              <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight">
                Complete HVAC Solutions
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SERVICES.map(({ icon: Icon, title, desc, detail }) => (
                <div key={title} className="group p-7 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-[0_12px_40px_-12px_rgba(14,165,233,0.15)] hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{desc}</p>
                  <p className="text-xs text-slate-400 italic">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.22em] mb-3">Our Process</p>
              <h2 className="font-display text-3xl lg:text-4xl text-white leading-tight">
                From Booking to Completion
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PROCESS.map(({ step, title, desc }) => (
                <div key={step} className="p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-200">
                  <span className="block text-5xl font-black text-white/[0.07] leading-none mb-5 font-display select-none">
                    {step}
                  </span>
                  <h3 className="font-bold text-white text-[15px] mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why us + booking */}
        <section id="book" className="py-20 lg:py-24 bg-[#FAFAF9] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-start">

              {/* Left — features */}
              <div>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Why Choose Us</p>
                <h2 className="font-display text-3xl lg:text-4xl text-slate-900 mb-8 leading-tight">What sets us apart</h2>

                <div className="space-y-3 mb-10">
                  {FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-slate-700 text-[15px]">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 mb-10">
                  {[
                    { icon: Star,  label: '5-Star',   sub: 'Google rated' },
                    { icon: Award, label: 'F-Gas',    sub: 'Certified' },
                    { icon: Zap,   label: '15+ Years', sub: 'In Malta' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center p-4 rounded-2xl bg-white border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Guarantee */}
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

                {/* Areas served */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.22em] mb-3">Areas Served Across Malta</p>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map(area => (
                      <span key={area} className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                        {area}
                      </span>
                    ))}
                    <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold">
                      + all Malta
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — form */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.08)] p-8">
                <h2 className="font-display text-2xl text-slate-900 mb-1">Book a Service</h2>
                <p className="text-sm text-slate-500 mb-7">
                  We&apos;ll confirm your appointment within 2 hours during business hours.
                </p>
                <ServiceRequestForm />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
