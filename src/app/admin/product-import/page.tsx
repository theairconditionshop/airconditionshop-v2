import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import NewImportButton from './new-import-button'

export const metadata: Metadata = { title: 'Product Import — Admin' }
export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    pending:   { label: 'Pending',   cls: 'bg-slate-100 text-slate-500',  Icon: Clock },
    parsing:   { label: 'Parsing…',  cls: 'bg-blue-100 text-blue-700',    Icon: Clock },
    preview:   { label: 'Preview',   cls: 'bg-amber-100 text-amber-700',  Icon: FileText },
    importing: { label: 'Importing', cls: 'bg-blue-100 text-blue-700',    Icon: Clock },
    complete:  { label: 'Complete',  cls: 'bg-green-100 text-green-700',  Icon: CheckCircle2 },
    failed:    { label: 'Failed',    cls: 'bg-red-100 text-red-600',      Icon: XCircle },
  }
  const { label, cls, Icon } = cfg[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500', Icon: AlertCircle }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

export default async function ProductImportPage() {
  const db = createAdminClient()
  const { data: imports } = await db
    .from('product_imports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div>
      <AdminPageHeader title="Product Import" />

      <div className="mb-6">
        <NewImportButton />
      </div>

      {(!imports || imports.length === 0) ? (
        <div className="mt-10 flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <p className="font-medium text-slate-800 mb-1">No imports yet</p>
          <p className="text-sm text-slate-400">Upload a supplier PDF to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['File', 'Type', 'Status', 'Parsed', 'Created', 'Updated', 'Skipped', 'Failed', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {imports.map(imp => (
                <tr key={imp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{imp.filename}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      imp.type === 'price_list' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {imp.type === 'price_list' ? 'Price List' : 'Catalogue'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={imp.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{imp.parsed_count ?? '—'}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{imp.created_count ?? '—'}</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">{imp.updated_count ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{imp.skipped_count ?? '—'}</td>
                  <td className="px-4 py-3 text-red-500">{imp.failed_count ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(imp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/product-import/${imp.id}`} className="text-xs text-sky-600 hover:underline font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
