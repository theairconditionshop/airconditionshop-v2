import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone } from 'lucide-react'

interface CtaData {
  heading?: string
  description?: string
  image_url?: string
  cta_primary?: { label: string; href: string }
  cta_secondary?: { label: string; href: string }
}

export default function CtaSection({ data }: { data: CtaData }) {
  const heading      = data.heading      || 'Ready to get started?'
  const description  = data.description  || 'Request a free site survey or speak to our team about your HVAC requirements.'
  const ctaPrimary   = data.cta_primary   || { label: 'Request a Quote', href: '/quote' }
  const ctaSecondary = data.cta_secondary || { label: 'Contact Us',      href: '/contact' }
  const imageUrl     = data.image_url || null

  return (
    <section className="py-8 lg:py-12 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950">
          {/* Background image on mobile — only when image is set in admin */}
          {imageUrl && (
            <div className="absolute inset-0 lg:hidden">
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center opacity-20"
              />
            </div>
          )}

          {/* Two-column layout on desktop (with image), full-width (without) */}
          <div className={imageUrl ? 'grid lg:grid-cols-[1fr_420px]' : ''}>

            {/* Left — text content */}
            <div className="relative z-10 px-5 py-14 sm:px-14 sm:py-20">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[80px] rounded-full" />

              <div className="relative">
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-5">
                  Get in Touch
                </p>
                <h2 className="font-display text-3xl lg:text-5xl xl:text-6xl text-white mb-5 leading-tight">
                  {heading}
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                  {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={ctaPrimary.href}
                    className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    {ctaPrimary.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href={ctaSecondary.href}
                    className="inline-flex items-center justify-center px-7 py-3.5 border border-white/15 text-white/80 hover:text-white hover:border-white/30 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    {ctaSecondary.label}
                  </Link>
                </div>

                <a
                  href="tel:+35679661889"
                  className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  +356 7966 1889
                </a>

                {/* Trust signals */}
                <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2">
                  {['Malta-wide coverage', 'Same-day emergency response', 'Certified technicians'].map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 text-[12px] text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-blue-600/60 shrink-0" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — HVAC image (desktop only, when set in admin) */}
            {imageUrl && (
              <div className="hidden lg:block relative overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="THE AIRCONDITION SHOP — professional HVAC installation"
                  fill
                  sizes="420px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
