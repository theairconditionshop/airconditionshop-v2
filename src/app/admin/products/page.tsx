import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'
import { ImageIcon } from 'lucide-react'

export const metadata: Metadata = { title: 'Products — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('products')
    .select('id, name, slug, retail_price, availability, is_active, is_featured, categories(name), brands(name), product_images(id)')
    .order('created_at', { ascending: false })

  if (error) console.error('[admin/products] query error:', error.message)

  type Row = {
    id: string; name: string; slug: string; retail_price?: number; availability?: string;
    is_active: boolean; is_featured: boolean;
    categories?: { name: string } | null
    brands?: { name: string } | null
    product_images?: { id: string }[]
  }
  const rows: Row[] = (data ?? []) as unknown as Row[]

  return (
    <div>
      <AdminPageHeader title="Products" newHref="/admin/products/new" newLabel="Add Product" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Name',         render: r => (
            <div>
              <span className="font-medium text-sm">{r.name}</span>
              {r.is_featured && <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Featured</span>}
            </div>
          )},
          { label: 'Category',     render: r => <span className="text-xs text-slate-500">{r.categories?.name || '—'}</span> },
          { label: 'Brand',        render: r => <span className="text-xs text-slate-500">{r.brands?.name || '—'}</span> },
          { label: 'Price',        render: r => <span className="text-xs font-medium">{r.retail_price != null ? `€${r.retail_price.toFixed(2)}` : <span className="text-slate-400 italic">No price</span>}</span> },
          { label: 'Images',       render: r => (
            <span className={`flex items-center gap-1 text-xs ${(r.product_images?.length ?? 0) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
              <ImageIcon className="w-3 h-3" />
              {r.product_images?.length ?? 0}
            </span>
          )},
          { label: 'Availability', render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
              r.availability === 'in_stock'    ? 'bg-green-100 text-green-700' :
              r.availability === 'out_of_stock'? 'bg-amber-100 text-amber-700' :
              r.availability === 'on_order'    ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-500'}`}>
              {r.availability?.replace(/_/g, ' ') ?? '—'}
            </span>
          )},
          { label: 'Status', render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {r.is_active ? 'Active' : 'Hidden'}
            </span>
          )},
          { label: '', render: r => (
            <div className="flex items-center gap-2">
              <a href={`/admin/products/${r.id}/edit`} className="text-xs text-sky-600 hover:underline font-medium">Edit</a>
              <span className="text-slate-200">|</span>
              <a href={`/products/${r.slug}`} target="_blank" className="text-xs text-slate-400 hover:text-slate-600">View</a>
              <span className="text-slate-200">|</span>
              <DeleteButton id={r.id} entity="products" label={r.name} />
            </div>
          )},
        ]}
      />
      {rows.length === 0 && (
        <div className="mt-6 text-center py-12 text-slate-400 text-sm">
          No products yet. <a href="/admin/products/new" className="text-sky-600 hover:underline font-medium">Add your first product</a>.
        </div>
      )}
    </div>
  )
}
