import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/page-header'
import MediaLibrary from './media-library'

export const metadata: Metadata = { title: 'Media — Admin' }
export const dynamic = 'force-dynamic'

export default function AdminMediaPage() {
  return (
    <div>
      <AdminPageHeader title="Media Library" description="Upload and manage images and documents" />
      <MediaLibrary />
    </div>
  )
}
