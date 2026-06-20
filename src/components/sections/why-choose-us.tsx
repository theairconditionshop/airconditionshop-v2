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
  { value: '1,200+', label: 'Installations Completed' },
  { value: '6',      label: 'Premium Brands' },
  { value: '24h',    label: 'Emergency Response' },
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function WhyChooseUs({ data }: { data: WhyData }) {
  const heading = data.heading ?? 'Why Choose THE AIRCONDITION SHOP'
  const items = data.items ?? DEFAULT_ITEMS

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Our Promise
          </p>
          <h2 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
            {heading}
          </h2>
        </div>

        {/* Stats bar */}
        <motion.div
          className="mb-12 grid grid-cols-2 gap-6 rounded-3xl bg-slate-950 p-10 text-center lg:grid-cols-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-4xl font-bold text-amber-400">{stat.value}</span>
              <span className="mt-1 text-sm text-slate-400">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? ShieldCheck
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="group rounded-2xl border border-slate-100 p-7 transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-colors duration-200 group-hover:bg-blue-100">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
