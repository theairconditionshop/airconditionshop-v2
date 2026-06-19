'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone, ShieldCheck, Award, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroData {
  type?: 'image' | 'video' | 'gradient'
  headline?: string
  description?: string
  badge?: string
  cta_primary?: { label: string; href: string }
  cta_secondary?: { label: string; href: string }
  media_url?: string
  overlay_opacity?: number
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Authorised Dealer' },
  { icon: Award,       label: 'Certified Engineers' },
  { icon: Clock,       label: '24h Emergency Response' },
]

export default function Hero({ data }: { data: HeroData }) {
  const headline     = data.headline     || "Malta's Premier HVAC & Refrigeration Specialists"
  const description  = data.description  || 'Premium air conditioning, refrigeration and climate control solutions for homes, hotels and commercial spaces across Malta.'
  const badge        = data.badge        || 'Authorised Dealer — Daikin · Mitsubishi Electric · Panasonic'
  const ctaPrimary   = data.cta_primary  || { label: 'Explore Products', href: '/products' }
  const ctaSecondary = data.cta_secondary|| { label: 'Get a Quote',      href: '/quote' }
  const overlayOpacity = data.overlay_opacity ?? 0.55

  return (
    <section className="relative min-h-[96vh] flex flex-col justify-center overflow-hidden bg-slate-950">

      {/* Background image or gradient */}
      {data.media_url ? (
        <Image
          src={data.media_url}
          alt="THE AIRCONDITION SHOP — HVAC Malta"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950" />
      )}

      {/* Overlay for image backgrounds */}
      {data.media_url && (
        <div className="absolute inset-0 bg-slate-950" style={{ opacity: overlayOpacity }} />
      )}

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-sky-500/[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-sky-400/[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-sky-600/[0.05] blur-[140px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex flex-col items-center text-center">

        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            {badge}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight max-w-5xl"
        >
          {headline.includes('&') ? (
            <>
              {headline.split(' & ')[0]}
              <span className="text-sky-400"> & </span>
              {headline.split(' & ').slice(1).join(' & ')}
            </>
          ) : headline}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={ctaPrimary.href}>
            <Button size="lg" variant="brand" className="px-8 text-base gap-2.5 group shadow-lg shadow-sky-500/25">
              {ctaPrimary.label}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </Link>
          <Link href={ctaSecondary.href}>
            <Button size="lg" variant="outline"
              className="px-8 text-base border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm">
              {ctaSecondary.label}
            </Button>
          </Link>
        </motion.div>

        {/* Phone link */}
        <motion.a
          href="tel:+35679661889"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sky-400 transition-colors duration-200"
        >
          <Phone className="w-3.5 h-3.5" />
          Call us: +356 7966 1889
        </motion.a>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center">
                <Icon className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
    </section>
  )
}
