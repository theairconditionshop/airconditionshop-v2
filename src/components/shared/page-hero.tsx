import Link from 'next/link'
import Breadcrumb from '@/components/shared/breadcrumb'
import { Reveal, Magnetic } from '@/components/motion/primitives'
import { ArrowRight } from 'lucide-react'
import type { PageHeroData } from '@/lib/data/page-hero-cache'

interface Crumb { label: string; href?: string }

interface PageHeroProps {
  hero: PageHeroData
  /** Fallback title/subtitle used when the CMS record has no text yet (keeps old copy live before an admin fills the CMS in) */
  fallbackTitle?: string
  fallbackSubtitle?: string
  crumbs?: Crumb[]
  eyebrow?: string
  className?: string
}

/**
 * Reusable, CMS-driven hero for any non-homepage page. Renders three
 * independent image slots (desktop/tablet/mobile) via <picture> — if
 * tablet or mobile aren't uploaded, they fall back to the desktop image
 * so the layout never breaks. Falls back to a plain text hero (no image)
 * when no images have been uploaded at all.
 */
export function PageHero({ hero, fallbackTitle, fallbackSubtitle, crumbs, eyebrow, className = '' }: PageHeroProps) {
  const title = hero.title || fallbackTitle || ''
  const subtitle = hero.subtitle || fallbackSubtitle || ''
  const hasImage = !!(hero.desktopImageUrl || hero.tabletImageUrl || hero.mobileImageUrl)

  const desktopSrc = hero.desktopImageUrl
  const tabletSrc = hero.tabletImageUrl || desktopSrc
  const mobileSrc = hero.mobileImageUrl || desktopSrc

  return (
    <section className={`relative min-h-[46vh] flex items-end overflow-hidden bg-[#f4f8fb] pt-24 ${className}`}>
      {hasImage && (
        <picture className="absolute inset-0 z-0">
          {mobileSrc && <source media="(max-width: 767px)" srcSet={mobileSrc} />}
          {tabletSrc && <source media="(max-width: 1279px)" srcSet={tabletSrc} />}
          {desktopSrc && <source media="(min-width: 1280px)" srcSet={desktopSrc} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktopSrc || tabletSrc || mobileSrc || ''}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </picture>
      )}
      {hasImage && (
        <div
          aria-hidden
          className="absolute inset-0 z-[1] bg-slate-950"
          style={{ opacity: hero.overlayOpacity }}
        />
      )}
      {!hasImage && (
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumb crumbs={crumbs} />
          </div>
        )}
        {eyebrow && (
          <Reveal mode="up">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] mb-5 ${hasImage ? 'text-blue-300' : 'text-blue-600'}`}>{eyebrow}</p>
          </Reveal>
        )}
        {title && (
          <Reveal mode="blur" delay={0.05}>
            <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.0] max-w-2xl mb-4 ${hasImage ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h1>
          </Reveal>
        )}
        {subtitle && (
          <Reveal mode="up" delay={0.1}>
            <p className={`text-lg max-w-xl leading-relaxed ${hasImage ? 'text-slate-200' : 'text-slate-600'}`}>
              {subtitle}
            </p>
          </Reveal>
        )}
        {hero.ctaLabel && hero.ctaHref && (
          <Reveal mode="up" delay={0.15} className="mt-8">
            <Magnetic strength={0.2}>
              <Link
                href={hero.ctaHref}
                className={`group inline-flex items-center justify-center gap-2 px-7 h-14 text-[15px] font-semibold transition-colors duration-300 ${hasImage ? 'bg-white text-slate-900 hover:bg-blue-50' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                style={{ borderRadius: 2 }}
              >
                {hero.ctaLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Magnetic>
          </Reveal>
        )}
      </div>
    </section>
  )
}
