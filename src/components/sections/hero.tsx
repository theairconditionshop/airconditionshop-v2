'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone, ChevronDown } from 'lucide-react'
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
  { value: '15+',    label: 'Years in Malta' },
  { value: '1,200+', label: 'Installations' },
  { value: '6',      label: 'Premium Brands' },
  { value: '24h',    label: 'Response Time' },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.65, ease: 'easeOut' } },
}

export default function Hero({ data }: { data: HeroData }) {
  const headline     = data.headline     ?? "Malta's Premier HVAC & Refrigeration Specialists"
  const description  = data.description  ?? 'Premium air conditioning, refrigeration and climate control solutions for homes, hotels and commercial spaces across Malta.'
  const badge        = data.badge        ?? 'Authorised Dealer · Daikin · Mitsubishi Electric · Panasonic'
  const ctaPrimary   = data.cta_primary  ?? { label: 'Explore Products', href: '/products' }
  const ctaSecondary = data.cta_secondary ?? { label: 'Get a Quote', href: '/quote' }
  const overlayOpacity = data.overlay_opacity ?? 0.62
  // Fallback to a high-quality HVAC/architecture photo when no admin image is set
  const bgImage = data.media_url ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85'

  // Split headline around " & " so "&" can be styled
  const [headlineBefore, headlineAfter] = headline.includes(' & ')
    ? [headline.split(' & ')[0], headline.split(' & ').slice(1).join(' & ')]
    : [headline, null]

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950">

      {/* Background image — admin-set or default HVAC hero */}
      <Image
        src={bgImage}
        alt="THE AIRCONDITION SHOP — HVAC Malta"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      <div className="absolute inset-0 bg-slate-950" style={{ opacity: overlayOpacity }} />

      {/* Ambient glow layers — richer depth */}
      <div className="absolute -top-48 right-[-8%] w-[700px] h-[700px] rounded-full bg-blue-600/[0.08] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-500/[0.06] blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[380px] rounded-full bg-blue-700/[0.04] blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 left-[15%] w-[300px] h-[300px] rounded-full bg-amber-500/[0.04] blur-[100px] pointer-events-none" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.022,
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32 flex flex-col items-center text-center">

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full"
        >
          {/* Pill badge */}
          <motion.div variants={fadeUp} className="mb-10">
            <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07] text-amber-400 text-xs font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              {badge}
            </span>
          </motion.div>

          {/* Headline — display font */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-white leading-[1.05] tracking-tight max-w-5xl"
          >
            {headlineAfter ? (
              <>
                {headlineBefore}{' '}
                <span className="text-amber-400 italic">&amp;</span>{' '}
                {headlineAfter}
              </>
            ) : headline}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-7 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={ctaPrimary.href}>
              <Button
                size="lg"
                className="px-8 text-base gap-2.5 group bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 transition-all duration-300 cursor-pointer"
              >
                {ctaPrimary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
            <Link href={ctaSecondary.href}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-base border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/30 backdrop-blur-sm transition-all duration-300 cursor-pointer"
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
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.06] w-full max-w-2xl"
          >
            {TRUST_METRICS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-5 px-4 bg-slate-950/90 backdrop-blur-sm hover:bg-slate-900/80 transition-colors duration-200"
              >
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <span className="mt-0.5 text-[11px] text-slate-500 tracking-wide">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <span className="text-[10px] text-slate-600 tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  )
}
