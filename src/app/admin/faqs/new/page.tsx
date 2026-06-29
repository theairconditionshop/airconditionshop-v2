import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/page-header'
import FaqForm from '@/components/admin/faq-form'

export const metadata: Metadata = { title: 'Add FAQ — Admin' }

export default function NewFaqPage() {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Add FAQ" />
      <FaqForm />
    </div>
  )
}
