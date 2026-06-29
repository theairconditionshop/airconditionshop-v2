import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Testimonials — Admin' }
export const dynamic = 'force-dynamic'

type Row = {
  id: string
  name: string
  title: string | null
  company: string | null
  rating: number
  content: string
  is_active: boolean
  display_order: number
  created_at: string
}

export default async function AdminTestimonialsPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('testimonials')
    .select('id, name, title, company, rating, content, is_active, display_order, created_at')
    .order('display_order', { ascending: true })

  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="Testimonials" newHref="/admin/testimonials/new" newLabel="Add Testimonial" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          {
            label: 'Customer',
            render: r => (
              <div>
                <p className="font-medium text-slate-900">{r.name}</p>
                {r.company && <p className="text-xs text-slate-400">{r.company}</p>}
              </div>
            ),
          },
          {
            label: 'Rating',
            render: r => (
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
                ))}
              </div>
            ),
          },
          {
            label: 'Review',
            render: r => (
              <p className="text-xs text-slate-500 max-w-xs truncate">{r.content}</p>
            ),
          },
          {
            label: 'Order',
            render: r => <span className="text-xs text-slate-400">{r.display_order}</span>,
          },
          {
            label: 'Status',
            render: r => (
              <Badge variant={r.is_active ? 'success' : 'secondary'}>
                {r.is_active ? 'Active' : 'Hidden'}
              </Badge>
            ),
          },
          {
            label: '',
            render: r => (
              <div className="flex gap-2">
                <Link href={`/admin/testimonials/${r.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                <DeleteButton id={r.id} entity="testimonial" label={r.name} />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
