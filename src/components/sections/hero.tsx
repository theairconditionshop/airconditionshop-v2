'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { ArrowRight, Phone } from 'lucide-react'
import { Magnetic } from '@/components/motion/primitives'

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

const EASE = [0.22, 1, 0.36, 1] as const

const TRUST = ['Authorized Dealer', 'F-Gas Certified', 'Mosta · All Malta', 'After-Sales Support']

export default function Hero({ data }: { data: HeroData }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const fgY   = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-6%'])
  const fade  = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const description  = data.description  ?? 'Premium air conditioning, supplied and installed across Malta. Daikin, AUX, Gree, Fujitsu and more — engineered comfort for the Maltese summer.'
  const ctaPrimary   = data.cta_primary  ?? { label: 'Shop Air Conditioners', href: '/products' }
  const ctaSecondary = data.cta_secondary ?? { label: 'Get a Free Quote', href: '/quote' }
  const bgImage = data.media_url || null

  // Two-part cinematic headline. Honour a CMS headline if present.
  const cmsHeadline = data.headline?.trim()
  const line1 = cmsHeadline ? cmsHeadline : 'Malta is burning.'
  const line2 = cmsHeadline ? null : 'Stay cool.'

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-[#f4f1ec]"
    >
      {/* ── Background ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10 scale-110">
        {bgImage ? (
          <Image
            src={bgImage}
            alt="Air conditioning in Malta"
            fill
            priority
            quality={82}
            sizes="100vw"
            className="object-cover object-[center_28%] sm:object-[center_35%] lg:object-center"
          />
        ) : (
          // Bright Malta-heat placeholder: warm golden sky settling into cool light
          <div className="absolute inset-0" style={{
            background:
              'radial-gradient(120% 90% at 78% 6%, #ffd9a0 0%, #fbbf77 18%, #f6a45c 34%, transparent 62%),' +
              'radial-gradient(90% 80% at 12% 100%, #cfe9ff 0%, #e8f4ff 40%, transparent 72%),' +
              'linear-gradient(180deg, #ffedd0 0%, #fbe9d6 40%, #f4f1ec 100%)',
          }} />
        )}
      </motion.div>

      {/* Heat haze shimmer (top-right, warm) */}
      {!reduce && (
        <div className="absolute -top-24 right-[-6%] w-[60vw] h-[60vh] -z-10 pointer-events-none heat-haze" />
      )}

      {/* Cool airflow sweep — one-time cinematic entrance from the left */}
      {!reduce && (
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 -z-10 pointer-events-none"
          initial={{ x: '-60%', opacity: 0 }}
          animate={{ x: '0%', opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
          style={{ background: 'linear-gradient(90deg, rgba(56,189,248,0.18) 0%, rgba(224,242,254,0.10) 40%, transparent 100%)' }}
        />
      )}

      {/* Floating cool particles */}
      {!reduce && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-sky-300/40"
              style={{ left: p.left, bottom: -20, width: p.size, height: p.size }}
              animate={{ y: [0, -p.rise], opacity: [0, 0.7, 0], x: [0, p.drift, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* Top scrim so the transparent navbar stays legible over any background */}
      <div className="absolute top-0 inset-x-0 h-40 -z-10 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />
      {/* Bottom fade into the white page */}
      <div className="absolute bottom-0 inset-x-0 h-56 -z-10 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />

      {/* ── Content ── */}
      <motion.div style={{ y: fgY, opacity: fade }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 pt-32">

          {/* Temperature indicator */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="mb-6 inline-flex items-stretch border border-black/10 bg-white/70 backdrop-blur-md"
            style={{ borderRadius: 2 }}
          >
            <span className="flex items-center gap-2 px-3.5 py-2 border-r border-black/10">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-700">Malta Today</span>
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-orange-600">41°C</span>
            <span className="flex items-center px-3.5 py-2 border-l border-black/10 text-[13px] text-slate-500">Feels like 47°C</span>
          </motion.div>

          {/* Headline — architectural, two-tone heat → cool */}
          <h1 className="font-display text-[3.2rem] leading-[0.95] sm:text-7xl lg:text-8xl tracking-[-0.02em] text-slate-900 max-w-4xl">
            <HeadlineLine text={line1} delay={0.35} reduce={!!reduce} tone="heat" />
            {line2 && (
              <span className="block">
                <HeadlineLine text={line2} delay={0.6} reduce={!!reduce} tone="cool" />
              </span>
            )}
          </h1>

          {/* Description */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTAs — architectural, magnetic */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.05 }}
            className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Magnetic strength={0.25}>
              <Link
                href={ctaPrimary.href}
                className="group flex items-center justify-center gap-2.5 px-8 h-14 bg-slate-900 text-white text-[15px] font-semibold hover:bg-blue-600 transition-colors duration-300"
                style={{ borderRadius: 2 }}
              >
                {ctaPrimary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Magnetic>
            <Link
              href={ctaSecondary.href}
              className="group flex items-center justify-center gap-2 px-8 h-14 border border-slate-300 text-slate-800 text-[15px] font-semibold hover:border-slate-900 hover:bg-white transition-all duration-300"
              style={{ borderRadius: 2 }}
            >
              {ctaSecondary.label}
            </Link>
            <a href="tel:+35679661889" className="hidden sm:flex items-center gap-2 px-4 h-14 text-sm text-slate-500 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" /> +356 7966 1889
            </a>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.3 }}
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/10 pt-5"
          >
            {TRUST.map(t => (
              <span key={t} className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                <span className="w-1 h-1 rounded-full bg-blue-500" />{t}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function HeadlineLine({ text, delay, reduce, tone }: { text: string; delay: number; reduce: boolean; tone: 'heat' | 'cool' }) {
  const color = tone === 'cool' ? 'text-blue-600' : 'text-slate-900'
  if (reduce) return <span className={`block ${color}`}>{text}</span>
  const words = text.split(' ')
  return (
    <span className="block" aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.22em]" aria-hidden>
          <motion.span
            className={`inline-block ${color}`}
            initial={{ y: '115%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.85, ease: EASE, delay: delay + i * 0.09 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const PARTICLES = [
  { left: '12%', size: 6, rise: 420, drift: 30, dur: 11, delay: 0 },
  { left: '26%', size: 4, rise: 500, drift: -24, dur: 13, delay: 1.5 },
  { left: '44%', size: 5, rise: 380, drift: 20, dur: 10, delay: 3 },
  { left: '61%', size: 3, rise: 460, drift: -18, dur: 14, delay: 0.8 },
  { left: '73%', size: 6, rise: 520, drift: 26, dur: 12, delay: 2.2 },
  { left: '88%', size: 4, rise: 400, drift: -22, dur: 15, delay: 4 },
]
