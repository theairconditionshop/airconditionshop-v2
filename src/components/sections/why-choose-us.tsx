import { ShieldCheck, Wrench, Clock, Star, Zap, Users, Award, Headphones, Wind } from 'lucide-react'
import { PremiumImage } from '@/components/shared/premium-image'

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
  image_url?: string
}

const QUALIFIERS = [
  { label: 'Serving All Malta' },
  { label: 'Homes & Businesses' },
  { label: 'F-Gas Certified Engineers' },
  { label: 'Full After-Sales Care' },
]

const DEFAULT_ITEMS: WhyItem[] = [
  {
    icon: 'shield-check',
    title: 'Official Brand Stockist',
    description: 'We stock Daikin, Fujitsu, Gree and other leading brands directly. Every product comes with a full manufacturer warranty.',
  },
  {
    icon: 'wrench',
    title: 'Certified Installation',
    description: 'All installations are carried out by F-Gas certified engineers with experience in residential, commercial and industrial HVAC projects across Malta.',
  },
  {
    icon: 'clock',
    title: 'Fast Turnaround',
    description: 'We respond quickly to installation requests, service calls and emergency breakdowns across all Malta.',
  },
  {
    icon: 'headphones',
    title: 'Free Expert Advice',
    description: 'Not sure which system suits your space? Our team advises on the right capacity, brand and setup — at no cost, before you commit.',
  },
]


export default function WhyChooseUs({ data }: { data: WhyData }) {
  const heading = data.heading ?? "Malta's Trusted Air Conditioning & HVAC Specialists"
  const items = data.items ?? DEFAULT_ITEMS
  const imageUrl = data.image_url ?? null

  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className={`flex flex-col ${imageUrl ? 'lg:flex-row lg:gap-16 lg:items-start' : ''}`}>

          {/* Left column — content */}
          <div className={imageUrl ? 'lg:flex-1' : 'w-full'}>

            {/* Header */}
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Why Customers Choose Us
              </p>
              <h2 className="font-display text-3xl lg:text-4xl xl:text-[2.75rem] leading-tight text-slate-900">
                {heading}
              </h2>
            </div>

            {/* Qualifier badges */}
            <div className="mb-12 flex flex-wrap gap-2">
              {QUALIFIERS.map(({ label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-[13px] font-medium text-slate-600"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                  {label}
                </span>
              ))}
            </div>

            {/* Feature list — editorial columns */}
            <div className={`grid grid-cols-1 gap-0 sm:grid-cols-2 ${imageUrl ? '' : 'lg:grid-cols-4'} divide-y sm:divide-y-0 sm:divide-x divide-slate-100`}>
              {items.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? ShieldCheck
                return (
                  <div
                    key={item.title}
                    className="group py-8 sm:py-0 sm:px-8 first:pl-0 last:pr-0 cursor-default"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                      <Icon aria-hidden="true" className="h-4.5 w-4.5 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column — image (only rendered when image_url is set in CMS) */}
          {imageUrl !== undefined && (
            <div className="hidden lg:block lg:w-[380px] xl:w-[440px] shrink-0 mt-2">
              <PremiumImage
                src={imageUrl}
                alt="F-Gas certified engineer installing air conditioning in a Maltese home"
                fill={false}
                width={440}
                height={520}
                sizes="(max-width: 1280px) 380px, 440px"
                containerClassName="w-full aspect-[4/5]"
                rounded="2xl"
                shadow
                hoverZoom
                placeholderLabel="Add showroom or engineer photo via Admin → Homepage → Why Choose Us"
                placeholderIcon={<Wind className="w-5 h-5 text-slate-400" aria-hidden="true" />}
              />
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
