import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import SeriesEditor from '@/components/admin/series-editor'
import type { ProductSeries } from '@/types/database'

export const metadata: Metadata = { title: 'Edit Series — Admin' }
export const dynamic = 'force-dynamic'

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()

  const [{ data: series }, { data: brands }, { data: categories }] = await Promise.all([
    db.from('product_series')
      .select('*, colours:series_colours(*), variants:product_variants(*), images:series_images(*)')
      .eq('id', id).single(),
    db.from('brands').select('id,name').eq('is_active', true).order('name'),
    db.from('categories').select('id,name').eq('is_active', true).order('name'),
  ])

  if (!series) notFound()

  return (
    <SeriesEditor
      series={series as unknown as ProductSeries}
      brands={brands ?? []}
      categories={categories ?? []}
    />
  )
}
