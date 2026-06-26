import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft, Building2, Mail, Phone, User, Calendar, FileText, Hash, MapPin } from 'lucide-react'
import TradeDetailActions from './trade-detail-actions'

export const metadata: Metadata = { title: 'Trade Account — Admin' }
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
  suspended: 'bg-slate-100 text-slate-600',
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default async function TradeDetailPage({ params }: Props) {
  const { id } = await params
  const db = createAdminClient()

  const { data: app, error } = await db
    .from('trade_applications')
    .select('*, profiles!user_id(full_name, email, trade_status)')
    .eq('id', id)
    .single()

  if (error || !app) notFound()

  const row     = app as typeof app & { profiles?: { full_name?: string; email?: string; trade_status?: string } }
  const profile = row.profiles

  return (
    <div className="max-w-5xl">
      {/* Back link */}
      <Link href="/admin/trade" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Trade Accounts
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-slate-900">
              {profile?.full_name || 'Unknown Applicant'}
            </h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[row.status] ?? 'bg-slate-100 text-slate-500'}`}>
              {row.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">{row.company_name}</p>
        </div>
        <p className="text-xs text-slate-400">
          Applied {new Date(row.created_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: profile info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Business Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Business Information</h2>
            <p className="text-xs text-slate-400 mb-4">Details about the company</p>
            <InfoRow icon={Building2} label="Company Name"        value={row.company_name} />
            <InfoRow icon={FileText}  label="Business Type"       value={row.business_type} />
            <InfoRow icon={Hash}      label="VAT Number"          value={row.vat_number} />
            <InfoRow icon={Hash}      label="Registration Number" value={row.registration_number} />
            <InfoRow icon={MapPin}    label="Business Address"    value={row.address} />
            <InfoRow icon={MapPin}    label="Postal Code"         value={row.postal_code} />
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Contact Information</h2>
            <p className="text-xs text-slate-400 mb-4">The person who submitted the application</p>
            <InfoRow icon={User}  label="Full Name" value={profile?.full_name} />
            <InfoRow icon={Mail}  label="Email"     value={profile?.email} />
            <InfoRow icon={Phone} label="Phone"     value={row.phone} />
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Account Information</h2>
            <p className="text-xs text-slate-400 mb-4">Application and approval details</p>
            <InfoRow icon={Calendar} label="Applied Date"   value={new Date(row.created_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <InfoRow icon={FileText} label="Current Status" value={row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : undefined} />
            <InfoRow icon={User}     label="Account Status" value={profile?.trade_status} />
          </div>

          {/* Applicant Notes (read-only) */}
          {row.notes && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-1">Applicant Notes</h2>
              <p className="text-xs text-slate-400 mb-3">Submitted by the applicant during registration</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{row.notes}</p>
            </div>
          )}
        </div>

        {/* Right: actions + notes */}
        <div className="lg:col-span-1">
          <TradeDetailActions
            userId={row.user_id as string}
            applicationId={row.id as string}
            status={row.status as string}
            name={profile?.full_name || ''}
            email={profile?.email || ''}
            companyName={row.company_name || ''}
            initialNotes={row.admin_notes || ''}
          />
        </div>
      </div>
    </div>
  )
}
