'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

interface CtaData {
  heading?: string
  description?: string
  cta_primary?: { label: string; href: string }
  cta_secondary?: { label: string; href: string }
}

export default function CtaSection({ data }: { data: CtaData }) {
  const heading      = data.heading      || 'Ready to get started?'
  const description  = data.description  || 'Request a free site survey or speak to our team about your HVAC requirements.'
  const ctaPrimary   = data.cta_primary   || { label: 'Request a Quote', href: '/quote' }
  const ctaSecondary = data.cta_secondary || { label: 'Contact Us',      href: '/contact' }

  return (
    <section className="py-20 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-slate-950"
        >
          {/* Ambient glow — double layered for depth */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 blur-[80px] rounded-full" />
          <div className="pointer-events-none absolute -bottom-32 right-1/4 w-[400px] h-[300px] bg-blue-500/8 blur-[60px] rounded-full" />

          <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 lg:px-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-5">
                Get in Touch
              </p>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
                {heading}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
