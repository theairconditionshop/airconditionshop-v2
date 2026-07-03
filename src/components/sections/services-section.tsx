'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Thermometer, Snowflake, Wrench, Building2, ArrowRight } from 'lucide-react'
import { Reveal, Stagger, StaggerItem, Magnetic } from '@/components/motion/primitives'

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
  description?: string
  image_url?: string
  items?: ServiceItem[]
}

export default function ServicesSection({ data }: { data: ServicesData }) {
  const heading = data.heading || 'Installation, repairs & servicing across Malta.'
  const description = data.description || 'From a single split unit in your home to a full commercial HVAC or refrigeration fit-out, our certified team handles supply, installation and ongoing servicing across all Malta.'
  const imageUrl = data.image_url || null
  const items: ServiceItem[] = data.items || [
    { icon: 'thermometer', title: 'Air Conditioning Installation', description: 'We install split, multi-split and VRF systems in homes, apartments and offices across Malta. Every installation is carried out by F-Gas certified engineers.' },
    { icon: 'snowflake',   title: 'Commercial Refrigeration',      description: 'Supply and installation of cold rooms, display cases, commercial fridges and freezers for hotels, restaurants, supermarkets and retail outlets.' },
    { icon: 'wrench',      title: 'Maintenance & Repairs',         description: 'Scheduled servicing, fault diagnosis and emergency repairs for all major air conditioning and refrigeration brands. Fast response across Malta.' },
    { icon: 'building',    title: 'Commercial HVAC Projects',      description: 'Design and installation of large-scale VRF, central air conditioning and ventilation systems for commercial buildings, offices and hospitality venues.' },
  ]

  return (
    <section className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile image */}
        {imageUrl && (
          <Reveal mode="fade" className="lg:hidden mb-10 relative aspect-[16/9] overflow-hidden">
            <Image src={imageUrl} alt="Professional HVAC installation and service" fill sizes="100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5" style={{ borderRadius: 2 }}>
              <span className="w-1.5 h-1.5 bg-blue-400 shrink-0" style={{ borderRadius: 1 }} />
              F-Gas Certified Engineers
            </div>
          </Reveal>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — sticky heading + CTA */}
          <div className="lg:sticky lg:top-24">
            <Reveal mode="up">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-4">What We Do</p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h2 className="font-display text-4xl lg:text-5xl leading-[1.03] tracking-[-0.01em] text-slate-900 mb-6 max-w-md">{heading}</h2>
            </Reveal>
            <Reveal mode="up" delay={0.1}>
              <p className="text-slate-500 leading-relaxed mb-9 max-w-sm text-[15px]">{description}</p>
            </Reveal>
            <Reveal mode="up" delay={0.15}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Magnetic strength={0.2}>
                  <Link href="/services" className="group inline-flex items-center justify-center gap-2 px-7 h-[3.25rem] bg-slate-900 text-white text-sm font-semibold hover:bg-blue-600 transition-colors duration-300" style={{ borderRadius: 2 }}>
                    Book a Service
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Magnetic>
                <Link href="/quote" className="inline-flex items-center justify-center px-7 h-[3.25rem] border border-slate-300 text-slate-800 text-sm font-semibold hover:border-slate-900 transition-colors duration-300" style={{ borderRadius: 2 }}>
                  Request a Quote
                </Link>
              </div>
            </Reveal>

            {imageUrl && (
              <Reveal mode="scale" delay={0.15} className="hidden lg:block mt-12 relative aspect-[4/3] overflow-hidden">
                <Image src={imageUrl} alt="Professional HVAC installation and service" fill sizes="(max-width: 1280px) 50vw, 560px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5" style={{ borderRadius: 2 }}>
                  <span className="w-1.5 h-1.5 bg-blue-400 shrink-0" style={{ borderRadius: 1 }} />
                  F-Gas Certified Engineers
                </div>
              </Reveal>
            )}
          </div>

          {/* Right — vertical service rail (distinct motif: connecting line + markers, not a grid) */}
          <div className="relative">
            <div aria-hidden className="absolute left-5 top-2 bottom-2 w-px bg-slate-200" />
            <Stagger gap={0.12}>
              {items.map((item, i) => {
                const Icon = ICON_MAP[item.icon] || Wrench
                return (
                  <StaggerItem key={i}>
                    <div className="group relative flex items-start gap-6 pb-12 last:pb-0">
                      {/* Marker on the rail */}
                      <div className="relative z-10 shrink-0 w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-200 group-hover:border-blue-600 group-hover:bg-blue-600 transition-colors duration-300" style={{ borderRadius: 2 }}>
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div className="min-w-0 pt-1.5">
                        <p className="text-[11px] font-semibold text-slate-300 tracking-[0.15em] mb-1.5 group-hover:text-blue-400 transition-colors duration-300">STEP {String(i + 1).padStart(2, '0')}</p>
                        <h3 className="font-semibold text-slate-900 text-lg mb-2 leading-snug group-hover:text-blue-700 transition-colors duration-300">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-md">{item.description}</p>
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  )
}
