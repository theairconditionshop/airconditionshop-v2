import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Calendar, ChevronRight, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import type { Campaign, CampaignType } from '@/types/database'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Campaigns & Competitions — The AirCondition Shop Malta',
  description: 'Enter our latest competitions and promotions. Win premium air conditioners and HVAC equipment.',
  alternates: { canonical: 'https://www.theairconditionshop.com/campaigns' },
}

const TYPE_LABELS: Record<CampaignType, string> = {
  competition:          'Competition',
  giveaway:             'Giveaway',
  seasonal_promotion:   'Seasonal Promotion',
  world_cup_promotion:  'World Cup Promotion',
  referral:             'Referral Campaign',
  discount:             'Discount Campaign',
  free_installation:    'Free Installation',
  trade:                'Trade Campaign',
  product_launch:       'Product Launch',
}

const TYPE_COLORS: Partial<Record<CampaignType, string>> = {
  competition:         'bg-blue-500/20 text-blue-300 border-blue-500/30',
  giveaway:            'bg-purple-500/20 text-purple-300 border-purple-500/30',
  seasonal_promotion:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  world_cup_promotion: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  free_installation:   'bg-sky-500/20 text-sky-300 border-sky-500/30',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-MT', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .in('status', ['active', 'ended'])
    .order('featured', { ascending: false })
    .order('start_date', { ascending: false })

  const campaigns = (data ?? []) as Campaign[]
  const active  = campaigns.filter(c => c.status === 'active')
  const ended   = campaigns.filter(c => c.status === 'ended')

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-24 px-4">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-6">
              <Zap className="w-3 h-3" /> Campaigns & Competitions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              Win Premium<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Air Conditioning</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Enter our latest competitions and promotions to win world-class HVAC equipment for your home or business.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {campaigns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">No Active Campaigns</h2>
              <p className="text-slate-500">Check back soon for new competitions and promotions.</p>
            </div>
          ) : (
            <>
              {/* Active */}
              {active.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Active Campaigns
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
                  </div>
                </div>
              )}

              {/* Ended */}
              {ended.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-500 mb-6">Past Campaigns</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-75">
                    {ended.map(c => <CampaignCard key={c.id} campaign={c} ended />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function CampaignCard({ campaign: c, ended = false }: { campaign: Campaign; ended?: boolean }) {
  const typeColor = TYPE_COLORS[c.campaign_type] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  const endDate = c.end_date ? formatDate(c.end_date) : null

  return (
    <Link href={`/campaigns/${c.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-slate-900 to-blue-900 overflow-hidden">
        {c.hero_image ? (
          <Image src={c.hero_image} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-blue-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${typeColor}`}>
            {TYPE_LABELS[c.campaign_type]}
          </span>
          {c.featured && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>
        {!ended && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-blue-600 transition-colors">
          {c.title}
        </h3>
        {c.short_description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{c.short_description}</p>
        )}

        {c.prize && (
          <div className="flex items-center gap-2 mb-3 py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-100">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm font-semibold text-amber-700 truncate">{c.prize}</span>
            {c.prize_value && (
              <span className="ml-auto text-xs font-bold text-amber-500 shrink-0">
                €{c.prize_value.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {endDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <Calendar className="w-3.5 h-3.5" />
            {ended ? `Ended ${endDate}` : `Ends ${endDate}`}
          </div>
        )}

        <div className="mt-auto">
          <div className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            ended
              ? 'bg-slate-100 text-slate-500'
              : 'bg-blue-600 text-white group-hover:bg-blue-700'
          }`}>
            {ended ? 'View Campaign' : 'Enter Now'}
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
