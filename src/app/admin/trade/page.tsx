import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import { Building2, Mail, Phone, ChevronRight, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Trade Accounts — Admin' }
export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  suspended:'bg-slate-100 text-slate-600',
}

export default async function AdminTradePage() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('trade_applications')
    .select('id, user_id, company_name, business_type, vat_number, phone, status, created_at, profiles!user_id(full_name, email, trade_status)')
    .order('created_at', { ascending: false })

  if (error) console.error('[admin/trade] query error:', error.message)

  type Row = {
    id: string; user_id: string; company_name: string; business_type: string;
    vat_number?: string; phone?: string; status: string; created_at: string;
    profiles?: { full_name?: string; email?: string; trade_status?: string }
  }
  const rows: Row[] = (data ?? []) as Row[]

  const pending  = rows.filter(r => r.status === 'pending').length
  const approved = rows.filter(r => r.status === 'approved').length

  return (
    <div>
      <AdminPageHeader
        title="Trade Accounts"
        description={`${rows.length} applications · ${pending} awaiting review · ${approved} approved`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending Review', value: pending,  color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Approved',       value: approved, color: 'text-green-600 bg-green-50 border-green-100' },
          { label: 'Total',          value: rows.length, color: 'text-slate-700 bg-slate-50 border-slate-100' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-70">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Application list */}
      <div className="space-y-2">
        {rows.map(row => (
          <Link
            key={row.id}
            href={`/admin/trade/${row.id}`}
            className="flex items-center gap-4 bg-white border border-slate-100 hover:border-sky-200 hover:shadow-sm rounded-2xl px-5 py-4 transition-all group"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-sm font-bold text-slate-500">
              {(row.profiles?.full_name || row.company_name || '?').charAt(0).toUpperCase()}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {row.profiles?.full_name || '—'}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLES[row.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {row.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {row.company_name}
                </span>
                {row.profiles?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {row.profiles.email}
                  </span>
                )}
                {row.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {row.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">{row.business_type}</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0" />
          </Link>
        ))}

        {!rows.length && (
          <div className="py-16 text-center text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No trade applications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
