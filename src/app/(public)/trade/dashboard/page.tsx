import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { getSession, getProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  Package, FileText, LifeBuoy, CheckCircle2, Clock, XCircle, ShieldOff,
  Building2, Phone, Mail, User, CreditCard, Hash, MapPin, Briefcase,
  Calendar, LogIn, ArrowRight,
} from 'lucide-react'
import type { TradeStatus } from '@/types/database'

export const metadata: Metadata = {
  title: 'Trade Dashboard',
  robots: { index: false, follow: false },
}

const STATUS_CONFIG: Record<TradeStatus, { label: string; bg: string; text: string; dot: string; Icon: React.ElementType }> = {
  approved:  { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  Icon: CheckCircle2 },
  pending:   { label: 'Pending',   bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  Icon: Clock        },
  rejected:  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    Icon: XCircle      },
  suspended: { label: 'Suspended', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', Icon: ShieldOff    },
}

type TradeApplication = {
  vat_number:            string | null
  registration_number:   string | null
  identification_type:   string | null
  identification_number: string | null
  business_type:         string | null
  address:               string | null
  postal_code:           string | null
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      {Icon && (
        <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default async function TradeDashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile || profile.role !== 'trade' || profile.trade_status !== 'approved') {
    redirect('/trade')
  }

  const db = await createClient()

  const { data: application } = await db
    .from('trade_applications')
    .select('vat_number, registration_number, identification_type, identification_number, business_type, address, postal_code')
    .eq('user_id', user.id)
    .maybeSingle() as { data: TradeApplication | null }

  const statusConfig = STATUS_CONFIG[profile.trade_status as TradeStatus] ?? STATUS_CONFIG.pending
  const StatusIcon = statusConfig.Icon

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const lastLogin = profile.last_login_at
    ? new Date(profile.last_login_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const fullAddress = [application?.address, application?.postal_code].filter(Boolean).join(', ')

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 lg:pt-[68px] bg-slate-50">

        {/* ── Welcome Banner ─────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-[0.22em] mb-1">Trade Portal</p>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
                </h1>
                <p className="text-slate-500 mt-1 text-sm">{profile.company || user.email}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  <StatusIcon className="w-3 h-3" aria-hidden="true" />
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ── Quick Actions ──────────────────────────────────────────── */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/products"
              className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">View Products</p>
                <p className="text-xs text-slate-500">Trade prices applied</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              href="/quote"
              className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">Request a Quote</p>
                <p className="text-xs text-slate-500">Project or bulk orders</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              href="/contact"
              className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <LifeBuoy className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">Contact Support</p>
                <p className="text-xs text-slate-500">Dedicated trade line</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>

          {/* ── Account Overview + Business Details ───────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Account info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Account Information</h2>
                <Link
                  href="/trade/profile"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View profile →
                </Link>
              </div>
              <InfoRow label="Full Name"    value={profile.full_name}  icon={User}     />
              <InfoRow label="Company"      value={profile.company}    icon={Building2} />
              <InfoRow label="Email"        value={profile.email}      icon={Mail}     />
              <InfoRow label="Phone"        value={profile.phone}      icon={Phone}    />
              <InfoRow label="Member Since" value={memberSince}        icon={Calendar} />
              {lastLogin && (
                <InfoRow label="Last Login" value={lastLogin}          icon={LogIn}    />
              )}
            </div>

            {/* Business details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-5">Business Details</h2>
              <InfoRow label="Business Type"      value={application?.business_type}         icon={Briefcase} />
              <InfoRow label="Identification"     value={application?.identification_type
                ? `${application.identification_type}: ${application.identification_number ?? ''}`
                : null}                                                                       icon={CreditCard} />
              <InfoRow label="VAT Number"         value={application?.vat_number}            icon={Hash}     />
              <InfoRow label="Registration Number" value={application?.registration_number}  icon={Hash}     />
              <InfoRow label="Business Address"   value={fullAddress || null}                icon={MapPin}   />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
