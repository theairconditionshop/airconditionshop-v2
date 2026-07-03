'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone } from 'lucide-react'
import { Reveal, Magnetic } from '@/components/motion/primitives'
import { motion, useReducedMotion } from 'framer-motion'

interface CtaData {
  heading?: string
  description?: string
  image_url?: string
  cta_primary?: { label: string; href: string }
  cta_secondary?: { label: string; href: string }
}

const TRUST = ['All Malta Covered', 'Same-Day Emergency Response', 'F-Gas Certified Engineers']

export default function CtaSection({ data }: { data: CtaData }) {
  const reduce = useReducedMotion()
  const heading      = data.heading      || 'Comfort is one call away.'
  const description  = data.description  || 'Whether you need a single unit for your home, a full commercial installation or an HVAC service call, our team is ready to help. We cover all Malta, respond quickly and give honest advice.'
  const ctaPrimary   = data.cta_primary   || { label: 'Request a Free Quote', href: '/quote' }
  const ctaSecondary = data.cta_secondary || { label: 'Contact Our Team',     href: '/contact' }
  const imageUrl     = data.image_url?.trim() || null

  return (
    <section className="relative bg-[#f4f8fb] py-24 lg:py-32 overflow-hidden border-t border-slate-100">
      {/* Resolved cool glow — the hero's heat haze has fully settled into calm blue here, closing the narrative loop */}
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-blue-400/[0.10] blur-[140px] pointer-events-none" />
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: 'linear-gradient(270deg, rgba(56,189,248,0.10) 0%, rgba(224,242,254,0.06) 45%, transparent 100%)' }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={imageUrl ? 'grid lg:grid-cols-[1fr_440px] gap-14 lg:gap-16 items-center' : ''}>

          {/* Text content */}
          <div className={imageUrl ? '' : 'max-w-2xl mx-auto text-center'}>
            <Reveal mode="up" className={imageUrl ? '' : 'flex justify-center'}>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-5">Get a Quote Today</p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-6xl xl:text-7xl leading-[0.98] tracking-[-0.02em] text-slate-900">
                {heading}
              </h2>
            </Reveal>
            <Reveal mode="up" delay={0.12}>
              <p className={`mt-6 text-lg text-slate-600 leading-relaxed ${imageUrl ? 'max-w-lg' : 'max-w-xl mx-auto'}`}>
                {description}
              </p>
            </Reveal>

            <Reveal mode="up" delay={0.18} className={`mt-10 flex flex-col sm:flex-row gap-3 ${imageUrl ? '' : 'sm:justify-center'}`}>
              <Magnetic strength={0.25}>
                <Link
                  href={ctaPrimary.href}
                  className="group inline-flex items-center justify-center gap-2.5 px-8 h-14 bg-slate-900 text-white text-[15px] font-semibold hover:bg-blue-600 transition-colors duration-300"
                  style={{ borderRadius: 2 }}
                >
                  {ctaPrimary.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Magnetic>
              <Link
                href={ctaSecondary.href}
                className="inline-flex items-center justify-center px-8 h-14 border border-slate-300 text-slate-800 text-[15px] font-semibold hover:border-slate-900 hover:bg-white transition-all duration-300"
                style={{ borderRadius: 2 }}
              >
                {ctaSecondary.label}
              </Link>
            </Reveal>

            <Reveal mode="fade" delay={0.22}>
              <a href="tel:+35679661889" className={`mt-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors ${imageUrl ? '' : 'justify-center w-full'}`}>
                <Phone className="w-4 h-4" />
                +356 7966 1889
              </a>
            </Reveal>

            {/* Trust signals */}
            <Reveal mode="up" delay={0.26} className={`mt-10 pt-8 border-t border-slate-200 flex flex-wrap gap-x-6 gap-y-2 ${imageUrl ? '' : 'justify-center'}`}>
              {TRUST.map(t => (
                <span key={t} className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500">
                  <span className="w-1 h-1 bg-blue-500" style={{ borderRadius: 1 }} />
                  {t}
                </span>
              ))}
            </Reveal>
          </div>

          {/* Optional CMS image — architectural framed panel matching the rest of the site */}
          {imageUrl && (
            <Reveal mode="scale" delay={0.15} className="hidden lg:block">
              <div className="relative aspect-[4/5] overflow-hidden border border-slate-200" style={{ borderRadius: 2 }}>
                <Image src={imageUrl} alt="THE AIRCONDITION SHOP — professional HVAC installation" fill sizes="440px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
