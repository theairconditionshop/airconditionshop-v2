import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import BrandDeleteButton from '@/components/admin/brand-delete-button'

export const metadata: Metadata = { title: 'Brands — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminBrandsPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('brands')
    .select('id, name, slug, display_order, is_active')
    .order('display_order')

  type Row = { id: string; name: string; slug: string; display_order?: number; is_active: boolean }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Brands" newHref="/admin/brands/new" newLabel="Add Brand" />
      <AdminTable<Row>
        rows={rows}
        mobileRender={r => (
          <div className="px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 text-sm block">{r.name}</span>
              <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">{r.slug}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {r.is_active ? 'Active' : 'Hidden'}
              </span>
              <a href={`/admin/brands/${r.id}/edit`} className="text-xs text-sky-600 hover:underline font-medium">Edit</a>
              <BrandDeleteButton id={r.id} label={r.name} />
            </div>
          </div>
        )}
        columns={[
          { label: 'Name',  render: r => <span className="font-medium">{r.name}</span> },
          { label: 'Slug',  render: r => <span className="text-xs font-mono text-slate-500">{r.slug}</span> },
          { label: 'Order', render: r => <span className="text-xs text-slate-500">{r.display_order ?? '—'}</span> },
          { label: 'Active', render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.is_active ? 'Active' : 'Hidden'}
            </span>
          )},
          { label: '', render: r => (
            <div className="flex gap-2">
              <a href={`/admin/brands/${r.id}/edit`} className="text-xs text-sky-600 hover:underline">Edit</a>
              <BrandDeleteButton id={r.id} label={r.name} />
            </div>
          )},
        ]}
      />
    </div>
  )
}
