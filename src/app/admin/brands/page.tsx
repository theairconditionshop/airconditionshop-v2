import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'

export const metadata: Metadata = { title: 'Brands — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminBrandsPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('brands')
    .select('id, name, slug, country_of_origin, is_active, sort_order')
    .order('sort_order')

  type Row = { id: string; name: string; slug: string; country_of_origin?: string; is_active: boolean; sort_order?: number }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Brands" newHref="/admin/brands/new" newLabel="Add Brand" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',    render: r => <span className="font-medium">{r.name}</span> },
          { label: 'Slug',    render: r => <span className="text-xs font-mono text-slate-500">{r.slug}</span> },
          { label: 'Country', render: r => <span className="text-xs text-slate-500">{r.country_of_origin || '—'}</span> },
          { label: 'Active',  render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.is_active ? 'Active' : 'Hidden'}
            </span>
          )},
          { label: '', render: r => (
            <div className="flex gap-2">
              <a href={`/admin/brands/${r.id}/edit`} className="text-xs text-sky-600 hover:underline">Edit</a>
              <DeleteButton id={r.id} entity="brands" label={r.name} />
            </div>
          )},
        ]}
      />
    </div>
  )
}
