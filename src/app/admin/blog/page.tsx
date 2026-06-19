import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'

export const metadata: Metadata = { title: 'Blog — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('blog_posts')
    .select('id, title, slug, is_published, published_at, created_at')
    .order('created_at', { ascending: false })

  type Row = { id: string; title: string; slug: string; is_published: boolean; published_at?: string; created_at: string }
  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Blog Posts" newHref="/admin/blog/new" newLabel="Write Post" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          { label: 'Title',     render: r => <span className="font-medium">{r.title}</span> },
          { label: 'Slug',      render: r => <span className="text-xs font-mono text-slate-500">{r.slug}</span> },
          { label: 'Published', render: r => <span className="text-xs text-slate-400">{r.published_at ? new Date(r.published_at).toLocaleDateString() : '—'}</span> },
          { label: 'Status',    render: r => (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {r.is_published ? 'Published' : 'Draft'}
            </span>
          )},
          { label: '', render: r => (
            <div className="flex gap-2">
              <a href={`/admin/blog/${r.id}/edit`} className="text-xs text-sky-600 hover:underline">Edit</a>
              <DeleteButton id={r.id} entity="blog" label={r.title} />
            </div>
          )},
        ]}
      />
    </div>
  )
}
