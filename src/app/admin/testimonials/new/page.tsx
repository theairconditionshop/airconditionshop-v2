import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/page-header'
import TestimonialForm from '@/components/admin/testimonial-form'

export const metadata: Metadata = { title: 'Add Testimonial — Admin' }

export default function NewTestimonialPage() {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Add Testimonial" />
      <TestimonialForm />
    </div>
  )
}
