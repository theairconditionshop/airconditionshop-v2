import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import ProductForm from '@/components/admin/product-form'

export const metadata: Metadata = { title: 'Edit Product — Admin' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const [{ data: product }, { data: categories }, { data: brands }] = await Promise.all([
    db.from('products').select('*').eq('id', id).single(),
    db.from('categories').select('id, name').eq('is_active', true).order('name'),
    db.from('brands').select('id, name').eq('is_active', true).order('name'),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Edit Product" />
      <ProductForm product={product} categories={categories ?? []} brands={brands ?? []} />
    </div>
  )
}
