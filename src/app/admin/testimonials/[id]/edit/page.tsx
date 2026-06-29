import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import TestimonialForm from '@/components/admin/testimonial-form'

export const metadata: Metadata = { title: 'Edit Testimonial — Admin' }

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data } = await db.from('testimonials').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Edit Testimonial" />
      <TestimonialForm testimonial={data} />
    </div>
  )
}
