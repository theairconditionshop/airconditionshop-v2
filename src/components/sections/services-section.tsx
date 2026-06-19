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
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">What We Do</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">{heading}</h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              From single-room air conditioning to full commercial HVAC installations,
              our certified engineers deliver premium solutions across Malta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/services">
                <Button variant="brand">Book a Service</Button>
              </Link>
              <Link href="/quote">
                <Button variant="outline">Request a Quote</Button>
              </Link>
            </div>
          </div>

          {/* Right — service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Wrench
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-sky-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
