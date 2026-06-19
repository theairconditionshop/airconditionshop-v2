import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/page-header'
import BrandForm from '@/components/admin/brand-form'

export const metadata: Metadata = { title: 'Add Brand — Admin' }

export default function NewBrandPage() {
  return (
    <div className="max-w-xl">
      <AdminPageHeader title="Add Brand" />
      <BrandForm />
    </div>
  )
}
