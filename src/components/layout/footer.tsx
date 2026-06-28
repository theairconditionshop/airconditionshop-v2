import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { getSiteSettings } from '@/lib/data/queries'
import FooterAccordions from './footer-accordions'

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

export default async function Footer() {
  const settings = await getSiteSettings()

  const phone          = str(settings.company_phone)
  const email          = str(settings.company_email)
  const address        = str(settings.company_address)
  const hoursWeekday   = str(settings.company_hours_weekday)
  const hoursSaturday  = str(settings.company_hours_saturday)
  const facebook       = str(settings.social_facebook)
  const instagram      = str(settings.social_instagram)
  const googleReview   = str(settings.google_review_url) || 'https://g.page/r/CdjWGAZmBi4pEAE/review'
  const vatNumber      = str(settings.vat_number)
  const copyrightText  = str(settings.copyright_text) || 'THE AIRCONDITION SHOP. All rights reserved.'

  const year = new Date().getFullYear()

  const hoursLine = [
    hoursWeekday   ? `Mon–Fri: ${hoursWeekday}` : null,
    hoursSaturday  ? `Sat: ${hoursSaturday}` : null,
    'Sun: Closed',
  ].filter(Boolean).join(' · ')

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-white/[0.04]">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1 pb-8 mb-2 md:mb-0 border-b border-white/[0.04] md:border-0">
            <Link href="/" className="inline-block mb-5 cursor-pointer group">
              <span className="font-display text-white text-xl tracking-tight group-hover:text-blue-300 transition-colors duration-200">
                THE AIRCONDITION SHOP
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Malta&apos;s premier HVAC and refrigeration specialists. Premium AC, refrigeration,
              ventilation and installation materials.
            </p>

            {/* Contact info */}
            <ul className="space-y-3.5 text-sm">
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                    <Phone className="w-4 h-4 shrink-0 text-blue-500" />
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`}
                    className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                    <Mail className="w-4 h-4 shrink-0 text-blue-500" />
                    {email}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3 text-slate-500">
                  <MapPin className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                  <span>
                    {address.split(',').slice(0, 1).join('')}
                    <br />
                    {address.split(',').slice(1).join(',').trim()}
                  </span>
                </li>
              )}
              {hoursLine && (
                <li className="flex items-start gap-3 text-slate-500">
                  <Clock className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                  <span>{hoursLine}</span>
                </li>
              )}
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 mt-8">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-blue-500/40 hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H8v-2.88h2.44V9.8c0-2.41 1.44-3.74 3.63-3.74 1.05 0 2.15.19 2.15.19v2.37h-1.21c-1.19 0-1.56.74-1.56 1.5v1.8H16l-.44 2.88h-2.32v6.99A10 10 0 0 0 22 12z"/>
                  </svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-pink-500/40 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
              )}
              {googleReview && (
                <a href={googleReview} target="_blank" rel="noopener noreferrer" aria-label="Review us on Google"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-green-500/40 hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 0 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Accordion nav sections (client) */}
          <FooterAccordions googleReviewUrl={googleReview || undefined} />
        </div>
      </div>

      {/* Trust certification strip */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            'F-Gas Certified',
            'Certified Engineers',
            vatNumber ? `VAT ${vatNumber}` : 'Malta VAT Registered',
            'Fully Insured',
          ].map(cert => (
            <span key={cert} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 tracking-wide">
              <span className="w-1 h-1 rounded-full bg-blue-700/60 shrink-0" />
              {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            &copy; {year} {copyrightText}
          </p>
          {vatNumber && (
            <p className="text-xs text-slate-700">
              {str(settings.legal_name) || 'AS GROUP'} · VAT {vatNumber}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
