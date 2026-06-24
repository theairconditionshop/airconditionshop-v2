'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, Zap, Headphones, ArrowRight } from 'lucide-react'

interface TradeCtaData {
  image_url?: string
}

const features = [
  {
    icon: Tag,
    title: 'Installer Pricing',
    body: 'Trade-only rates across our full catalogue of HVAC, refrigeration and installation materials.',
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

export default function TradeCta({ data = {} }: { data?: TradeCtaData }) {
  const imageUrl = data.image_url || null

  return (
    <section className="bg-slate-950 py-10 lg:py-16 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Mobile image — shown above content when set in admin */}
        {imageUrl && (
          <motion.div
            className="lg:hidden mb-8 relative aspect-[16/9] overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={imageUrl}
              alt="Professional HVAC installer at work"
              fill
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-sm border border-white/[0.08] rounded-xl px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-300 font-medium">F-Gas Certified · Manufacturer Approved</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className={imageUrl ? 'lg:grid lg:grid-cols-[1fr_380px] lg:gap-14 lg:items-stretch' : ''}>

          {/* Left — content */}
          <div>
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

            <div className="mt-14 h-px bg-white/10" />

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

          {/* Right — installer image (desktop only, when set in admin) */}
          {imageUrl && (
            <motion.div
              className="hidden lg:flex"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            >
              <div className="relative h-full min-h-[440px] overflow-hidden rounded-2xl">
                <Image
                  src={imageUrl}
                  alt="Professional HVAC installer at work"
                  fill
                  sizes="380px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950/20" />

                {/* Floating badge */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-white/[0.08] rounded-xl px-4 py-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-[12px] text-slate-300 font-medium">F-Gas Certified · Manufacturer Approved</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
