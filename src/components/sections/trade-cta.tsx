'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Tag, Zap, Headphones, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Tag,
    title: 'Installer Pricing',
    body: 'Trade-only rates across our full catalogue of Daikin, Mitsubishi Electric, Panasonic and more.',
  },
  {
    icon: Zap,
    title: 'Priority Quotations',
    body: 'Fast-track quotes and dedicated account management for project work.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    body: 'Direct line to our technical team for spec queries, warranty and service support.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function TradeCta() {
  return (
    <section className="bg-slate-950 py-14 lg:py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            For Installers &amp; Contractors
          </p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl leading-tight text-white">
                The Trade
                <br />
                Programme
              </h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-slate-400 lg:text-right">
              Join Malta&apos;s trusted HVAC trade network. Access exclusive pricing, priority stock and
              dedicated commercial support.
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="mt-14 h-px bg-white/10" />

        {/* Feature columns */}
        <motion.div
          className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {features.map(({ icon: Icon, title, body }) => (
            <motion.div key={title} variants={itemVariants} className="flex flex-col gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Icon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <Link
            href="/trade/register"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
          >
            Apply for Trade Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/5"
          >
            Trade Login
          </Link>
        </motion.div>

        {/* Fine print */}
        <motion.p
          className="mt-6 text-xs text-slate-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          Applications reviewed within 2 business days &middot; Malta VAT number required
        </motion.p>
      </div>
    </section>
  )
}
