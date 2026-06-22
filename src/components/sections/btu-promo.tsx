'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calculator, ArrowRight, Clock, ThumbsUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = [
  { icon: Clock, label: 'Enter room size', detail: 'Length, width, height in metres' },
  { icon: Zap, label: 'Get your BTU', detail: 'We calculate the exact cooling capacity' },
  { icon: ThumbsUp, label: 'See matched units', detail: 'Products sized right for your room' },
]

export default function BtuPromo() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Calculator aria-hidden="true" className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Free Tool</span>
            </div>

            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl text-white leading-tight">
              Not sure which air conditioner<br />
              <span className="text-blue-400 italic">you need?</span>
            </h2>

            <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-md">
              Calculate the right cooling capacity for your room in less than 30 seconds.
              No guesswork. No oversized units. No wasted energy.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/btu-calculator">
                <Button size="lg" className="group bg-blue-600 hover:bg-blue-500 text-white gap-2.5 px-8 shadow-lg shadow-blue-900/40 transition-all duration-200">
                  Find My Perfect Air Conditioner
                  <ArrowRight aria-hidden="true" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/8 hover:text-white gap-2 bg-transparent">
                  <span>Get expert advice</span>
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Takes less than 30 seconds · No account required
            </p>
          </motion.div>

          {/* Right — step cards */}
          <motion.div
            className="mt-14 lg:mt-0 space-y-4"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className="flex-none flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20">
                    <Icon aria-hidden="true" className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-500/60 uppercase tracking-widest">Step {i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{step.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{step.detail}</p>
                  </div>
                </motion.div>
              )
            })}

            {/* Inline mini calculator CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20"
            >
              <p className="text-sm font-semibold text-white mb-1">Room 20 m² example</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-400">9,000</p>
                  <p className="text-xs text-slate-500">BTU/hr</p>
                </div>
                <div className="text-slate-600 text-lg">→</div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-400">2.6 kW</p>
                  <p className="text-xs text-slate-500">Capacity</p>
                </div>
                <div className="text-slate-600 text-lg">→</div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-400">A+++</p>
                  <p className="text-xs text-slate-500">Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
