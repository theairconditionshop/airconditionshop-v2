import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'

export const metadata: Metadata = { title: 'Categories — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('categories')
    .select('id, name, slug, description, is_active, sort_order')
    .order('sort_order')

  type Row = { id: string; name: string; slug: string; description?: string; is_active: boolean; sort_order?: number }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Categories" newHref="/admin/categories/new" newLabel="Add Category" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',    render: r => <span className="font-medium">{r.name}</span> },
          { label: 'Slug',    render: r => <span className="text-xs font-mono text-slate-500">{r.slug}</span> },
          { label: 'Order',   render: r => <span className="text-xs">{r.sort_order ?? '—'}</span> },
          { label: 'Active',  render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.is_active ? 'Active' : 'Hidden'}
            </span>
          )},
          { label: '', render: r => (
            <div className="flex gap-2">
              <a href={`/admin/categories/${r.id}/edit`} className="text-xs text-sky-600 hover:underline">Edit</a>
              <DeleteButton id={r.id} entity="categories" label={r.name} />
            </div>
          )},
        ]}
      />
    </div>
  )
}
