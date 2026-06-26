import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'

export const metadata: Metadata = { title: 'Quote Requests — Admin' }
export const dynamic = 'force-dynamic'

export default async function QuotesPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('quote_requests')
    .select('id, name, email, phone, company, service_type, budget_range, message, status, created_at')
    .order('created_at', { ascending: false })

  type Row = { id: string; name: string; email: string; phone?: string; company?: string; service_type?: string; budget_range?: string; message: string; status: string; created_at: string }
  const rows: Row[] = data ?? []

  return (
    <div>
      <AdminPageHeader title="Quote Requests" description="Customer quote requests awaiting response" />
      <AdminTable<Row>
        rows={rows}
        mobileRender={r => (
          <div className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-semibold text-slate-900 text-sm">{r.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${r.status === 'new' ? 'bg-amber-100 text-amber-700' : r.status === 'quoted' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                {r.status}
              </span>
            </div>
            <a href={`mailto:${r.email}`} className="text-xs text-sky-600 block mb-1">{r.email}</a>
            {r.service_type && (
              <p className="text-xs text-slate-600 mb-2">
                {r.service_type}{r.budget_range ? ` · ${r.budget_range}` : ''}
              </p>
            )}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
              <a href={`/admin/quotes/${r.id}`} className="text-xs font-medium text-sky-600">View →</a>
            </div>
          </div>
        )}
        columns={[
          { label: 'Name',         render: r => <span className="font-medium">{r.name}</span> },
          { label: 'Email',        render: r => <a href={`mailto:${r.email}`} className="text-sky-600 hover:underline text-xs">{r.email}</a> },
          { label: 'Service',      render: r => <span className="text-xs">{r.service_type || '—'}</span> },
          { label: 'Budget',       render: r => <span className="text-xs text-slate-500">{r.budget_range || '—'}</span> },
          { label: 'Message',      render: r => <span className="text-xs text-slate-500 truncate max-w-xs block">{r.message}</span> },
          { label: 'Date',         render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span> },
          { label: 'Status',       render: r => (
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${r.status === 'new' ? 'bg-amber-100 text-amber-700' : r.status === 'quoted' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.status}
            </span>
          )},
          { label: '',             render: r => (
            <a href={`/admin/quotes/${r.id}`} className="text-xs text-sky-600 hover:underline">View</a>
          )},
        ]}
      />
    </div>
  )
}
