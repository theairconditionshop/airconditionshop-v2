import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import TradeActions from './trade-actions'

export const metadata: Metadata = { title: 'Trade Accounts — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminTradePage() {
  const db = createAdminClient()
  const { data } = await db
    .from('trade_applications')
    .select('id, user_id, company_name, business_type, vat_number, phone, status, created_at, profiles(full_name, email, trade_status)')
    .order('created_at', { ascending: false })

  type Row = {
    id: string; user_id: string; company_name: string; business_type: string;
    vat_number?: string; phone?: string; status: string; created_at: string;
    profiles?: { full_name?: string; email?: string; trade_status?: string }
  }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Trade Accounts" description="Trade account applications and approved accounts" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',       render: r => <span className="font-medium">{r.profiles?.full_name || '—'}</span> },
          { label: 'Email',      render: r => <span className="text-xs text-sky-600">{r.profiles?.email || '—'}</span> },
          { label: 'Company',    render: r => <span className="text-xs">{r.company_name}</span> },
          { label: 'Type',       render: r => <span className="text-xs text-slate-500">{r.business_type}</span> },
          { label: 'VAT',        render: r => <span className="text-xs text-slate-400">{r.vat_number || '—'}</span> },
          { label: 'Applied',    render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span> },
          { label: 'Status',     render: r => (
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              r.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
              r.status === 'approved' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'}`}>
              {r.status}
            </span>
          )},
          { label: '', render: r => <TradeActions id={r.user_id} status={r.status} applicationId={r.id} name={r.profiles?.full_name || ''} email={r.profiles?.email || ''} /> },
        ]}
      />
    </div>
  )
}
