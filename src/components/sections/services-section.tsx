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
    <section className="py-24 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">What We Do</p>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight text-slate-900 mb-6">{heading}</h2>
            <p className="text-slate-500 leading-relaxed mb-10 max-w-md">
              From single-room air conditioning to full commercial HVAC installations,
              our certified engineers deliver premium solutions across Malta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/services">
                <Button variant="brand" className="group gap-2">
                  Book a Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/quote">
                <Button variant="outline">Request a Quote</Button>
              </Link>
            </div>
          </motion.div>

          {/* Right — service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Wrench
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                  className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-[0_8px_32px_-8px_rgba(14,165,233,0.15)] hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[15px] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
