import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/page-header'
import BlogPostForm from '@/components/admin/blog-post-form'

export const metadata: Metadata = { title: 'Write Post — Admin' }

export default function NewBlogPostPage() {
  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Write Blog Post" />
      <BlogPostForm />
    </div>
  )
}
