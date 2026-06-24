import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { executeImportRow } from '@/lib/import/engine'
import type { ParsedProduct } from '@/services/ai/gemini-product-parser'

export const maxDuration = 120

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const PARALLEL_BATCH = 10

// POST /api/admin/product-import/[id]/execute
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()

  const { data: imp } = await db.from('product_imports').select('*').eq('id', id).single()
  if (!imp) return NextResponse.json({ error: 'Import not found' }, { status: 404 })
  if (imp.status !== 'preview') {
    return NextResponse.json({ error: `Cannot execute — status: ${imp.status}` }, { status: 409 })
  }

  await db.from('product_imports').update({ status: 'importing' }).eq('id', id)

  const { data: rows } = await db
    .from('product_import_rows')
    .select('*')
    .eq('import_id', id)
    .in('action', ['create', 'update'])
    .order('row_index')

  let created = 0, updated = 0, failed = 0
  const pdfType = imp.type as 'catalogue' | 'price_list'

  // Process in parallel batches of 10 (Phase 12 performance)
  const allRows = rows ?? []
  for (let i = 0; i < allRows.length; i += PARALLEL_BATCH) {
    const batch = allRows.slice(i, i + PARALLEL_BATCH)
    const results = await Promise.allSettled(
      batch.map(row =>
        executeImportRow({
          importId:           id,
          rowId:              row.id,
          parsed:             row.raw_data as ParsedProduct,
          action:             row.action as 'create' | 'update',
          matchedProductId:   row.matched_product_id,
          replaceExisting:    imp.replace_existing ?? false,
          pdfType,
          normalisedBrand:    row.normalised_brand,
          normalisedCategory: row.normalised_category,
        })
      )
    )
    for (let j = 0; j < results.length; j++) {
      if (results[j].status === 'fulfilled') {
        if (batch[j].action === 'create') created++
        else updated++
      } else {
        failed++
      }
    }
  }

  const { data: allRows2 } = await db
    .from('product_import_rows')
    .select('action')
    .eq('import_id', id)

  const skipped      = (allRows2 ?? []).filter(r => r.action === 'skip').length
  const needs_review = (allRows2 ?? []).filter(r => r.action === 'review').length

  await db.from('product_imports').update({
    status:             'complete',
    created_count:      created,
    updated_count:      updated,
    skipped_count:      skipped,
    failed_count:       failed,
    needs_review_count: needs_review,
    completed_at:       new Date().toISOString(),
  }).eq('id', id)

  return NextResponse.json({ ok: true, created, updated, skipped, failed, needs_review })
}
