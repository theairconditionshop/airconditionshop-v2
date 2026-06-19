import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import BlogPostForm from '@/components/admin/blog-post-form'

export const metadata: Metadata = { title: 'Edit Post — Admin' }

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data: post } = await db.from('blog_posts').select('*').eq('id', id).single()
  if (!post) notFound()

  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Edit Blog Post" />
      <BlogPostForm post={post} />
    </div>
  )
}
