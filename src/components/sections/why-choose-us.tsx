'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Wrench, Clock, Star, Zap, Users, Award, Headphones } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck,
  wrench: Wrench,
  clock: Clock,
  star: Star,
  zap: Zap,
  users: Users,
  award: Award,
  headphones: Headphones,
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

export default function WhyChooseUs({ data }: { data: WhyData }) {
  const heading = data.heading || 'Why Choose THE AIRCONDITION SHOP'
  const items: WhyItem[] = data.items || [
    { icon: 'shield-check', title: 'Authorised Dealer',    description: 'Official dealer for Daikin, Mitsubishi Electric, Panasonic and more premium brands.' },
    { icon: 'wrench',       title: 'Expert Installation',  description: 'Certified engineers with years of experience in residential and commercial HVAC.' },
    { icon: 'clock',        title: 'Fast Response',        description: 'Quick turnaround on installations, repairs and emergency call-outs across Malta.' },
    { icon: 'star',         title: 'Premium Quality',      description: 'Only the highest-quality products from world-leading manufacturers.' },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Our Promise</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{heading}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] || ShieldCheck
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-5 group-hover:bg-sky-100 transition-colors duration-200">
                  <Icon className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-slate-900 rounded-3xl text-center"
        >
          {[
            { value: '15+', label: 'Years Experience' },
            { value: '1,200+', label: 'Installations' },
            { value: '6', label: 'Premium Brands' },
            { value: '24h', label: 'Response Time' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-3xl font-bold text-sky-400">{stat.value}</span>
              <span className="mt-1 text-sm text-slate-400">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
