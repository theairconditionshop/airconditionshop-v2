import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Calendar, Phone, Share2, Users, Copy, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import type { Campaign, CampaignType } from '@/types/database'
import CampaignCountdownSection from './countdown-section'
import CampaignShareButtons from './share-buttons'
import CampaignViewTracker from './view-tracker'

export const revalidate = 60

interface Props { params: Promise<{ slug: string }> }

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

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-MT', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase  = await createClient()
  const { data }  = await supabase.from('campaigns').select('title,short_description,seo_title,seo_description,hero_image').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: data.seo_title || data.title,
    description: data.seo_description || data.short_description || undefined,
    openGraph: data.hero_image ? { images: [{ url: data.hero_image }] } : undefined,
  }
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug }  = await params
  const supabase  = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .in('status', ['active', 'ended', 'scheduled'])
    .single()

  if (!campaign) notFound()
  const c = campaign as Campaign

  const isActive = c.status === 'active'
  const isEnded  = c.status === 'ended'

  const { data: related } = await supabase
    .from('campaigns')
    .select('id,title,slug,hero_image,campaign_type,status,short_description')
    .eq('status', 'active')
    .neq('id', c.id)
    .limit(3)

  const steps: string[] = Array.isArray(c.how_to_enter) ? c.how_to_enter : []

  return (
    <>
      <Navbar />
      <CampaignViewTracker campaignId={c.id} />

      <main id="main-content" className="min-h-screen">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
          {c.hero_image ? (
            <Image src={c.hero_image} alt={c.title} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/20" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
              {TYPE_LABELS[c.campaign_type]}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
              {c.title}
            </h1>
            {c.short_description && (
              <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                {c.short_description}
              </p>
            )}
            {isActive && (
              <Link href="#enter"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all duration-200 hover:scale-105 shadow-2xl shadow-blue-900/50">
                Enter Now <ChevronRight className="w-5 h-5" />
              </Link>
            )}
            {isEnded && (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/80 text-slate-400 font-semibold border border-slate-700">
                This Campaign Has Ended
              </div>
            )}
          </div>
        </section>

        {/* ── COUNTDOWN ─────────────────────────────────────────────────── */}
        {isActive && c.end_date && (
          <section className="bg-slate-950 border-y border-slate-800 py-12 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase mb-8">Time Remaining</p>
              <CampaignCountdownSection endDate={c.end_date} />
            </div>
          </section>
        )}

        {/* ── PRIZE ─────────────────────────────────────────────────────── */}
        {c.prize && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 mb-6">
                <Trophy className="w-10 h-10 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 tracking-[0.3em] uppercase mb-3">The Prize</p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-3">{c.prize}</h2>
              {c.prize_value && (
                <p className="text-2xl font-bold text-amber-500">
                  Valued at €{c.prize_value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── HOW TO ENTER ──────────────────────────────────────────────── */}
        {steps.length > 0 && (
          <section id="enter" className="py-20 px-4 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold text-slate-400 tracking-[0.3em] uppercase mb-3">Participation</p>
                <h2 className="text-3xl font-black text-slate-900">How To Enter</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <div key={i} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              {isActive && (
                <div className="text-center mt-10">
                  <a href="tel:+35679661889"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-200">
                    <Phone className="w-4 h-4" /> Contact Us To Enter
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── ELIGIBILITY + RULES ───────────────────────────────────────── */}
        {(c.eligibility || c.rules) && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-6">
                {c.eligibility && (
                  <div className="bg-slate-50 rounded-3xl p-7 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">Eligibility</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm">{c.eligibility}</p>
                  </div>
                )}
                {c.rules && (
                  <div className="bg-slate-50 rounded-3xl p-7 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Copy className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">Rules</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{c.rules}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── TERMS & CONDITIONS ────────────────────────────────────────── */}
        {c.terms_and_conditions && (
          <section className="py-12 px-4 bg-slate-50 border-t border-slate-100">
            <div className="max-w-3xl mx-auto">
              <details className="group">
                <summary className="cursor-pointer flex items-center justify-between py-3 font-semibold text-slate-600 text-sm list-none">
                  Terms & Conditions
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="pt-4 pb-2">
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{c.terms_and_conditions}</p>
                </div>
              </details>
            </div>
          </section>
        )}

        {/* ── SHARE & DATES ─────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-slate-950">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Share2 className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 font-semibold">Share this campaign</span>
            </div>
            <CampaignShareButtons title={c.title} />
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              {c.start_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Starts {formatDate(c.start_date)}
                </div>
              )}
              {c.end_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {isEnded ? 'Ended' : 'Ends'} {formatDate(c.end_date)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── CONTACT CTA ───────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-blue-600">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-white mb-2">Questions?</h2>
            <p className="text-blue-100 mb-6">Our team is happy to help with any questions about this campaign.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+35679661889"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors">
                <Phone className="w-4 h-4" /> +356 7966 1889
              </a>
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors border border-blue-500">
                Send a Message
              </Link>
            </div>
          </div>
        </section>

        {/* ── RELATED CAMPAIGNS ─────────────────────────────────────────── */}
        {related && related.length > 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Other Campaigns</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {(related as Partial<Campaign>[]).map(r => (
                  <Link key={r.id} href={`/campaigns/${r.slug}`}
                    className="group rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <div className="relative h-36 bg-gradient-to-br from-slate-900 to-blue-900">
                      {r.hero_image && (
                        <Image src={r.hero_image} alt={r.title ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">
                        {r.campaign_type ? TYPE_LABELS[r.campaign_type as CampaignType] : ''}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 group-hover:text-blue-600 transition-colors">{r.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
