import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { getSession, getProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  CheckCircle2, Clock, XCircle, ShieldOff,
  Building2, Phone, Mail, User, CreditCard, Hash, MapPin,
  Briefcase, Calendar, LogIn, Lock, LayoutDashboard, ShieldCheck,
} from 'lucide-react'
import { PhoneEditForm, PasswordChangeForm } from './profile-forms'
import type { TradeStatus } from '@/types/database'

export const metadata: Metadata = {
  title: 'My Profile — Trade Account',
  robots: { index: false, follow: false },
}

const STATUS_CONFIG: Record<TradeStatus, { label: string; bg: string; text: string; dot: string; Icon: React.ElementType; desc: string }> = {
  approved:  { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  Icon: CheckCircle2, desc: 'Your trade account is active and trade prices are applied.'            },
  pending:   { label: 'Pending',   bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  Icon: Clock,        desc: 'Your application is under review. We will be in touch within 2 days.' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    Icon: XCircle,      desc: 'Your application was not approved. Contact us for more information.'   },
  suspended: { label: 'Suspended', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', Icon: ShieldOff,    desc: 'Your account has been suspended. Please contact our team.'             },
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

function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-50 last:border-0">
      {Icon && (
        <div className="mt-0.5 w-7 h-7 bg-slate-50 flex items-center justify-center shrink-0" style={{ borderRadius: 2 }}>
          <Icon className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

function EditableField({ label, icon: Icon, children }: {
  label: string; icon?: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-50 last:border-0">
      {Icon && (
        <div className="mt-0.5 w-7 h-7 bg-blue-50 flex items-center justify-center shrink-0" style={{ borderRadius: 2 }}>
          <Icon className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}

export default async function TradeProfilePage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile || profile.role !== 'trade') redirect('/')

  const db = await createClient()
  const { data: application } = await db
    .from('trade_applications')
    .select('vat_number, registration_number, identification_type, identification_number, business_type, address, postal_code')
    .eq('user_id', user.id)
    .maybeSingle() as { data: TradeApplication | null }

  const statusConfig = STATUS_CONFIG[profile.trade_status as TradeStatus] ?? STATUS_CONFIG.pending
  const StatusIcon   = statusConfig.Icon

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const lastLogin = profile.last_login_at
    ? new Date(profile.last_login_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const fullAddress = [application?.address, application?.postal_code].filter(Boolean).join(', ')
  const idValue = application?.identification_type && application?.identification_number
    ? `${application.identification_type}: ${application.identification_number}`
    : null

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16 lg:pt-[68px] bg-slate-50">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-1">
              <Link href="/trade/dashboard" className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" /> Dashboard
              </Link>
              <span className="text-slate-200">/</span>
              <span className="text-sm text-slate-600 font-medium">My Profile</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">My Profile</h1>
            <p className="text-slate-500 text-sm mt-1">
              View your trade account information. Phone and password can be updated below.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* ── Account status ───────────────────────────────────────────── */}
          <div className={`rounded-2xl border px-5 py-4 flex items-start gap-4 ${statusConfig.bg} border-current/10`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/60`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}>Account Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/60 ${statusConfig.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
              <p className={`text-sm ${statusConfig.text} opacity-90`}>{statusConfig.desc}</p>
            </div>
          </div>

          {/* ── Personal information ─────────────────────────────────────── */}
          <div className="bg-white border border-slate-100 overflow-hidden" style={{ borderRadius: 2 }}>
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <h2 className="font-semibold text-slate-900">Personal Information</h2>
            </div>
            <div className="px-6 pb-2">
              <ReadOnlyField label="Full Name" value={profile.full_name} icon={User}   />
              <ReadOnlyField label="Email"     value={profile.email}     icon={Mail}   />
              <EditableField label="Phone Number" icon={Phone}>
                <PhoneEditForm currentPhone={profile.phone} />
              </EditableField>
            </div>
          </div>

          {/* ── Business information ─────────────────────────────────────── */}
          <div className="bg-white border border-slate-100 overflow-hidden" style={{ borderRadius: 2 }}>
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <h2 className="font-semibold text-slate-900">Business Information</h2>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Admin-controlled
              </span>
            </div>
            <div className="px-6 pb-2">
              <ReadOnlyField label="Company Name"        value={profile.company}               icon={Building2}  />
              <ReadOnlyField label="Business Type"       value={application?.business_type}    icon={Briefcase}  />
              <ReadOnlyField label="Identification"      value={idValue}                       icon={CreditCard} />
              <ReadOnlyField label="VAT Number"          value={application?.vat_number}       icon={Hash}       />
              <ReadOnlyField label="Registration Number" value={application?.registration_number} icon={Hash}    />
              <ReadOnlyField label="Business Address"    value={fullAddress || null}           icon={MapPin}     />
            </div>
          </div>

          {/* ── Account security ─────────────────────────────────────────── */}
          <div className="bg-white border border-slate-100 overflow-hidden" style={{ borderRadius: 2 }}>
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <h2 className="font-semibold text-slate-900">Account Security</h2>
            </div>
            <div className="px-6 pb-2">
              <EditableField label="Password" icon={Lock}>
                <PasswordChangeForm />
              </EditableField>
            </div>
          </div>

          {/* ── Account metadata ─────────────────────────────────────────── */}
          <div className="bg-white border border-slate-100 overflow-hidden" style={{ borderRadius: 2 }}>
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <h2 className="font-semibold text-slate-900">Account History</h2>
            </div>
            <div className="px-6 pb-2">
              <ReadOnlyField label="Member Since" value={memberSince}  icon={Calendar} />
              {lastLogin && (
                <ReadOnlyField label="Last Login" value={lastLogin}    icon={LogIn}    />
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
