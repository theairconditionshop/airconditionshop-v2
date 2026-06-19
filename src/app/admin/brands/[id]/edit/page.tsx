import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import BrandForm from '@/components/admin/brand-form'

export const metadata: Metadata = { title: 'Edit Brand — Admin' }

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data: brand } = await db.from('brands').select('*').eq('id', id).single()
  if (!brand) notFound()
  return (
    <div className="max-w-xl">
      <AdminPageHeader title="Edit Brand" />
      <BrandForm brand={brand} />
    </div>
  )
}
