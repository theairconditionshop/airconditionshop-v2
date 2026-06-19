import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import EnquiryActions from './enquiry-actions'

export const metadata: Metadata = { title: 'Enquiries — Admin' }
export const dynamic = 'force-dynamic'

export default async function EnquiriesPage() {
  const db = createAdminClient()
  const { data: enquiries } = await db
    .from('enquiries')
    .select('id, name, email, phone, company, message, source, status, created_at')
    .order('created_at', { ascending: false })

  type Row = { id: string; name: string; email: string; phone?: string; company?: string; message: string; source: string; status: string; created_at: string }
  const rows: Row[] = enquiries ?? []

  return (
    <div>
      <AdminPageHeader title="Enquiries" description="All contact form submissions" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',    render: r => <span className="font-medium">{r.name}</span> },
          { label: 'Email',   render: r => <a href={`mailto:${r.email}`} className="text-sky-600 hover:underline text-xs">{r.email}</a> },
          { label: 'Source',  render: r => <span className="text-xs capitalize text-slate-500">{r.source?.replace('_', ' ')}</span> },
          { label: 'Message', render: r => <span className="text-xs text-slate-500 truncate max-w-xs block">{r.message}</span> },
          { label: 'Date',    render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span> },
          { label: 'Status',  render: r => (
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${r.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.status}
            </span>
          )},
          { label: '', render: r => <EnquiryActions id={r.id} status={r.status} /> },
        ]}
      />
    </div>
  )
}
