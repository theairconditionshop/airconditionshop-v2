import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { PremiumImage } from '@/components/shared/premium-image'
import { TrustBadges } from '@/components/shared/trust-badges'
import { InternalLinkPanel } from '@/components/shared/internal-link-panel'
import { FadeUpSection, AnimatedSection, FadeUp } from '@/components/shared/animated-section'
import {
  CheckCircle2, Phone, ArrowRight, LogIn, Tag, Zap, Headphones,
  Clock, XCircle, ShieldOff, Package, BarChart3, Users, Award, Star,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'HVAC Trade Accounts for Installers & Contractors in Malta',
  description: 'Apply for a Trade Account at THE AIRCONDITION SHOP. Exclusive pricing, priority stock and dedicated support for HVAC installers, contractors and commercial buyers in Malta.',
  alternates: { canonical: 'https://www.theairconditionshop.com/trade' },
}

const STATS = [
  { value: '2,000+', label: 'Products in Stock',      sub: 'Across all HVAC categories' },
  { value: '10+',    label: 'Premium Brands',          sub: 'Daikin, Gree, Fujitsu & more' },
  { value: '48h',    label: 'Approval Turnaround',     sub: 'From application to access' },
  { value: '24/7',   label: 'Emergency Trade Support', sub: 'For approved account holders' },
]

const BENEFITS = [
  {
    icon: Tag,
    title: 'Exclusive Trade Pricing',
    desc: 'Competitive trade rates on air conditioners, heat pumps, refrigeration equipment and installation materials — available to approved account holders.',
  },
  {
    icon: Package,
    title: 'Priority Stock Access',
    desc: 'Pre-order and reserve stock before it goes to retail. Never lose a project to lead time delays.',
  },
  {
    icon: Users,
    title: 'Dedicated Account Manager',
    desc: 'A named contact in our team who knows your business, your preferred brands and your project pipeline.',
  },
  {
    icon: Zap,
    title: 'Fast Quotations',
    desc: 'Submit a project spec and receive a detailed quote quickly. We support jobs of all sizes, from a single domestic unit to full commercial fit-outs.',
  },
  {
    icon: Headphones,
    title: 'Technical Support',
    desc: 'Direct access to our team for product selection, spec queries, warranty claims and after-sales assistance on all brands we supply.',
  },
  {
    icon: BarChart3,
    title: 'Commercial Project Pricing',
    desc: 'Volume pricing and special project rates for large commercial, hospitality and development contracts across Malta.',
  },
  {
    icon: Award,
    title: 'Manufacturer Support',
    desc: 'As an authorised installer programme partner, trade account holders benefit from manufacturer training, certification and promotional support.',
  },
  {
    icon: Star,
    title: 'Priority Warranty Assistance',
    desc: 'Fast-track warranty claims and direct liaison with manufacturers on your behalf to minimise downtime for your clients.',
  },
]

const WHY_CHOOSE = [
  { label: '2,000+ Products', desc: 'Air conditioners, heat pumps, refrigeration, HVAC tools and installation materials all in one place.' },
  { label: 'Premium Brands', desc: 'Official stockist for Daikin, Gree, Fujitsu and other leading HVAC manufacturers. All genuine products.' },
  { label: 'Dedicated Trade Support', desc: 'A named account manager, not a call centre. Direct line to the people who know your account.' },
  { label: 'Fast Delivery', desc: 'Most stock items available for next-day collection or delivery to your site anywhere in Malta.' },
  { label: 'Bulk Pricing', desc: 'Volume discounts available on project orders. Request a custom quote for large-scale jobs.' },
  { label: 'Commercial Stock', desc: 'VRF systems, commercial refrigeration units and large-scale HVAC equipment held in stock.' },
]

const ELIGIBLE = [
  'Registered HVAC Installers',
  'Air Conditioning Contractors',
  'Refrigeration Engineers',
  'Mechanical Contractors',
  'Electrical Contractors',
  'Facilities Management Companies',
  'Hotels and Hospitality Groups',
  'Construction and Development Companies',
  'Property Developers',
  'Commercial Buyers',
]

