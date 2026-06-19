import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import CategoryForm from '@/components/admin/category-form'

export const metadata: Metadata = { title: 'Edit Category — Admin' }

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data: category } = await db.from('categories').select('*').eq('id', id).single()
  if (!category) notFound()
  return (
    <div className="max-w-xl">
      <AdminPageHeader title="Edit Category" />
      <CategoryForm category={category} />
    </div>
  )
}
