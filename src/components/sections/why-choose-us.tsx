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

const STATS = [
  { value: '15+',    label: 'Years in Malta' },
  { value: '1,200+', label: 'Installations' },
  { value: '6',      label: 'Premium Brands' },
  { value: '24h',    label: 'Response Time' },
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
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Our Promise
          </p>
          <h2 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl tracking-tight">
            {heading}
          </h2>
        </motion.div>

        {/* Stats — large numbers, minimal */}
        <motion.div
          className="mb-16 grid grid-cols-2 gap-px bg-slate-100 rounded-2xl overflow-hidden lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-10 px-6 bg-white text-center">
              <span className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                {stat.value}
              </span>
              <span className="mt-2.5 text-xs font-semibold text-slate-400 uppercase tracking-[0.14em]">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? ShieldCheck
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="group rounded-2xl border border-slate-100 p-8 transition-all duration-300 hover:border-blue-100 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition-colors duration-200 group-hover:bg-blue-50">
                  <Icon aria-hidden="true" className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
                </div>
                <h3 className="mb-2.5 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
