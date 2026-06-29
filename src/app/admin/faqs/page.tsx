import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import AdminTable from '@/components/admin/admin-table'
import DeleteButton from '@/components/admin/delete-button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'FAQs — Admin' }
export const dynamic = 'force-dynamic'

type Row = {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
  created_at: string
}

export default async function AdminFaqsPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('faqs')
    .select('id, question, answer, category, display_order, is_active, created_at')
    .order('category')
    .order('display_order')

  const rows: Row[] = (data ?? []) as Row[]

  return (
    <div>
      <AdminPageHeader title="FAQs" newHref="/admin/faqs/new" newLabel="Add FAQ" />
      <AdminTable<Row>
        rows={rows}
        columns={[
          {
            label: 'Question',
            render: r => (
              <p className="font-medium text-slate-900 max-w-sm truncate">{r.question}</p>
            ),
          },
          {
            label: 'Answer',
            render: r => (
              <p className="text-xs text-slate-500 max-w-xs truncate">{r.answer}</p>
            ),
          },
          {
            label: 'Category',
            render: r => (
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{r.category}</span>
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
                <Link href={`/admin/faqs/${r.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                <DeleteButton id={r.id} entity="faq" label={r.question.slice(0, 40)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
