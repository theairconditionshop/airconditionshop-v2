import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'

export const metadata: Metadata = { title: 'Products — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('products')
    .select('id, name, slug, retail_price, stock_qty, is_active, is_featured, categories(name), brands(name)')
    .order('created_at', { ascending: false })

  type Row = {
    id: string; name: string; slug: string; retail_price?: number; stock_qty?: number;
    is_active: boolean; is_featured: boolean;
    categories?: { name: string } | null
    brands?: { name: string } | null
  }
  const rows: Row[] = (data ?? []) as unknown as Row[]

  return (
    <div>
      <AdminPageHeader title="Products" newHref="/admin/products/new" newLabel="Add Product" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',     render: r => <span className="font-medium text-sm">{r.name}</span> },
          { label: 'Category', render: r => <span className="text-xs text-slate-500">{r.categories?.name || '—'}</span> },
          { label: 'Brand',    render: r => <span className="text-xs text-slate-500">{r.brands?.name || '—'}</span> },
          { label: 'Price',    render: r => <span className="text-xs">€{r.retail_price?.toFixed(2) ?? '—'}</span> },
          { label: 'Stock',    render: r => <span className="text-xs">{r.stock_qty ?? '—'}</span> },
          { label: 'Active',   render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.is_active ? 'Active' : 'Hidden'}
            </span>
          )},
          { label: '', render: r => (
            <div className="flex items-center gap-2">
              <a href={`/admin/products/${r.id}/edit`} className="text-xs text-sky-600 hover:underline">Edit</a>
              <DeleteButton id={r.id} entity="products" label={r.name} />
            </div>
          )},
        ]}
      />
    </div>
  )
}
