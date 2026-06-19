import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import ProductForm from '@/components/admin/product-form'

export const metadata: Metadata = { title: 'Add Product — Admin' }

export default async function NewProductPage() {
  const db = createAdminClient()
  const [{ data: categories }, { data: brands }] = await Promise.all([
    db.from('categories').select('id, name').eq('is_active', true).order('name'),
    db.from('brands').select('id, name').eq('is_active', true).order('name'),
  ])

  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Add Product" />
      <ProductForm categories={categories ?? []} brands={brands ?? []} />
    </div>
  )
}
