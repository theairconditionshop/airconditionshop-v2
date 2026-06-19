import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/page-header'
import CategoryForm from '@/components/admin/category-form'

export const metadata: Metadata = { title: 'Add Category — Admin' }

export default function NewCategoryPage() {
  return (
    <div className="max-w-xl">
      <AdminPageHeader title="Add Category" />
      <CategoryForm />
    </div>
  )
}
