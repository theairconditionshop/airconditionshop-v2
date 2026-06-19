import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'

export const metadata: Metadata = { title: 'CRM — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminCrmPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('crm_contacts')
    .select('id, name, email, phone, company, type, source, created_at')
    .order('created_at', { ascending: false })

  type Row = { id: string; name: string; email?: string; phone?: string; company?: string; type?: string; source?: string; created_at: string }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="CRM Contacts" description="All contacts from enquiries, quotes, and service requests" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',    render: r => <span className="font-medium">{r.name}</span> },
          { label: 'Email',   render: r => r.email ? <a href={`mailto:${r.email}`} className="text-sky-600 hover:underline text-xs">{r.email}</a> : <span className="text-slate-400 text-xs">—</span> },
          { label: 'Phone',   render: r => <span className="text-xs">{r.phone || '—'}</span> },
          { label: 'Company', render: r => <span className="text-xs text-slate-500">{r.company || '—'}</span> },
          { label: 'Type',    render: r => <span className="text-xs capitalize text-slate-500">{r.type || '—'}</span> },
          { label: 'Source',  render: r => <span className="text-xs text-slate-400">{r.source?.replace('_', ' ') || '—'}</span> },
          { label: 'Added',   render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span> },
          { label: '',        render: r => <a href={`/admin/crm/${r.id}`} className="text-xs text-sky-600 hover:underline">View</a> },
        ]}
      />
    </div>
  )
}
