import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import { Layers, Eye, EyeOff, Palette, Package } from 'lucide-react'
import NewSeriesButton from '@/components/admin/new-series-button'
import DuplicateButton from '@/components/admin/duplicate-button'

export const metadata: Metadata = { title: 'AC Series — Admin' }
export const dynamic = 'force-dynamic'

interface SeriesRow {
  id: string
  name: string
  slug: string
  is_active: boolean
  has_colours: boolean
  ac_type: string | null
  brand: { name: string; slug: string } | null
  variants: { id: string }[]
  colours: { id: string }[]
}

export default async function AdminSeriesPage() {
  const db = createAdminClient()
  const [{ data: series }, { data: brands }] = await Promise.all([
    db.from('product_series')
      .select('id,name,slug,is_active,has_colours,ac_type, brand:brands(name,slug), variants:product_variants(id), colours:series_colours(id)')
      .order('display_order').order('created_at', { ascending: false }),
    db.from('brands').select('id,name').eq('is_active', true).order('name'),
  ])

  const rows = (series ?? []) as unknown as SeriesRow[]

  return (
    <div>
      <AdminPageHeader
        title="AC Series"
        description="One product page per series — colours and BTU variants are managed inside each series."
        action={<NewSeriesButton brands={brands ?? []} />}
      />

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No series yet</p>
          <p className="text-xs text-slate-400 mt-1">Create a series like “GREE Pular” and add BTU variants inside.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
          {rows.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors">
              <Link href={`/admin/series/${s.id}/edit`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-sky-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {s.brand?.name ? `${s.brand.name} ` : ''}{s.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    /products/{s.brand?.slug ?? '—'}/{s.slug}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 shrink-0">
                  <span className="inline-flex items-center gap-1"><Package className="w-3.5 h-3.5" />{s.variants?.length ?? 0} variants</span>
                  {s.has_colours && <span className="inline-flex items-center gap-1"><Palette className="w-3.5 h-3.5" />{s.colours?.length ?? 0} colours</span>}
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {s.is_active ? 'Live' : 'Hidden'}
                </span>
              </Link>
              <DuplicateButton id={s.id} entity="series" label={s.name} editPath={id => `/admin/series/${id}/edit`} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
