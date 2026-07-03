'use client'

import { ShieldCheck, Wrench, Clock, Star, Zap, Users, Award, Headphones, Wind } from 'lucide-react'
import { PremiumImage } from '@/components/shared/premium-image'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'

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

interface WhyItem { icon: string; title: string; description: string }
interface WhyData { heading?: string; items?: WhyItem[]; image_url?: string }

const QUALIFIERS = ['Serving All Malta', 'Homes & Businesses', 'F-Gas Certified Engineers', 'Full After-Sales Care']

const DEFAULT_ITEMS: WhyItem[] = [
  { icon: 'shield-check', title: 'Official Brand Stockist', description: 'We stock Daikin, Fujitsu, Gree and other leading brands directly. Every product carries a full manufacturer warranty.' },
  { icon: 'wrench',       title: 'Certified Installation', description: 'Installations carried out by F-Gas certified engineers experienced in residential, commercial and industrial HVAC across Malta.' },
  { icon: 'clock',        title: 'Fast Turnaround',        description: 'We respond quickly to installation requests, service calls and emergency breakdowns across all of Malta.' },
  { icon: 'headphones',   title: 'Free Expert Advice',     description: 'Unsure which system suits your space? We advise on the right capacity, brand and setup — at no cost, before you commit.' },
]

export default function WhyChooseUs({ data }: { data: WhyData }) {
  const heading = data.heading ?? "Malta's trusted air conditioning specialists."
  const items = data.items ?? DEFAULT_ITEMS
  const imageUrl = data.image_url?.trim() || null

  return (
    <section className="bg-white py-20 lg:py-28 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className={`flex flex-col ${imageUrl ? 'lg:flex-row lg:gap-20 lg:items-start' : ''}`}>
          <div className={imageUrl ? 'lg:flex-1' : 'w-full'}>

            {/* Header */}
            <div className="mb-8 max-w-3xl">
              <Reveal mode="up">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                  Why Malta Chooses Us
                </p>
              </Reveal>
              <Reveal mode="blur" delay={0.05}>
                <h2 className="font-display text-4xl lg:text-5xl xl:text-[3.4rem] leading-[1.0] tracking-[-0.02em] text-slate-900">
                  {heading}
                </h2>
              </Reveal>
            </div>

            {/* Qualifier row — architectural chips */}
            <Reveal mode="up" delay={0.1}>
              <div className="mb-14 flex flex-wrap gap-x-6 gap-y-2">
                {QUALIFIERS.map(label => (
                  <span key={label} className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span className="w-1 h-1 bg-blue-500" style={{ borderRadius: 1 }} />{label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Reason grid — indexed, individually bordered cells, staggered */}
            <Stagger className={`grid grid-cols-1 sm:grid-cols-2 ${imageUrl ? '' : 'lg:grid-cols-4'} gap-px bg-slate-200 border border-slate-200`} gap={0.09}>
              {items.map((item, i) => {
                const Icon = ICON_MAP[item.icon] ?? ShieldCheck
                return (
                  <StaggerItem key={item.title} className="h-full">
                    <div className="group relative h-full bg-white p-7 hover:bg-slate-50/70 transition-colors duration-300 overflow-hidden">
                      {/* hover top accent */}
                      <span className="absolute top-0 left-0 h-[3px] w-0 bg-blue-600 group-hover:w-full transition-[width] duration-500 ease-out" />
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-11 h-11 flex items-center justify-center border border-slate-200 group-hover:border-blue-600 group-hover:bg-blue-600 transition-colors duration-300" style={{ borderRadius: 2 }}>
                          <Icon aria-hidden="true" className="h-4.5 w-4.5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="font-display text-xl text-slate-200 group-hover:text-blue-500 transition-colors duration-300 tabular-nums">0{i + 1}</span>
                      </div>
                      <h3 className="mb-2 text-[15px] font-bold text-slate-900">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>

          {/* Optional CMS image — only reserve the sidebar column when a real image is set */}
          {imageUrl && (
            <Reveal mode="scale" className="hidden lg:block lg:w-[380px] xl:w-[440px] shrink-0">
              <PremiumImage
                src={imageUrl}
                alt="F-Gas certified engineer installing air conditioning in a Maltese home"
                fill={false}
                width={440}
                height={520}
                sizes="(max-width: 1280px) 380px, 440px"
                containerClassName="w-full aspect-[4/5]"
                rounded="none"
                shadow
                hoverZoom
                placeholderLabel="Add showroom or engineer photo via Admin → Homepage → Why Choose Us"
                placeholderIcon={<Wind className="w-5 h-5 text-slate-400" aria-hidden="true" />}
              />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
