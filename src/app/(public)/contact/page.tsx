import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ContactForm from './contact-form'
import { getSiteSettings } from '@/lib/data/queries'
import { MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight, Zap, MessageSquare, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — HVAC & Refrigeration Malta',
  description: 'Get in touch with THE AIRCONDITION SHOP. Call, email or visit us in Mosta, Malta. Emergency HVAC response across all Malta.',
  alternates: { canonical: 'https://www.theairconditionshop.com/contact' },
}

const AREAS = [
  'Mosta', "St Julian's", 'Sliema', 'Valletta', 'Mdina', 'Naxxar',
  'Mellieħa', 'Bugibba', 'Birkirkara', 'Qormi', 'Rabat', 'Marsaskala',
  'Żabbar', 'Paola', 'Fgura',
]

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const googleReviewUrl = (typeof settings.google_review_url === 'string' && settings.google_review_url)
    ? settings.google_review_url
    : 'https://g.page/r/CdjWGAZmBi4pEAE/review'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

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

              <a href="https://wa.me/35679661889" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-4 py-7 px-2 sm:px-8 hover:bg-green-50/40 transition-colors duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">WhatsApp</p>
                  <p className="text-sm font-bold text-slate-900">+356 7966 1889</p>
                  <p className="text-xs text-slate-400 mt-0.5">Message us anytime</p>
                </div>
              </a>

              <div className="flex items-center gap-4 py-7 px-2 sm:px-8">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Hours</p>
                  <p className="text-sm font-bold text-slate-900">Mon–Fri 08:00–18:00</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sat 08:00–14:00 · Sun: Closed · Emergency 24/7</p>
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
