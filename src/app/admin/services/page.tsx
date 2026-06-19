import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'

export const metadata: Metadata = { title: 'Service Requests — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('service_requests')
    .select('id, customer_name, customer_email, customer_phone, address, service_type, description, preferred_date, status, created_at')
    .order('created_at', { ascending: false })

  type Row = {
    id: string; customer_name: string; customer_email: string; customer_phone?: string;
    address: string; service_type: string; description: string; preferred_date?: string;
    status: string; created_at: string
  }
  const rows: Row[] = data ?? []

  return (
    <div>
      <AdminPageHeader title="Service Requests" description="Incoming service and installation bookings" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',          render: r => <span className="font-medium">{r.customer_name}</span> },
          { label: 'Phone',         render: r => <span className="text-xs">{r.customer_phone || '—'}</span> },
          { label: 'Service',       render: r => <span className="text-xs">{r.service_type}</span> },
          { label: 'Address',       render: r => <span className="text-xs text-slate-500 truncate max-w-xs block">{r.address}</span> },
          { label: 'Preferred',     render: r => <span className="text-xs text-slate-400">{r.preferred_date || '—'}</span> },
          { label: 'Received',      render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span> },
          { label: 'Status',        render: r => (
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              r.status === 'new'        ? 'bg-amber-100 text-amber-700' :
              r.status === 'scheduled'  ? 'bg-sky-100 text-sky-700' :
              r.status === 'completed'  ? 'bg-green-100 text-green-700' :
              'bg-slate-100 text-slate-500'}`}>
              {r.status}
            </span>
          )},
          { label: '', render: r => (
            <a href={`/admin/services/${r.id}`} className="text-xs text-sky-600 hover:underline">View</a>
          )},
        ]}
      />
    </div>
  )
}
