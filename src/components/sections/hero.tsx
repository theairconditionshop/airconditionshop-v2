'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Phone } from 'lucide-react'

interface HeroData {
  type?: 'image' | 'video' | 'gradient'
  headline?: string
  description?: string
  cta_primary?: { label: string; href: string }
  cta_secondary?: { label: string; href: string }
  media_url?: string
  overlay_opacity?: number
}

export default function Hero({ data }: { data: HeroData }) {
  const headline = data.headline || "Malta's Premier HVAC & Refrigeration Specialists"
  const description = data.description || 'Premium air conditioning, refrigeration and climate control solutions for homes, hotels and commercial spaces across Malta.'
  const ctaPrimary = data.cta_primary || { label: 'Explore Products', href: '/products' }
  const ctaSecondary = data.cta_secondary || { label: 'Get a Quote', href: '/quote' }
  const overlayOpacity = data.overlay_opacity ?? 0.5

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-900">

      {/* Background */}
      {data.media_url ? (
        <Image
          src={data.media_url}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      ) : (
        // Fallback gradient
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900" />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900"
        style={{ opacity: overlayOpacity }}
      />

      {/* Decorative blue accent */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-sky-400/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sm text-white/90 font-medium">Authorised HVAC Dealer — Malta</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
          >
            {headline}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <Link href={ctaPrimary.href}>
              <Button size="xl" variant="brand" className="group gap-2">
                {ctaPrimary.label}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href={ctaSecondary.href}>
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white bg-white/5 hover:bg-white/15 hover:border-white/50"
              >
                {ctaSecondary.label}
              </Button>
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/60"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Authorised Dealer
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Expert Installation
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Malta-Based Team
            </div>
            <a href="tel:+35679661889" className="flex items-center gap-2 hover:text-white transition-colors ml-auto">
              <Phone className="w-4 h-4 text-sky-400" />
              +356 7966 1889
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}
