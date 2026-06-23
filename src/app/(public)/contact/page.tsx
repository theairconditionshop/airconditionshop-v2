import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ContactForm from './contact-form'
import { getSiteSettings } from '@/lib/data/queries'
import { MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight, Zap, MessageSquare, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — HVAC & Refrigeration Malta',
  description: 'Get in touch with THE AIRCONDITION SHOP. Call, email or visit us in Mosta, Malta. Emergency HVAC response across all Malta.',
  alternates: { canonical: 'https://theairconditionshop.com/contact' },
}

const AREAS = [
  'Mosta', "St Julian's", 'Sliema', 'Valletta', 'Mdina', 'Naxxar',
  'Mellieħa', 'Bugibba', 'Birkirkara', 'Qormi', 'Rabat', 'Marsaskala',
  'Żabbar', 'Paola', 'Fgura',
]

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const googleReviewUrl = typeof settings.google_review_url === 'string' ? settings.google_review_url : ''
  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[52vh] flex items-end overflow-hidden bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-blue-500/8 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-40 w-full">
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">
              Get in Touch
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-2xl mb-5">
              We&apos;re Here to
              <br />
              <span className="text-blue-400 italic">Help You</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
              Questions, bookings, or emergency support — our team responds fast across all Malta.
            </p>
          </div>
        </section>

        {/* ── Quick contact strip ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

              <a href="tel:+35679661889"
                className="group flex items-center gap-4 py-7 px-2 sm:px-8 hover:bg-blue-50/40 transition-colors duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Call Us</p>
                  <p className="text-sm font-bold text-slate-900">+356 7966 1889</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mon–Fri 08:00–18:00</p>
                </div>
              </a>

              <a href="mailto:support@theairconditionshop.com"
                className="group flex items-center gap-4 py-7 px-2 sm:px-8 hover:bg-blue-50/40 transition-colors duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-900">support@theairconditionshop.com</p>
                  <p className="text-xs text-slate-400 mt-0.5">We reply within 2 hours</p>
                </div>
              </a>

              <div className="flex items-center gap-4 py-7 px-2 sm:px-8">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Hours</p>
                  <p className="text-sm font-bold text-slate-900">Mon–Fri 08:00–18:00</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sat 08:00–14:00 · Emergency 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main: info + form ── */}
        <section className="py-20 lg:py-24 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-start">

              {/* ── Left column ── */}
              <div>
                {/* Address */}
                <div className="mb-10">
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Our Location</p>
                  <h2 className="font-display text-3xl text-slate-900 mb-4 leading-tight">
                    Visit Our Showroom
                  </h2>
                  <div className="flex items-start gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-900 font-semibold text-[15px]">220 Vjal L-Indipendenza</p>
                      <p className="text-slate-500 text-sm">Mosta MST 9022, Malta</p>
                    </div>
                  </div>
                </div>

                {/* Response time promises */}
                <div className="mb-10 space-y-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.22em] mb-4">Our Response Commitments</p>
                  {[
                    { icon: MessageSquare, label: 'Email enquiries', time: 'Reply within 2 business hours', color: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { icon: Phone,        label: 'Phone support',   time: 'Answer within 3 rings (business hours)', color: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { icon: Zap,          label: 'Emergency calls',  time: 'Technician dispatched same day', color: 'bg-amber-50', iconColor: 'text-amber-500' },
                    { icon: ArrowRight,   label: 'Service bookings', time: 'Appointment confirmed within 24 hours', color: 'bg-blue-50', iconColor: 'text-blue-600' },
                  ].map(({ icon: Icon, label, time, color, iconColor }) => (
                    <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-100 transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-slate-800">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Review CTA */}
                {googleReviewUrl && (
                  <div className="mb-10 p-5 rounded-2xl border border-amber-200/60 bg-amber-50/60">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-0.5">Happy with our service?</p>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">Leave us a review on Google — it helps other customers find us.</p>
                        <a
                          href={googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Leave a Google Review
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service area */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.22em] mb-4">Service Coverage</p>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map(area => (
                      <span key={area} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" />
                        {area}
                      </span>
                    ))}
                    <span className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold">
                      + all Malta
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Right column: form ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.08)] p-8">
                <h2 className="font-display text-2xl text-slate-900 mb-1">Send Us a Message</h2>
                <p className="text-sm text-slate-500 mb-7">
                  Fill in the form below and we&apos;ll get back to you within 2 business hours.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* ── Google Maps embed ── */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]" style={{ height: 420 }}>
              <iframe
                src="https://maps.google.com/maps?q=220+Vjal+L-Indipendenza,+Mosta,+Malta&output=embed&hl=en&z=16"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Aircondition Shop — 220 Vjal L-Indipendenza, Mosta, Malta"
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              220 Vjal L-Indipendenza, Mosta MST 9022, Malta ·{' '}
              <a
                href="https://maps.google.com/?q=220+Vjal+L-Indipendenza+Mosta+Malta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open in Google Maps
              </a>
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
