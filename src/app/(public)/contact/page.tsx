import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ContactForm from './contact-form'
import { getSiteSettings } from '@/lib/data/queries'
import { TrustBadges } from '@/components/shared/trust-badges'
import { InternalLinkPanel } from '@/components/shared/internal-link-panel'
import { FadeUpSection, AnimatedSection, FadeUp } from '@/components/shared/animated-section'
import { PremiumImage } from '@/components/shared/premium-image'
import {
  MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight,
  Zap, MessageSquare, Star, Car, Navigation, Camera,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact THE AIRCONDITION SHOP — HVAC Malta',
  description: 'Contact THE AIRCONDITION SHOP for air conditioning, heat pumps, HVAC and refrigeration across Malta. Visit our Mosta showroom, call, email or send a WhatsApp.',
  alternates: { canonical: 'https://www.theairconditionshop.com/contact' },
}

const AREAS = [
  'Mosta', "St Julian's", 'Sliema', 'Valletta', 'Mdina', 'Naxxar',
  'Mellieħa', 'Bugibba', 'Birkirkara', 'Qormi', 'Rabat', 'Marsaskala',
  'Żabbar', 'Paola', 'Fgura',
]

const CONTACT_FAQS = [
  {
    q: 'Where are you located?',
    a: 'Our showroom is at 220 Vjal L-Indipendenza, Mosta MST 9022, Malta. We\'re open Monday to Friday 08:00–18:00 and Saturday 08:00–14:00.',
  },
  {
    q: 'Do you cover Gozo?',
    a: 'Yes. We supply and install air conditioning systems in Gozo. Contact us to discuss your requirements and we\'ll arrange a site visit.',
  },
  {
    q: 'Can I visit your showroom?',
    a: 'Absolutely. Our Mosta showroom is open Monday to Friday 08:00–18:00 and Saturday 08:00–14:00. No appointment necessary — walk in and speak directly with our team.',
  },
  {
    q: 'How quickly do you reply to enquiries?',
    a: 'We aim to reply to all email and online enquiries within 2 business hours during opening hours. For urgent matters, call or WhatsApp us directly on +356 7966 1889.',
  },
]

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const googleReviewUrl = (typeof settings.google_review_url === 'string' && settings.google_review_url)
    ? settings.google_review_url
    : 'https://g.page/r/CdjWGAZmBi4pEAE/review'

  return (
    <>
      <Navbar transparent />
      <main id="main-content" className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative min-h-[52vh] flex items-end overflow-hidden bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
            <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-blue-500/8 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-40 w-full">
            <FadeUpSection>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">Get in Touch</p>
              <h1 className="font-display text-[1.9rem] sm:text-5xl lg:text-6xl text-white leading-tight max-w-2xl mb-3">
                Contact THE AIRCONDITION SHOP
              </h1>
              <p className="text-blue-400 italic text-xl sm:text-2xl mb-5">We&apos;re Here to Help</p>
              <p className="text-slate-300 text-base sm:text-lg max-w-lg leading-relaxed mb-8">
                Need advice, a quotation or technical support? Contact our experienced team for air conditioning, heat pumps, refrigeration and HVAC solutions anywhere in Malta.
              </p>
              <TrustBadges set="core" variant="dark" />
            </FadeUpSection>
          </div>
        </section>

        {/* ── Quick contact strip ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

              <a href="tel:+35679661889"
                className="group flex items-center gap-4 py-7 px-2 sm:px-8 hover:bg-blue-50/40 transition-colors duration-200 cursor-pointer"
                aria-label="Call us on +356 7966 1889">
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Phone className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Phone</p>
                  <p className="text-sm font-bold text-slate-900">+356 7966 1889</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mon–Fri 08:00–18:00</p>
                </div>
              </a>

              <a href="mailto:support@theairconditionshop.com"
                className="group flex items-center gap-4 py-7 px-2 sm:px-8 hover:bg-blue-50/40 transition-colors duration-200 cursor-pointer"
                aria-label="Email support@theairconditionshop.com">
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">support@theairconditionshop.com</p>
                  <p className="text-xs text-slate-400 mt-0.5">Reply within 2 business hours</p>
                </div>
              </a>

              <a href="https://wa.me/35679661889" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-4 py-7 px-2 sm:px-8 hover:bg-green-50/40 transition-colors duration-200 cursor-pointer"
                aria-label="WhatsApp us on +356 7966 1889">
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
                  <Clock className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">Opening Hours</p>
                  <p className="text-sm font-bold text-slate-900">Mon–Fri 08:00–18:00</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sat 08:00–14:00 · Emergency 24/7</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Main: showroom + form ── */}
        <section className="py-20 lg:py-24 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-start">

              {/* ── Left column ── */}
              <div>
                {/* Showroom */}
                <AnimatedSection staggerChildren={0.08} className="mb-10">
                  <FadeUp>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Our Location</p>
                  </FadeUp>
                  <FadeUp>
                    <h2 className="font-display text-3xl text-slate-900 mb-3 leading-tight">
                      Visit Our HVAC Showroom in Mosta
                    </h2>
                  </FadeUp>
                  <FadeUp>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      Explore our range of air conditioners, heat pumps, refrigeration equipment and HVAC accessories. Speak directly with our experienced team for expert advice — no appointment necessary.
                    </p>
                  </FadeUp>

                  {/* Showroom photo */}
                  <FadeUp>
                    <div className="relative aspect-[16/9] mb-6">
                      <PremiumImage
                        src={null}
                        alt="THE AIRCONDITION SHOP showroom interior in Mosta, Malta — air conditioning displays and HVAC products"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        containerClassName="absolute inset-0"
                        rounded="2xl"
                        shadow
                        hoverZoom
                        placeholderLabel="Add showroom photo via Admin → Settings"
                        placeholderIcon={<Camera className="w-5 h-5 text-slate-400" aria-hidden="true" />}
                      />
                      {/* Overlay badges */}
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-[11px] font-semibold text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                          Open to Public
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-[11px] font-semibold text-slate-700">
                          <Car className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                          Free Parking
                        </span>
                      </div>
                    </div>
                  </FadeUp>

                  {/* Showroom details */}
                  <FadeUp>
                    <div className="space-y-3 mb-6">
                      {[
                        { icon: MapPin,     label: 'Address',          value: '220 Vjal L-Indipendenza, Mosta MST 9022' },
                        { icon: Clock,      label: 'Hours',            value: 'Mon–Fri 08:00–18:00 · Sat 08:00–14:00' },
                        { icon: Car,        label: 'Parking',          value: 'Free on-site parking available' },
                        { icon: Navigation, label: 'Nearest Landmark', value: 'Opposite Mosta FC Ground, main road' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                            <p className="text-sm text-slate-700 font-medium">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FadeUp>
                </AnimatedSection>

                {/* What you can expect */}
                <AnimatedSection staggerChildren={0.07} className="mb-10">
                  <FadeUp>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.22em] mb-4">What You Can Expect</p>
                  </FadeUp>
                  {[
                    { icon: MessageSquare, label: 'Friendly Advice',          desc: 'Honest, no-pressure guidance from experienced HVAC specialists' },
                    { icon: Zap,           label: 'Fast Quotations',           desc: 'Detailed written quotations, typically within one business day' },
                    { icon: Phone,         label: 'Professional Support',      desc: 'Knowledgeable team available by phone, email and WhatsApp' },
                    { icon: ArrowRight,    label: 'Reliable After-Sales Care', desc: '12-month workmanship guarantee. Full manufacturer warranty on all parts' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <FadeUp key={label}>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-100 transition-colors duration-200">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
                          <p className="text-sm text-slate-800 leading-snug">{desc}</p>
                        </div>
                      </div>
                    </FadeUp>
                  ))}
                </AnimatedSection>

                {/* Google Review CTA */}
                {googleReviewUrl && (
                  <FadeUpSection className="mb-10">
                    <div className="p-5 rounded-2xl border border-amber-200/60 bg-amber-50/60">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 text-amber-500" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 mb-0.5">Happy with our service?</p>
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">Leave us a review on Google — it helps other customers in Malta find us.</p>
                          <a
                            href={googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                            aria-label="Leave us a Google Review"
                          >
                            <Star className="w-3.5 h-3.5" aria-hidden="true" />
                            Leave a Google Review
                          </a>
                        </div>
                      </div>
                    </div>
                  </FadeUpSection>
                )}

                {/* Areas We Serve */}
                <FadeUpSection>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.22em] mb-3">Areas We Serve</p>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    We supply and install air conditioning systems throughout Malta including:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map(area => (
                      <span key={area} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" aria-hidden="true" />
                        {area}
                      </span>
                    ))}
                    <span className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold">
                      + all Malta &amp; Gozo
                    </span>
                  </div>
                </FadeUpSection>
              </div>

              {/* ── Right column: form ── */}
              <FadeUpSection delay={0.1}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_48px_-12px_rgba(0,0,0,0.08)] p-8">
                  <h2 className="font-display text-2xl text-slate-900 mb-1">Request a Free Quote</h2>
                  <p className="text-sm text-slate-500 mb-7">
                    Tell us about your project and we&apos;ll recommend the best solution for your home or business.
                  </p>
                  <ContactForm />
                </div>

                <div className="mt-5">
                  <TrustBadges set="product" variant="light" />
                </div>
              </FadeUpSection>
            </div>
          </div>
        </section>

        {/* ── Google Maps embed ── */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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

        {/* ── Internal links ── */}
        <section className="bg-[#FAFAF9] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <InternalLinkPanel
                heading="Useful links"
                links={[
                  { label: 'Book a Service', description: 'Need installation, maintenance or an emergency repair? Our certified engineers cover all Malta.', href: '/services', cta: 'View Our Services' },
                  { label: 'BTU Calculator', description: 'Use our free tool to find the correct AC size for your room based on Malta\'s climate.', href: '/btu-calculator', cta: 'Calculate My BTU' },
                  { label: 'Trade Accounts', description: 'HVAC installer or contractor in Malta? Apply for exclusive trade pricing and dedicated support.', href: '/trade', cta: 'View Trade Programme' },
                ]}
              />
            </FadeUpSection>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14 lg:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-10">
              <FadeUp>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3 text-center">Common Questions</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-2xl sm:text-3xl text-slate-900 leading-snug text-center">
                  Frequently Asked Questions
                </h2>
              </FadeUp>
            </AnimatedSection>
            <AnimatedSection className="space-y-4" staggerChildren={0.07}>
              {CONTACT_FAQS.map(({ q, a }) => (
                <FadeUp key={q}>
                  <div className="bg-[#FAFAF9] rounded-xl border border-slate-100 p-6 hover:border-blue-100 transition-colors duration-200">
                    <p className="font-semibold text-slate-900 text-sm mb-2">{q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── SEO footer ── */}
        <section className="bg-slate-50 py-12 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <h2 className="font-display text-xl text-slate-800 mb-4">THE AIRCONDITION SHOP — Mosta, Malta</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                THE AIRCONDITION SHOP is a Malta-based HVAC supplier and installer serving residential and commercial customers throughout the island. Our showroom is located in Mosta and is open to the public Monday to Saturday. Our experienced team provides advice on air conditioners, heat pumps, ventilation systems, commercial refrigeration and installation materials.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                We supply and install systems from leading brands including Daikin, Gree and Fujitsu. Our F-Gas certified engineers cover all Malta, including Gozo. <a href="tel:+35679661889" className="text-blue-600 hover:underline">Call us</a> for immediate assistance or use the form above to request a free quotation.
              </p>
            </FadeUpSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
