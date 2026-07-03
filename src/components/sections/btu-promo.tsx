'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Ruler, Thermometer, Zap } from 'lucide-react'
import { Reveal, Stagger, StaggerItem, CountUp, Magnetic } from '@/components/motion/primitives'

interface BtuPromoData {
  image_url?: string
  heading?: string
  description?: string
}

const STEPS = [
  { icon: Ruler,       step: '01', title: 'Measure your room', body: 'Length, width and ceiling height.' },
  { icon: Thermometer, step: '02', title: 'Set the conditions', body: 'Sun exposure, insulation, occupancy.' },
  { icon: Zap,         step: '03', title: 'Get the exact match', body: 'Paired to real units in our range.' },
]

export default function BtuPromo({ data = {} }: { data?: BtuPromoData }) {
  const heading = data.heading ?? 'The right capacity. Not a watt more.'
  const description = data.description ?? 'An oversized unit wastes energy; an undersized one never keeps up. Our calculator sizes your cooling to your exact room in under 30 seconds — matched to real products.'

  return (
    <section className="relative bg-white overflow-hidden">
      {/* hairline top rule */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-slate-100" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left — copy + steps */}
          <div className="lg:col-span-6">
            <Reveal mode="up">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-5">
                Free Tool · 30 Seconds
              </p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h2 className="font-display text-4xl lg:text-5xl xl:text-[3.4rem] leading-[1.02] tracking-[-0.02em] text-slate-900 max-w-lg">
                {heading}
              </h2>
            </Reveal>
            <Reveal mode="up" delay={0.12}>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-md">
                {description}
              </p>
            </Reveal>

            {/* Steps */}
            <Stagger className="mt-10 space-y-px border-t border-slate-100" gap={0.1}>
              {STEPS.map(({ icon: Icon, step, title, body }) => (
                <StaggerItem key={step}>
                  <div className="group flex items-center gap-5 py-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors duration-300 px-1">
                    <span className="font-display text-2xl text-slate-300 group-hover:text-blue-500 transition-colors duration-300 w-10 tabular-nums">{step}</span>
                    <div className="w-10 h-10 flex items-center justify-center border border-slate-200 group-hover:border-blue-300 transition-colors duration-300 shrink-0" style={{ borderRadius: 2 }}>
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
                      <p className="text-sm text-slate-500">{body}</p>
                    </div>
                    <ArrowRight className="ml-auto w-4 h-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal mode="up" delay={0.15} className="mt-10">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Magnetic strength={0.25}>
                  <Link
                    href="/btu-calculator"
                    className="group flex items-center justify-center gap-2.5 px-8 h-14 bg-slate-900 text-white text-[15px] font-semibold hover:bg-blue-600 transition-colors duration-300"
                    style={{ borderRadius: 2 }}
                  >
                    Find my perfect fit
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Magnetic>
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-8 h-14 border border-slate-300 text-slate-800 text-[15px] font-semibold hover:border-slate-900 transition-colors duration-300"
                  style={{ borderRadius: 2 }}
                >
                  Ask an expert
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — architectural result panel */}
          <div className="lg:col-span-6">
            <Reveal mode="scale">
              <div className="relative border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-8 lg:p-10" style={{ borderRadius: 2 }}>
                {data.image_url && (
                  <div className="relative aspect-[16/9] mb-8 overflow-hidden" style={{ borderRadius: 2 }}>
                    <Image src={data.image_url} alt="Sizing an air conditioner for a Malta room" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                  </div>
                )}

                <p className="text-[11px] text-slate-400 uppercase tracking-[0.22em] mb-6">Example result · 20 m² room</p>

                <div className="grid grid-cols-3 divide-x divide-slate-200">
                  <Metric value={<CountUp to={9000} duration={2} />} unit="BTU / hr" />
                  <Metric value={<><CountUp to={2.6} decimals={1} duration={2} /> kW</>} unit="Capacity" />
                  <Metric value={<span className="text-emerald-600">A+++</span>} unit="Efficiency" />
                </div>

                {/* airflow bar */}
                <div className="mt-8 h-1.5 bg-slate-100 overflow-hidden" style={{ borderRadius: 2 }}>
                  <Reveal mode="fade" delay={0.3}>
                    <div className="h-full w-full bg-gradient-to-r from-orange-400 via-sky-400 to-blue-600 origin-left animate-[growbar_1.6s_ease-out]" />
                  </Reveal>
                </div>
                <div className="mt-2.5 flex justify-between text-[11px] text-slate-400">
                  <span>Heat load in</span>
                  <span>Comfort out</span>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  )
}

function Metric({ value, unit }: { value: React.ReactNode; unit: string }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0 text-center">
      <p className="font-display text-3xl lg:text-4xl text-slate-900 tabular-nums leading-none">{value}</p>
      <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-[0.15em]">{unit}</p>
    </div>
  )
}