const STATUS_BANNERS = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800',
    title: 'Your application is under review',
    body: 'Our team is reviewing your Trade Account application and will be in touch within 2 business days. Check your inbox for updates.',
  },
  rejected: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
    title: 'Your application was not approved',
    body: 'We were unable to approve your Trade Account application at this time. Please contact us if you have questions or would like to discuss your application.',
  },
  suspended: {
    icon: ShieldOff,
    bg: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-500',
    textColor: 'text-orange-800',
    title: 'Your trade account has been suspended',
    body: 'Access to your Trade Account has been temporarily suspended. Please contact our team to resolve this.',
  },
} as const

type TradeStatus = keyof typeof STATUS_BANNERS

const TRADE_FAQS = [
  { q: 'How long does approval take?', a: 'Applications are typically reviewed within 2 business days. Once approved, trade pricing is activated immediately on your account.' },
  { q: 'Do I need a VAT number to apply?', a: 'A valid Malta VAT number or business registration is required. Sole traders with a registered business can apply — contact us if you\'re unsure.' },
  { q: 'Can sole traders apply?', a: 'Yes. Sole traders who are registered and working in the HVAC, refrigeration or electrical field are welcome to apply for a trade account.' },
  { q: 'Can I order online with a trade account?', a: 'Yes. Once approved, your account will reflect trade pricing when you browse and order online. You can also request quotes directly through your account.' },
  { q: 'Can I request quotations for projects?', a: 'Yes. Trade account holders can submit project specifications and receive fast, detailed quotations. Contact your account manager or use the quote request form.' },
  { q: 'Is there a minimum order value?', a: 'No minimum order is required. Trade pricing applies to all orders regardless of size. Volume discounts may be available on larger project orders.' },
]

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const banner = STATUS_BANNERS[status as TradeStatus] ?? null

  return (
    <>
      <Navbar transparent />
      <main id="main-content" className="min-h-screen">

        {/* Status banner */}
        {banner && (() => {
          const Icon = banner.icon
          return (
            <div className={`fixed top-16 lg:top-[68px] inset-x-0 z-40 border-b ${banner.bg} px-4 py-3`} role="alert">
              <div className="max-w-7xl mx-auto flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${banner.iconColor}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${banner.textColor}`}>{banner.title}</p>
                  <p className={`text-sm mt-0.5 ${banner.textColor} opacity-80`}>{banner.body}</p>
                </div>
                <Link href="/contact" className={`text-xs font-semibold ${banner.textColor} underline underline-offset-2 shrink-0 mt-0.5`}>
                  Contact us
                </Link>
              </div>
            </div>
          )
        })()}

        {/* ── Hero ── */}
        <section className="relative min-h-[56vh] flex items-end overflow-hidden bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-[140px]" />
            <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-blue-600/10 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 sm:pt-32 lg:pt-40 lg:pb-20 w-full">
            <FadeUpSection>
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.28em] mb-4">
                For HVAC Installers &amp; Contractors
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[3.25rem] text-white leading-tight max-w-3xl mb-3">
                HVAC Trade Accounts for Installers &amp; Contractors in Malta
              </h1>
              <p className="text-amber-400 italic text-xl sm:text-2xl mb-5">Exclusive Trade Pricing</p>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                Join our Trade Programme to access installer pricing, priority quotations, dedicated account support and a wide range of professional HVAC products from leading manufacturers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/trade/register">
                  <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-lg shadow-amber-500/20">
                    Apply for Trade Account <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" className="gap-2 border border-white/20 bg-transparent text-white hover:bg-white/[0.08] cursor-pointer">
                    <LogIn className="w-4 h-4" /> Trade Login
                  </Button>
                </Link>
              </div>
              <TrustBadges set="trade" variant="dark" />
            </FadeUpSection>
          </div>
        </section>

        {/* ── Stats / Why installers choose us ── */}
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <AnimatedSection className="mb-14">
              <FadeUp>
                <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-[0.22em] mb-3">Our Trade Network</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight max-w-2xl">
                  Why Installers in Malta Choose Us
                </h2>
              </FadeUp>
            </AnimatedSection>

            {/* Stats row */}
            <AnimatedSection className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-14" staggerChildren={0.08}>
              {STATS.map(({ value, label, sub }) => (
                <FadeUp key={label}>
                  <div className="text-center p-7 rounded-2xl bg-slate-950 text-white">
                    <p className="font-display text-4xl font-black text-amber-400 mb-1">{value}</p>
                    <p className="font-semibold text-base text-white mb-1">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>

            {/* Why choose cards */}
            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerChildren={0.07}>
              {WHY_CHOOSE.map(({ label, desc }) => (
                <FadeUp key={label}>
                  <div className="h-full flex flex-col gap-3 p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1" aria-hidden="true" />
                    <p className="font-bold text-slate-900 text-[15px]">{label}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Commercial imagery ── */}
        <section className="bg-white pb-14 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FadeUpSection className="lg:col-span-2 aspect-[4/3]">
                <PremiumImage
                  src={null}
                  alt="HVAC trade warehouse with shelving of air conditioning equipment and stock"
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  containerClassName="w-full h-full"
                  rounded="2xl"
                  shadow
                  hoverZoom
                  placeholderLabel="Add warehouse / stock photo via Admin → Trade"
                  placeholderIcon={<Package className="w-5 h-5 text-slate-400" aria-hidden="true" />}
                />
              </FadeUpSection>
              <FadeUpSection className="aspect-[4/3]">
                <PremiumImage
                  src={null}
                  alt="Professional HVAC installer working on a commercial air conditioning system in Malta"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  containerClassName="w-full h-full"
                  rounded="2xl"
                  shadow
                  hoverZoom
                  placeholderLabel="Add installer photo via Admin → Trade"
                />
              </FadeUpSection>
              <FadeUpSection className="aspect-[4/3]">
                <PremiumImage
                  src={null}
                  alt="Trade counter with HVAC products and installation materials available for professional buyers"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  containerClassName="w-full h-full"
                  rounded="2xl"
                  shadow
                  hoverZoom
                  placeholderLabel="Add trade counter photo via Admin → Trade"
                />
              </FadeUpSection>
            </div>
          </div>
        </section>

        {/* ── Benefits grid ── */}
        <section className="py-14 lg:py-20 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-12">
              <FadeUp>
                <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-[0.22em] mb-3">Trade Benefits</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight">Why Join Our Trade Programme?</h2>
              </FadeUp>
            </AnimatedSection>

            <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerChildren={0.07}>
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <FadeUp key={title}>
                  <div className="h-full flex flex-col p-7 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.12)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-[15px] mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed flex-1">{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Eligibility + Application ── */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">

              {/* Who can apply */}
              <div>
                <AnimatedSection staggerChildren={0.07}>
                  <FadeUp>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Eligibility</p>
                  </FadeUp>
                  <FadeUp>
                    <h2 className="font-display text-3xl text-slate-900 mb-8 leading-tight">Who Can Apply for a Trade Account?</h2>
                  </FadeUp>
                  <FadeUp>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {ELIGIBLE.map(e => (
                        <div key={e} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
                          <span className="text-[15px] text-slate-700">{e}</span>
                        </div>
                      ))}
                    </div>
                  </FadeUp>
                  <FadeUp>
                    <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-100 pt-5">
                      Applications reviewed within 2 business days. A valid Malta VAT number or business registration is required.
                    </p>
                  </FadeUp>
                </AnimatedSection>
              </div>

              {/* How it works card */}
              <FadeUpSection delay={0.1}>
                <div className="bg-slate-950 rounded-2xl p-8 lg:p-10">
                  <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.22em] mb-3">Application Process</p>
                  <h3 className="font-display text-2xl text-white mb-3 leading-tight">How It Works</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    The application takes under 5 minutes. Once approved, trade pricing is activated immediately on your account.
                  </p>

                  <div className="space-y-5 mb-8">
                    {[
                      { n: '01', t: 'Complete the online application', d: 'Business details and VAT or company registration number' },
                      { n: '02', t: 'Business verification',           d: 'Our team confirms your business details within 2 days' },
                      { n: '03', t: 'Approval within two business days', d: 'You\'ll receive confirmation by email once approved' },
                      { n: '04', t: 'Access exclusive trade pricing',  d: 'Trade prices displayed across the site on your account' },
                    ].map(({ n, t, d }) => (
                      <div key={n} className="flex items-start gap-4">
                        <span className="font-display text-2xl font-black text-white/[0.12] leading-none w-7 shrink-0" aria-hidden="true">{n}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{t}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href="/trade/register" className="block">
                      <Button size="lg" className="w-full gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer">
                        Apply for Trade Account <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/login" className="block">
                      <Button size="lg" variant="outline" className="w-full gap-2 border-white/15 text-white hover:bg-white/[0.08] cursor-pointer">
                        <LogIn className="w-4 h-4" /> Trade Login
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-5 flex items-center gap-2 pt-5 border-t border-white/[0.07]">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                    <span className="text-xs text-slate-500">Questions? Call us on{' '}
                      <a href="tel:+35679661889" className="text-slate-300 hover:text-white transition-colors">+356 7966 1889</a>
                    </span>
                  </div>
                </div>
              </FadeUpSection>
            </div>
          </div>
        </section>

        {/* ── Internal links ── */}
        <section className="bg-[#FAFAF9] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <InternalLinkPanel
                heading="Explore more"
                links={[
                  { label: 'Browse Products', description: 'Shop our full range of HVAC equipment, air conditioners, heat pumps and refrigeration from leading brands.', href: '/products', cta: 'Browse All Products' },
                  { label: 'HVAC Services', description: 'Need a certified installation, service or repair? Our F-Gas certified engineers cover all Malta.', href: '/services', cta: 'View Services' },
                  { label: 'Contact Our Team', description: 'Have a question about trade pricing, stock availability or a project quotation? Get in touch.', href: '/contact', cta: 'Speak to Our Team' },
                ]}
              />
            </FadeUpSection>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14 lg:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-10">
              <FadeUp>
                <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-[0.22em] mb-3 text-center">Common Questions</p>
              </FadeUp>
              <FadeUp>
                <h2 className="font-display text-2xl sm:text-3xl text-slate-900 leading-snug text-center">
                  Frequently Asked Questions About Trade Accounts
                </h2>
              </FadeUp>
            </AnimatedSection>
            <AnimatedSection className="space-y-4" staggerChildren={0.07}>
              {TRADE_FAQS.map(({ q, a }) => (
                <FadeUp key={q}>
                  <div className="bg-[#FAFAF9] rounded-xl border border-slate-100 p-6 hover:border-amber-100 transition-colors duration-200">
                    <p className="font-semibold text-slate-900 text-sm mb-2">{q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
                </FadeUp>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-16 lg:py-20 bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeUpSection>
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.28em] mb-4">Join Our Trade Network</p>
              <h2 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-5">
                Ready to Become a Trade Partner?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
                Join Malta&apos;s growing network of HVAC professionals who rely on THE AIRCONDITION SHOP for premium products, competitive pricing and dependable support.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/trade/register">
                  <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-lg shadow-amber-500/25">
                    Apply for Trade Account <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" className="gap-2 border border-white/20 bg-transparent text-white hover:bg-white/[0.08] cursor-pointer">
                    Contact Trade Team
                  </Button>
                </Link>
              </div>
            </FadeUpSection>
          </div>
        </section>

        {/* ── SEO footer ── */}
        <section className="bg-slate-50 py-12 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUpSection>
              <h2 className="font-display text-xl text-slate-800 mb-4">HVAC Trade Accounts in Malta</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                THE AIRCONDITION SHOP operates a dedicated Trade Programme for registered HVAC installers, refrigeration engineers, mechanical contractors and commercial buyers across Malta. Trade account holders benefit from installer pricing, priority stock allocation, fast project quotations and direct technical support from our experienced team.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                We are an authorised stockist for Daikin, Gree, Fujitsu and other leading HVAC manufacturers. Our trade stock includes split systems, multi-split systems, VRF units, commercial refrigeration equipment and a full range of HVAC installation materials. <Link href="/trade/register" className="text-blue-600 hover:underline">Apply for a trade account</Link> or <Link href="/contact" className="text-blue-600 hover:underline">contact our trade team</Link> for more information.
              </p>
            </FadeUpSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
