'use client'

import { motion } from 'framer-motion'
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

const QUALIFIERS = [
  { label: 'Malta Based' },
  { label: 'Residential & Commercial' },
  { label: 'Fast Response' },
  { label: 'Professional Support' },
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


export default function WhyChooseUs({ data }: { data: WhyData }) {
  const heading = data.heading ?? 'Why Choose THE AIRCONDITION SHOP'
  const items = data.items ?? DEFAULT_ITEMS

  return (
    <section className="bg-white py-10 lg:py-16">
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

        {/* Qualifier badges */}
        <motion.div
          className="mb-12 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {QUALIFIERS.map(({ label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-[13px] font-medium text-slate-600"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
              {label}
            </span>
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
