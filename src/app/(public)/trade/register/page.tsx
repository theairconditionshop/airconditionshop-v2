import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import TradeRegisterForm from './trade-register-form'
import { getProfile } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  Clock, CheckCircle2, XCircle, PauseCircle, ArrowRight, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Trade Account Application',
  description: 'Apply for a trade account to unlock exclusive pricing and benefits.',
  alternates: { canonical: 'https://theairconditionshop.com/trade/register' },
}

// ─── Status gate shown instead of the form ───────────────────────────────────

function StatusCard({
  icon, iconBg, badge, badgeBg, badgeFg,
  heading, body, primary, primaryHref,
  secondary, secondaryHref,
}: {
  icon: React.ReactNode
  iconBg: string
  badge: string; badgeBg: string; badgeFg: string
  heading: string; body: string
  primary: string; primaryHref: string
  secondary?: string; secondaryHref?: string
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto py-4">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${iconBg}`}>
        {icon}
      </div>
      <span
        className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
        style={{ backgroundColor: badgeBg, color: badgeFg }}
      >
        {badge}
      </span>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">{heading}</h2>
      <p className="text-slate-500 leading-relaxed mb-8 text-sm">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link href={primaryHref}>
          <Button variant="brand" size="lg" className="w-full sm:w-auto gap-2">
            {primary} <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        {secondary && secondaryHref && (
          <Link href={secondaryHref}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Phone className="w-4 h-4" /> {secondary}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TradeRegisterPage() {
  const profile = await getProfile()

  // Approved → send straight to dashboard
  if (profile?.role === 'trade' && profile.trade_status === 'approved') {
    redirect('/trade/dashboard')
  }

  // Pending — fetch application date for display
  let applicationDate: string | null = null
  let companyName: string | null = null

  if (profile?.role === 'trade' && profile.trade_status === 'pending') {
    const db = createAdminClient()
    const { data } = await db
      .from('trade_applications')
      .select('created_at, company_name')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    applicationDate = data?.created_at ? new Date(data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
    companyName = data?.company_name ?? null
  }

  const showPending   = profile?.role === 'trade' && profile.trade_status === 'pending'
  const showSuspended = profile?.role === 'trade' && profile.trade_status === 'suspended'

  function gateContent() {
    if (showPending) {
      return (
        <StatusCard
          icon={<Clock className="w-8 h-8 text-amber-500" />}
          iconBg="bg-amber-50 border border-amber-100"
          badge="Pending Review"
          badgeBg="#FEF3C7"
          badgeFg="#92400E"
          heading="Your application is under review"
          body={`Our team is currently reviewing your application${companyName ? ` for ${companyName}` : ''}. You do not need to submit another one. We will notify you by email once a decision has been made — normally within 1–2 business days.${applicationDate ? `\n\nApplied: ${applicationDate}` : ''}`}
          primary="Browse Products"
          primaryHref="/products"
          secondary="Contact Support"
          secondaryHref="/contact"
        />
      )
    }
    if (showSuspended) {
      return (
        <StatusCard
          icon={<PauseCircle className="w-8 h-8 text-slate-500" />}
          iconBg="bg-slate-100 border border-slate-200"
          badge="Account Suspended"
          badgeBg="#F1F5F9"
          badgeFg="#475569"
          heading="Your account is currently suspended"
          body="Access to trade pricing and your trade dashboard has been temporarily suspended. Please contact our support team to discuss your account and resolve any outstanding issues."
          primary="Contact Support"
          primaryHref="/contact"
          secondary="Browse Products"
          secondaryHref="/products"
        />
      )
    }
    return null
  }

  const gate = gateContent()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">

          {gate ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
              {gate}
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Trade Programme</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Trade Account Application</h1>
                <p className="mt-3 text-slate-500">Applications are reviewed within 1–2 business days.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <TradeRegisterForm />
              </div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
