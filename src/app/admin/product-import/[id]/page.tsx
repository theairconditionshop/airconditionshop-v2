import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft } from 'lucide-react'
import ImportWizard from './import-wizard'

export const metadata: Metadata = { title: 'Product Import — Admin' }
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function ImportDetailPage({ params }: Props) {
  const { id } = await params
  const db = createAdminClient()

  const [{ data: imp }, { data: rows }] = await Promise.all([
    db.from('product_imports').select('*').eq('id', id).single(),
    db.from('product_import_rows')
      .select('*, product:matched_product_id(id, name, slug)')
      .eq('import_id', id)
      .order('row_index'),
  ])

  if (!imp) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/product-import" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Imports
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700 truncate max-w-[300px]">{imp.filename}</span>
      </div>

      <ImportWizard initialImport={imp} initialRows={rows ?? []} />
    </div>
  )
}
