'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Thermometer, Snowflake, Wrench, Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ICON_MAP: Record<string, React.ElementType> = {
  thermometer: Thermometer,
  snowflake: Snowflake,
  tool: Wrench,
  wrench: Wrench,
  building: Building2,
}

interface ServiceItem { icon: string; title: string; description: string }
interface ServicesData {
  heading?: string
  items?: ServiceItem[]
}

export default function ServicesSection({ data }: { data: ServicesData }) {
  const heading = data.heading || 'Our Services'
  const items: ServiceItem[] = data.items || [
    { icon: 'thermometer', title: 'Air Conditioning Installation', description: 'Professional installation of split, multi-split and VRF systems for homes and businesses.' },
    { icon: 'snowflake',   title: 'Commercial Refrigeration',      description: 'Cold rooms, commercial fridges and freezers for hotels, restaurants and retail.' },
    { icon: 'wrench',      title: 'Maintenance & Repair',          description: 'Scheduled maintenance, emergency repairs and servicing to keep systems running.' },
    { icon: 'building',    title: 'Commercial HVAC Projects',      description: 'Large-scale VRF and HVAC design and installation for commercial properties.' },
  ]

  return (
    <section className="py-14 lg:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">What We Do</p>
            <h2 className="font-display text-3xl lg:text-4xl leading-tight text-slate-900 mb-6">{heading}</h2>
            <p className="text-slate-500 leading-relaxed mb-8 max-w-sm text-[15px]">
              From single-room air conditioning to full commercial HVAC installations,
              our certified engineers deliver premium solutions across Malta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/services">
                <Button variant="brand" className="group gap-2 cursor-pointer">
                  Book a Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/quote">
                <Button variant="outline" className="cursor-pointer">Request a Quote</Button>
              </Link>
            </div>
          </motion.div>

          {/* Right — numbered editorial list */}
          <div className="divide-y divide-slate-100">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Wrench
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="group flex items-start gap-5 py-7 first:pt-0 last:pb-0"
                >
                  {/* Number */}
                  <span className="font-display text-4xl font-black text-slate-100 leading-none w-9 shrink-0 select-none group-hover:text-blue-100 transition-colors duration-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Icon + Content */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors duration-200">
                      <Icon className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-[15px] mb-1.5 leading-snug">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
