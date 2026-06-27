import Link from 'next/link'
import Image from 'next/image'
import { Calculator, ArrowRight, Ruler, Thermometer, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BtuPromoData {
  image_url?: string
  heading?: string
  description?: string
}

const BTU_STEPS = [
  {
    icon: Ruler,
    step: '01',
    title: 'Measure Your Room',
    body: 'Enter length, width and ceiling height',
  },
  {
    icon: Thermometer,
    step: '02',
    title: 'Set Conditions',
    body: 'Sun exposure, insulation and occupancy',
  },
  {
    icon: Zap,
    step: '03',
    title: 'Get Your Result',
    body: 'Matched to products in our catalogue',
  },
]

export default function BtuPromo({ data = {} }: { data?: BtuPromoData }) {
  const heading = data.heading ?? "Not sure which air conditioner you need?"
  const description = data.description ?? "Calculate the right cooling capacity for your room in less than 30 seconds. No guesswork. No oversized units. No wasted energy."

  return (
    <section className="relative py-10 lg:py-16 bg-slate-950 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Calculator aria-hidden="true" className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Free Tool</span>
            </div>

            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl text-white leading-tight">
              {heading.includes(' & ') || heading.includes('?') ? (
                <>
                  {heading.split('?')[0]}
                  {heading.includes('?') && <span className="text-blue-400 italic">?</span>}
                </>
              ) : heading}
            </h2>

            <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-md">
              {description}
            </p>

            {/* Trust micro-signals */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {['Covers all room types', 'Malta climate optimised', 'Matched to real products'].map(item => (
                <span key={item} className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                  <span className="w-1 h-1 rounded-full bg-blue-500/60 shrink-0" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/btu-calculator">
                <Button size="lg" className="group bg-blue-600 hover:bg-blue-500 text-white gap-2.5 px-8 shadow-lg shadow-blue-900/40 transition-all duration-200">
                  Find My Perfect Air Conditioner
                  <ArrowRight aria-hidden="true" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/[0.08] hover:text-white gap-2 bg-transparent">
                  Get expert advice
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Takes less than 30 seconds · No account required
            </p>
          </div>

          {/* Right — CMS image or BTU process illustration */}
          <div className="relative mt-8 lg:mt-0">
            {data.image_url ? (
              <div className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-3xl">
                <Image
                  src={data.image_url}
                  alt="BTU calculator — find your ideal air conditioner"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                {/* Floating result badge */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="inline-flex items-center gap-4 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-400 tabular-nums">9,000</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">BTU/hr</p>
                    </div>
                    <div className="text-slate-600 text-base">→</div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-400 tabular-nums">2.6 kW</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Capacity</p>
                    </div>
                    <div className="text-slate-600 text-base">→</div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-emerald-400">A+++</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* BTU process illustration — dark card with 3 steps */
              <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-slate-900 to-blue-950/40 p-8 lg:p-10">
                <div className="space-y-6">
                  {BTU_STEPS.map(({ icon: Icon, step, title, body }) => (
                    <div
                      key={step}
                      className="flex items-start gap-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-[10px] font-bold text-blue-600/60 tracking-[0.2em] mb-1">STEP {step}</p>
                        <h3 className="text-[15px] font-semibold text-white mb-0.5">{title}</h3>
                        <p className="text-sm text-slate-500">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Example result card */}
                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4">Example result</p>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400 tabular-nums">9,000</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">BTU/hr</p>
                    </div>
                    <div className="text-slate-700">→</div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400 tabular-nums">2.6 kW</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Capacity</p>
                    </div>
                    <div className="text-slate-700">→</div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">A+++</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Rating</p>
                    </div>
                    <p className="ml-2 text-[11px] text-slate-600 leading-tight">20 m²<br />room</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
