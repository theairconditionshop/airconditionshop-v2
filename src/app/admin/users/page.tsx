import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'

export const metadata: Metadata = { title: 'Users — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('profiles')
    .select('id, full_name, email, role, trade_status, created_at')
    .order('created_at', { ascending: false })

  type Row = { id: string; full_name?: string; email?: string; role: string; trade_status?: string; created_at: string }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Users" description="All registered accounts" />
      <AdminTable<Row>
        rows={rows}
        mobileRender={r => (
          <div className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 text-sm block truncate">{r.full_name || '—'}</span>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{r.email || '—'}</p>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize shrink-0 ${
                r.role === 'super_admin' ? 'bg-rose-100 text-rose-700' :
                r.role === 'admin'       ? 'bg-purple-100 text-purple-700' :
                r.role === 'staff'       ? 'bg-sky-100 text-sky-700' :
                r.role === 'trade'       ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-500'}`}>
                {r.role.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {r.trade_status && (
                <span className={`text-xs capitalize ${r.trade_status === 'approved' ? 'text-green-600' : r.trade_status === 'pending' ? 'text-amber-600' : 'text-red-500'}`}>
                  Trade: {r.trade_status}
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        columns={[
          { label: 'Name',   render: r => <span className="font-medium">{r.full_name || '—'}</span> },
          { label: 'Email',  render: r => <span className="text-xs text-slate-600">{r.email || '—'}</span> },
          { label: 'Role',   render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
              r.role === 'super_admin' ? 'bg-rose-100 text-rose-700' :
              r.role === 'admin'       ? 'bg-purple-100 text-purple-700' :
              r.role === 'staff'       ? 'bg-sky-100 text-sky-700' :
              r.role === 'trade'       ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-500'}`}>
              {r.role.replace('_', ' ')}
            </span>
          )},
          { label: 'Trade',  render: r => r.trade_status ? (
            <span className={`text-xs capitalize ${r.trade_status === 'approved' ? 'text-green-600' : r.trade_status === 'pending' ? 'text-amber-600' : 'text-red-500'}`}>
              {r.trade_status}
            </span>
          ) : <span className="text-slate-300 text-xs">—</span> },
          { label: 'Joined', render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span> },
        ]}
      />
    </div>
  )
}
