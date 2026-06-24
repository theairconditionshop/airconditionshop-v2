import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { parseCataloguePdf, parsePriceListPdf, GEMINI_BUSY_MSG } from '@/services/ai/gemini-product-parser'
import { buildLookup, matchProduct } from '@/lib/import/matcher'

export const maxDuration = 120

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const BATCH_SIZE = 200
// Slightly under the 5-minute stated limit so the DB update still has time to run
const PARSE_TIMEOUT_MS = 4.5 * 60 * 1000

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

// POST /api/admin/product-import/[id]/parse
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()

  const { data: imp } = await db.from('product_imports').select('*').eq('id', id).single()
  if (!imp) return NextResponse.json({ error: 'Import not found' }, { status: 404 })
  if (!['pending', 'failed'].includes(imp.status)) {
    return NextResponse.json({ error: `Cannot parse — current status: ${imp.status}` }, { status: 409 })
  }
  if (!imp.file_path) return NextResponse.json({ error: 'No file stored for this import' }, { status: 400 })

  await db.from('product_imports').update({ status: 'parsing', error_message: null }).eq('id', id)

  try {
    const { data: fileData, error: dlError } = await db.storage.from('media').download(imp.file_path)
    if (dlError || !fileData) throw new Error(`Could not download PDF: ${dlError?.message}`)
    const buffer = Buffer.from(await fileData.arrayBuffer())

    const pdfType = imp.type as 'catalogue' | 'price_list'
    const parseOp = pdfType === 'price_list'
      ? parsePriceListPdf(buffer)
      : parseCataloguePdf(buffer)

    const products = await withTimeout(parseOp, PARSE_TIMEOUT_MS, 'Parsing timed out')

    // Guard: if the import was cancelled while Gemini was running, abort silently
    const { data: current } = await db.from('product_imports').select('status').eq('id', id).single()
    if (current?.status === 'cancelled') {
      return NextResponse.json({ ok: false, cancelled: true })
    }

    const { data: allProducts } = await db
      .from('products')
      .select('id, sku, model_number, name')
    const lookup = buildLookup(allProducts ?? [])

    await db.from('product_import_rows').delete().eq('import_id', id)

    const rows = products.map((p, i) => {
      const match = matchProduct(p, lookup, pdfType)
      return {
        import_id:           id,
        row_index:           i,
        action:              match.action,
        matched_product_id:  match.product_id,
        match_type:          match.match_type,
        raw_data:            p,
        confidence_score:    match.confidence_score,
        confidence_reason:   match.confidence_reason,
        normalised_brand:    match.normalised_brand,
        normalised_category: match.normalised_category,
      }
    })

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      await db.from('product_import_rows').insert(rows.slice(i, i + BATCH_SIZE))
    }

    const needs_review_count = rows.filter(r => r.action === 'review').length

    await db.from('product_imports').update({
      status:             'preview',
      parsed_count:       products.length,
      created_count:      0,
      updated_count:      0,
      skipped_count:      rows.filter(r => r.action === 'skip').length,
      failed_count:       0,
      needs_review_count,
    }).eq('id', id)

    return NextResponse.json({ ok: true, parsed: products.length, needs_review: needs_review_count })
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    const msg = (
      raw === 'Parsing timed out' ||
      raw.includes('503') ||
      raw.toLowerCase().includes('service unavailable') ||
      raw.toLowerCase().includes('overloaded') ||
      raw === GEMINI_BUSY_MSG
    ) ? (raw === 'Parsing timed out' ? raw : GEMINI_BUSY_MSG) : raw

    // Always update to failed — this is the guard against infinite "parsing" state
    await db.from('product_imports').update({ status: 'failed', error_message: msg }).eq('id', id)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
