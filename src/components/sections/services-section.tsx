import Link from 'next/link'
import Image from 'next/image'
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
  description?: string
  image_url?: string
  items?: ServiceItem[]
}

export default function ServicesSection({ data }: { data: ServicesData }) {
  const heading = data.heading || 'Our Services'
  const description = data.description || 'From single-room air conditioning to full commercial HVAC installations, our certified engineers deliver premium solutions across Malta.'
  const imageUrl = data.image_url || null
  const items: ServiceItem[] = data.items || [
    { icon: 'thermometer', title: 'Air Conditioning Installation', description: 'Professional installation of split, multi-split and VRF systems for homes and businesses.' },
    { icon: 'snowflake',   title: 'Commercial Refrigeration',      description: 'Cold rooms, commercial fridges and freezers for hotels, restaurants and retail.' },
    { icon: 'wrench',      title: 'Maintenance & Repair',          description: 'Scheduled maintenance, emergency repairs and servicing to keep systems running.' },
    { icon: 'building',    title: 'Commercial HVAC Projects',      description: 'Large-scale VRF and HVAC design and installation for commercial properties.' },
  ]

  return (
    <section className="py-10 lg:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile image — shown above content when set in admin */}
        {imageUrl && (
          <div className="lg:hidden mb-8 relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={imageUrl}
              alt="Professional HVAC installation and service — certified engineers"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                F-Gas Certified Engineers
              </span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — heading + CTA */}
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">What We Do</p>
            <h2 className="font-display text-3xl lg:text-4xl leading-tight text-slate-900 mb-6">{heading}</h2>
            <p className="text-slate-500 leading-relaxed mb-8 max-w-sm text-[15px]">
              {description}
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

            {/* Desktop image — shown in left column when set in admin */}
            {imageUrl && (
              <div className="hidden lg:block mt-10 relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={imageUrl}
                  alt="Professional HVAC installation and service — certified engineers"
                  fill
                  sizes="(max-width: 1280px) 50vw, 560px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    F-Gas Certified Engineers
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right — numbered editorial list */}
          <div className="divide-y divide-slate-100">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Wrench
              return (
                <div
                  key={i}
                  className="group flex items-start gap-5 py-7 first:pt-0 last:pb-0"
                >
                  <span className="font-display text-4xl font-black text-slate-100 leading-none w-9 shrink-0 select-none group-hover:text-blue-100 transition-colors duration-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors duration-200">
                      <Icon className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-[15px] mb-1.5 leading-snug">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
