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
  const heading     = data.heading     || "Ready to get started?"
  const description = data.description || "Request a free quote or get in touch with our team today."
  const ctaPrimary  = data.cta_primary  || { label: 'Request a Quote', href: '/quote' }
  const ctaSecondary= data.cta_secondary|| { label: 'Contact Us', href: '/contact' }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 sm:px-14 text-center"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3">Get in Touch</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{heading}</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">{description}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ctaPrimary.href}>
                <Button size="lg" variant="brand" className="gap-2 group">
                  {ctaPrimary.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={ctaSecondary.href}>
                <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                  {ctaSecondary.label}
                </Button>
              </Link>
            </div>

            <a href="tel:+35679661889" className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-sky-400" />
              Or call us: +356 7966 1889
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
