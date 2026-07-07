'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { CountUp } from '@/components/motion/primitives'

interface SpecGaugeProps {
  icon: LucideIcon
  label: string
  value: number
  max: number
  unit?: string
  decimals?: number
  accent?: 'blue' | 'emerald' | 'orange'
}

const ACCENT_BAR: Record<NonNullable<SpecGaugeProps['accent']>, string> = {
  blue:    'bg-blue-600',
  emerald: 'bg-emerald-500',
  orange:  'bg-orange-500',
}

/**
 * A headline performance stat with an animated fill bar — used for the 2-3
 * numbers worth a "wow" on the product detail page (cooling capacity, SEER,
 * warranty), distinct from the plain data-grid HvacSpecCard below it.
 */
export default function SpecGauge({ icon: Icon, label, value, max, unit, decimals = 0, accent = 'blue' }: SpecGaugeProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 'some' })
  const reduceMotion = useReducedMotion()
  const pct = Math.min(100, Math.max(4, (value / max) * 100))

  return (
    <div ref={ref} className="p-5 bg-white border border-slate-200" style={{ borderRadius: 2 }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
        <CountUp to={value} decimals={decimals} duration={1.4} />
        {unit && <span className="text-base font-medium text-slate-400 ml-1">{unit}</span>}
      </p>
      <div className="h-1.5 bg-slate-100 overflow-hidden" style={{ borderRadius: 1 }}>
        <motion.div
          className={`h-full ${ACCENT_BAR[accent]}`}
          initial={{ width: 0 }}
          animate={{ width: inView ? `${pct}%` : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </div>
    </div>
  )
}
