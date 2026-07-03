'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Tag, Zap, Headphones, ArrowRight } from 'lucide-react'
import { Reveal, Stagger, StaggerItem, Magnetic } from '@/components/motion/primitives'

interface TradeCtaData {
  image_url?: string
}

const FEATURES = [
  { icon: Tag,        title: 'Trade Pricing',        body: 'Competitive trade rates on air conditioners, heat pumps, refrigeration equipment and installation materials — for approved account holders.' },
  { icon: Zap,        title: 'Fast Project Quotes',  body: 'Submit a project spec and receive a quote quickly. We support jobs of every size, from a single domestic unit to full commercial fit-outs.' },
  { icon: Headphones, title: 'Technical Support',    body: 'Direct access to our team for product selection, spec queries, warranty claims and after-sales assistance on every brand we supply.' },
]

/** Corner bracket — a recurring "technical drawing" motif for this section only. */
function Bracket({ className }: { className: string }) {
  return <span aria-hidden className={`absolute w-4 h-4 border-amber-500/40 ${className}`} />
}

export default function TradeCta({ data = {} }: { data?: TradeCtaData }) {
  const imageUrl = data.image_url?.trim() || null

  return (
    <section className="relative bg-slate-950 py-20 lg:py-28 text-white overflow-hidden">
      {/* Technical grid texture — this section's signature motif */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div aria-hidden className="absolute -top-40 right-[-8%] w-[560px] h-[560px] rounded-full bg-amber-500/[0.06] blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Mobile image */}
        {imageUrl && (
          <Reveal mode="fade" className="lg:hidden mb-10 relative aspect-[16/9] overflow-hidden">
            <Image src={imageUrl} alt="Professional HVAC installer at work" fill sizes="100vw" className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-950/70 backdrop-blur-sm border border-white/10 px-3 py-2" style={{ borderRadius: 2 }}>
              <span className="w-1.5 h-1.5 bg-amber-400 shrink-0" style={{ borderRadius: 1 }} />
              <span className="text-[11px] text-slate-300 font-medium">F-Gas Certified · Manufacturer Approved</span>
            </div>
          </Reveal>
        )}

        <div className={imageUrl ? 'lg:grid lg:grid-cols-[1fr_380px] lg:gap-14 lg:items-stretch' : ''}>

          {/* Left — content */}
          <div>
            <Reveal mode="up">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">
                For HVAC Installers &amp; Contractors
              </p>
            </Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Reveal mode="blur" delay={0.05}>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.98] tracking-[-0.02em] text-white max-w-lg">
                  Built for the trade.
                </h2>
              </Reveal>
              <Reveal mode="up" delay={0.12}>
                <p className="max-w-sm text-base leading-relaxed text-slate-400 lg:text-right">
                  If you install air conditioning, refrigeration or ventilation systems in Malta, we&apos;d like to work with you.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 h-px bg-white/10" />

            {/* Feature grid — technical bracket cells */}
            <Stagger className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3" gap={0.1}>
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <StaggerItem key={title}>
                  <div className="group relative pl-5 pt-4 pb-4">
                    <Bracket className="top-0 left-0 border-t border-l" />
                    <Bracket className="bottom-0 left-0 border-b border-l opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex h-11 w-11 items-center justify-center border border-amber-500/25 group-hover:border-amber-500 group-hover:bg-amber-500 transition-colors duration-300 mb-5" style={{ borderRadius: 2 }}>
                      <Icon className="h-4.5 w-4.5 text-amber-500 group-hover:text-slate-950 transition-colors duration-300" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal mode="up" delay={0.1} className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Magnetic strength={0.2}>
                <Link
                  href="/trade/register"
                  className="inline-flex items-center gap-2 bg-amber-500 px-7 h-14 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors duration-300"
                  style={{ borderRadius: 2 }}
                >
                  Apply for a Trade Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-white/20 px-7 h-14 text-sm font-semibold text-white hover:bg-white/5 hover:border-white/40 transition-colors duration-300"
                style={{ borderRadius: 2 }}
              >
                Trade Login
              </Link>
            </Reveal>

            <p className="mt-6 text-xs text-slate-600">
              Applications reviewed within 2 business days · Malta VAT number required
            </p>
          </div>

          {/* Right — installer image */}
          {imageUrl && (
            <Reveal mode="scale" delay={0.1} className="hidden lg:flex">
              <div className="relative h-full min-h-[440px] w-full overflow-hidden">
                <Image src={imageUrl} alt="Professional HVAC installer at work" fill sizes="380px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950/20" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-white/10 px-4 py-3" style={{ borderRadius: 2 }}>
                  <span className="w-1.5 h-1.5 bg-amber-400 shrink-0" style={{ borderRadius: 1 }} />
                  <span className="text-[12px] text-slate-300 font-medium">F-Gas Certified · Manufacturer Approved</span>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
