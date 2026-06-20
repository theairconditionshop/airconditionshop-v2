import Link from 'next/link'
import type { Campaign, CampaignType } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEndDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-MT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function typeLabel(type: CampaignType): string {
  const map: Record<CampaignType, string> = {
    competition:         'Competition',
    giveaway:            'Giveaway',
    seasonal_promotion:  'Seasonal Promo',
    world_cup_promotion: 'World Cup Promo',
    referral:            'Referral',
    discount:            'Discount',
    free_installation:   'Free Install',
    trade:               'Trade Offer',
    product_launch:      'New Launch',
  }
  return map[type] ?? type
}

function typeBadgeColor(type: CampaignType): string {
  const map: Record<CampaignType, string> = {
    competition:         'bg-amber-500 text-black',
    giveaway:            'bg-emerald-500 text-white',
    seasonal_promotion:  'bg-sky-500 text-white',
    world_cup_promotion: 'bg-green-600 text-white',
    referral:            'bg-violet-500 text-white',
    discount:            'bg-rose-500 text-white',
    free_installation:   'bg-cyan-600 text-white',
    trade:               'bg-orange-500 text-white',
    product_launch:      'bg-indigo-500 text-white',
  }
  return map[type] ?? 'bg-slate-600 text-white'
}

// ── Single hero card (1 campaign) ────────────────────────────────────────────

function HeroCard({ campaign }: { campaign: Campaign }) {
  const endLabel = formatEndDate(campaign.end_date)

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group relative flex min-h-[420px] w-full flex-col justify-end overflow-hidden rounded-2xl md:min-h-[520px]"
    >
      {/* Background image or gradient */}
      {campaign.hero_image ? (
        <img
          src={campaign.hero_image}
          alt={campaign.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Countdown / urgency strip */}
      {campaign.end_date && (
        <div className="absolute left-0 right-0 top-0 flex items-center justify-center gap-2 bg-amber-500/90 py-2 text-sm font-semibold text-black backdrop-blur-sm">
          <span className="animate-pulse">⏳</span>
          Ends {endLabel} — Don&apos;t miss out!
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10">
        {/* Badge */}
        <span
          className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${typeBadgeColor(campaign.campaign_type)}`}
        >
          {typeLabel(campaign.campaign_type)}
        </span>

        <h3 className="mb-3 text-3xl font-black leading-tight text-white drop-shadow-lg md:text-5xl">
          {campaign.title}
        </h3>

        {campaign.short_description && (
          <p className="mb-4 max-w-xl text-base text-slate-200 md:text-lg">
            {campaign.short_description}
          </p>
        )}

        {campaign.prize && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 backdrop-blur-sm">
            <span className="text-amber-300 text-sm font-semibold uppercase tracking-wide">Prize</span>
            <span className="text-white font-bold">{campaign.prize}</span>
          </div>
        )}

        <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-lg transition-all duration-200 group-hover:bg-amber-400 group-hover:shadow-amber-400/30 group-hover:shadow-xl">
          Enter Now
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

// ── Grid card (multiple campaigns) ───────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const endLabel = formatEndDate(campaign.end_date)

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl"
    >
      {campaign.hero_image ? (
        <img
          src={campaign.hero_image}
          alt={campaign.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-800" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <div className="relative z-10 p-5">
        <span
          className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${typeBadgeColor(campaign.campaign_type)}`}
        >
          {typeLabel(campaign.campaign_type)}
        </span>

        <h4 className="mb-2 text-xl font-black leading-snug text-white">
          {campaign.title}
        </h4>

        {campaign.short_description && (
          <p className="mb-3 line-clamp-2 text-sm text-slate-300">
            {campaign.short_description}
          </p>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {campaign.prize && (
            <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-400/25">
              🏆 {campaign.prize}
            </span>
          )}
          {endLabel && (
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-slate-300 backdrop-blur-sm">
              Ends {endLabel}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-black shadow transition-all duration-200 group-hover:bg-amber-400 group-hover:shadow-amber-400/30">
          Enter Now
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface CampaignBannerProps {
  campaigns: Campaign[]
}

export default function CampaignBanner({ campaigns }: CampaignBannerProps) {
  if (!campaigns.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Section heading */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Limited Time
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">
            Current Campaigns &amp; Competitions
          </h2>
        </div>
        {campaigns.length > 1 && (
          <Link
            href="/campaigns"
            className="hidden text-sm font-semibold text-slate-400 underline-offset-4 hover:text-white hover:underline sm:inline"
          >
            View all
          </Link>
        )}
      </div>

      {campaigns.length === 1 ? (
        <HeroCard campaign={campaigns[0]} />
      ) : (
        <>
          {/* Desktop grid — up to 3 columns */}
          <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>

          {/* Mobile horizontal scroll */}
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:hidden">
            {campaigns.slice(0, 3).map((c) => (
              <div key={c.id} className="w-[82vw] flex-none">
                <CampaignCard campaign={c} />
              </div>
            ))}
          </div>

          {campaigns.length > 1 && (
            <div className="mt-4 text-center sm:hidden">
              <Link
                href="/campaigns"
                className="text-sm font-semibold text-slate-400 underline-offset-4 hover:text-white hover:underline"
              >
                View all campaigns
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}
