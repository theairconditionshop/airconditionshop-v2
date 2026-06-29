import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import FaqForm from '@/components/admin/faq-form'

export const metadata: Metadata = { title: 'Edit FAQ — Admin' }

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data } = await db.from('faqs').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Edit FAQ" />
      <FaqForm faq={data} />
    </div>
  )
}
