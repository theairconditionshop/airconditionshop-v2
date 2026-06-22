'use client'

import { motion, useInView, useMotionValue, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { ShieldCheck, Wrench, Clock, Star, Zap, Users, Award, Headphones } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck,
  wrench:         Wrench,
  clock:          Clock,
  star:           Star,
  zap:            Zap,
  users:          Users,
  award:          Award,
  headphones:     Headphones,
}

interface WhyItem {
  icon: string
  title: string
  description: string
}

interface WhyData {
  heading?: string
  items?: WhyItem[]
}

const STATS = [
  { value: 15,    suffix: '+', label: 'Years in Malta' },
  { value: 1200,  suffix: '+', label: 'Installations' },
  { value: 6,     suffix: '',  label: 'Premium Brands' },
  { value: 24,    suffix: 'h', label: 'Response Time' },
]

const DEFAULT_ITEMS: WhyItem[] = [
  {
    icon: 'shield-check',
    title: 'Authorised Dealer',
    description: 'Official dealer for Daikin, Mitsubishi Electric, Panasonic and more premium brands.',
  },
  {
    icon: 'wrench',
    title: 'Expert Installation',
    description: 'Certified engineers with years of experience in residential and commercial HVAC.',
  },
  {
    icon: 'clock',
    title: 'Fast Response',
    description: 'Quick turnaround on installations, repairs and emergency call-outs across Malta.',
  },
  {
    icon: 'star',
    title: 'Premium Quality',
    description: 'Only the highest-quality products from world-leading manufacturers.',
  },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const displayRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(triggerRef, { once: true, margin: '-80px' })
  const motionValue = useMotionValue(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    })
    const unsub = motionValue.on('change', (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = Math.round(v).toLocaleString() + suffix
      }
    })
    return () => {
      controls.stop()
      unsub()
    }
  }, [isInView, motionValue, value, suffix])

  return (
    <div ref={triggerRef}>
      <span ref={displayRef}>0{suffix}</span>
    </div>
  )
}

export default function WhyChooseUs({ data }: { data: WhyData }) {
  const heading = data.heading ?? 'Why Choose THE AIRCONDITION SHOP'
  const items = data.items ?? DEFAULT_ITEMS

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Our Promise
          </p>
          <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl leading-tight text-slate-900">
            {heading}
          </h2>
        </motion.div>

        {/* Stats — animated counters */}
        <motion.div
          className="mb-12 grid grid-cols-2 gap-px bg-slate-100 rounded-2xl overflow-hidden lg:grid-cols-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-8 px-4 bg-white text-center">
              <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none tabular-nums">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.14em]">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Feature list — editorial columns, no card borders */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? ShieldCheck
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.45 }}
                className="group py-8 sm:py-0 sm:px-8 first:pl-0 last:pr-0 cursor-default"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                  <Icon aria-hidden="true" className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
