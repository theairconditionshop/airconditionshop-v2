'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Phone } from 'lucide-react'

interface CtaData {
  heading?: string
  description?: string
  cta_primary?: { label: string; href: string }
  cta_secondary?: { label: string; href: string }
}

export default function CtaSection({ data }: { data: CtaData }) {
  const heading      = data.heading      || "Ready to get started?"
  const description  = data.description  || "Request a free quote or get in touch with our team today."
  const ctaPrimary   = data.cta_primary   || { label: 'Request a Quote', href: '/quote' }
  const ctaSecondary = data.cta_secondary || { label: 'Contact Us', href: '/contact' }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 sm:px-16 text-center"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/15 blur-3xl rounded-full" />

          <div className="relative z-10">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-4">Get in Touch</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5">{heading}</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-10">{description}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ctaPrimary.href} className="cursor-pointer">
                <Button size="lg" className="gap-2 group bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  {ctaPrimary.label} &rarr;
                </Button>
              </Link>
              <Link href={ctaSecondary.href} className="cursor-pointer">
                <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 cursor-pointer">
                  {ctaSecondary.label}
                </Button>
              </Link>
            </div>

            <a
              href="tel:+35679661889"
              className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              Or call us: +356 7966 1889
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
