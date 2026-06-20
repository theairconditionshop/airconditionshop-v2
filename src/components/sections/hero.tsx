'use client'

import { motion, type Variants } from 'framer-motion'
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

const TRUST_METRICS = [
  { value: '15+',    label: 'Years' },
  { value: '1,200+', label: 'Installations' },
  { value: '6',      label: 'Premium Brands' },
  { value: '24h',    label: 'Response' },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Hero({ data }: { data: HeroData }) {
  const headline     = data.headline     ?? "Malta's Premier HVAC & Refrigeration Specialists"
  const description  = data.description  ?? 'Premium air conditioning, refrigeration and climate control solutions for homes, hotels and commercial spaces across Malta.'
  const badge        = data.badge        ?? 'Authorised Dealer · Daikin · Mitsubishi Electric · Panasonic'
  const ctaPrimary   = data.cta_primary  ?? { label: 'Explore Products', href: '/products' }
  const ctaSecondary = data.cta_secondary ?? { label: 'Get a Quote', href: '/quote' }
  const overlayOpacity = data.overlay_opacity ?? 0.6

  // Split headline around " & " so "&" can be amber-coloured
  const [headlineBefore, headlineAfter] = headline.includes(' & ')
    ? [headline.split(' & ')[0], headline.split(' & ').slice(1).join(' & ')]
    : [headline, null]

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950">

      {/* Background image */}
      {data.media_url && (
        <Image
          src={data.media_url}
          alt="THE AIRCONDITION SHOP — HVAC Malta"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      )}

      {/* Dark overlay when image present */}
      {data.media_url && (
        <div className="absolute inset-0 bg-slate-950" style={{ opacity: overlayOpacity }} />
      )}

      {/* Base gradient (no image) */}
      {!data.media_url && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950" />
      )}

      {/* Ambient glow — blue orbs */}
      <div className="absolute -top-32 right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-8%] w-[480px] h-[480px] rounded-full bg-blue-500/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[320px] rounded-full bg-blue-700/[0.04] blur-[160px] pointer-events-none" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32 flex flex-col items-center text-center">

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Pill badge */}
          <motion.div variants={fadeUp} className="mb-10">
            <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-500/25 bg-amber-500/[0.08] text-amber-400 text-xs font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              {badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight max-w-5xl"
          >
            {headlineAfter ? (
              <>
                {headlineBefore}{' '}
                <span className="text-amber-400">&amp;</span>{' '}
                {headlineAfter}
              </>
            ) : headline}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-7 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={ctaPrimary.href}>
              <Button
                size="lg"
                className="px-8 text-base gap-2.5 group bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer"
              >
                {ctaPrimary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
            <Link href={ctaSecondary.href}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-base border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:border-white/35 backdrop-blur-sm transition-all duration-200 cursor-pointer"
              >
                {ctaSecondary.label}
              </Button>
            </Link>
          </motion.div>

          {/* Phone */}
          <motion.a
            href="tel:+35679661889"
            variants={fadeIn}
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            Call us: +356 7966 1889
          </motion.a>

          {/* Trust metrics strip */}
          <motion.div
            variants={fadeUp}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06] w-full max-w-2xl"
          >
            {TRUST_METRICS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-5 px-4 bg-slate-950/80 backdrop-blur-sm"
              >
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <span className="mt-0.5 text-xs text-slate-500 tracking-wide">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade → slate-950 (matches categories section) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  )
}
