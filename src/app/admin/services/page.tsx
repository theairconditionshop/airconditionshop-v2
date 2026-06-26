import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'

export const metadata: Metadata = { title: 'Service Requests — Admin' }
export const dynamic = 'force-dynamic'

type Row = {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  service_type: string
  description: string
  preferred_date: string | null
  status: string
  source: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  new:         'bg-amber-100 text-amber-700',
  assigned:    'bg-sky-100 text-sky-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  new:         'New',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

export default async function AdminServicesPage() {
  const db = createAdminClient()

  const { data, error } = await db
    .from('service_requests')
    .select('id, name, email, phone, address, service_type, description, preferred_date, status, source, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/services] DB query error:', error)
  }

  const rows: Row[] = data ?? []

  return (
    <div>
      <AdminPageHeader
        title="Service Requests"
        description={`${rows.length} booking${rows.length !== 1 ? 's' : ''} — incoming service and installation requests`}
      />

      <AdminTable<Row>
        rows={rows}
        mobileRender={r => (
          <div className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <span className="font-semibold text-slate-900 text-sm">{r.name}</span>
                <p className="text-xs text-slate-500 mt-0.5">{r.service_type}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            </div>
            <div className="text-xs space-y-0.5 mb-2">
              <a href={`mailto:${r.email}`} className="text-sky-600 block">{r.email}</a>
              <a href={`tel:${r.phone}`} className="text-slate-500 block">{r.phone}</a>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {r.preferred_date && (
                <span>Pref: {new Date(r.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              )}
            </div>
          </div>
        )}
        columns={[
          {
            label: 'Name',
            render: r => (
              <div>
                <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.source || 'website'}</p>
              </div>
            ),
          },
          {
            label: 'Contact',
            render: r => (
              <div className="text-xs space-y-0.5">
                <a href={`mailto:${r.email}`} className="text-sky-600 hover:underline block">{r.email}</a>
                <a href={`tel:${r.phone}`} className="text-slate-500 hover:text-slate-700 block">{r.phone}</a>
              </div>
            ),
          },
          {
            label: 'Address',
            render: r => (
              <span className="text-xs text-slate-600 max-w-[180px] block truncate" title={r.address || ''}>
                {r.address || '—'}
              </span>
            ),
          },
          {
            label: 'Service Type',
            render: r => (
              <span className="text-sm font-medium text-slate-800">
                {r.service_type}
              </span>
            ),
          },
          {
            label: 'Description',
            render: r => (
              <span className="text-xs text-slate-500 max-w-[220px] block line-clamp-2" title={r.description}>
                {r.description}
              </span>
            ),
          },
          {
            label: 'Preferred Date',
            render: r => (
              <span className="text-xs text-slate-400">
                {r.preferred_date
                  ? new Date(r.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Flexible'}
              </span>
            ),
          },
          {
            label: 'Submitted',
            render: r => (
              <span className="text-xs text-slate-400">
                {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ),
          },
          {
            label: 'Status',
            render: r => (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
