import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import type { ParsedProduct } from '@/services/ai/gemini-product-parser'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

function escapeCsv(val: unknown): string {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// GET /api/admin/product-import/[id]/export?format=csv|json
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id }  = await params
  const format  = req.nextUrl.searchParams.get('format') ?? 'csv'
  const db      = createAdminClient()

  const [{ data: imp }, { data: rows }] = await Promise.all([
    db.from('product_imports')
      .select('filename, type, status, needs_review_count, created_at')
      .eq('id', id).single(),
    db.from('product_import_rows')
      .select('row_index, action, match_type, confidence_score, confidence_reason, normalised_brand, normalised_category, raw_data, error_message, product:matched_product_id(name)')
      .eq('import_id', id)
      .order('row_index'),
  ])

  if (!imp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (format === 'json') {
    const payload = {
      import: {
        id,
        filename:          imp.filename,
        type:              imp.type,
        status:            imp.status,
        needs_review_count: imp.needs_review_count,
        created_at:        imp.created_at,
      },
      rows: (rows ?? []).map(row => {
        const d = row.raw_data as ParsedProduct
        return {
          row:                row.row_index + 1,
          action:             row.action,
          match_type:         row.match_type,
          confidence_score:   row.confidence_score,
          confidence_reason:  row.confidence_reason,
          normalised_brand:   row.normalised_brand,
          normalised_category: row.normalised_category,
          name:               d.name,
          model:              d.model,
          sku:                d.sku,
          brand:              d.brand,
          category:           d.category,
          product_type:       d.product_type,
          ac_type:            d.ac_type,
          btu:                d.btu,
          price:              d.price,
          cost_price:         d.cost_price,
          error:              row.error_message,
        }
      }),
    }
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type':        'application/json',
        'Content-Disposition': `attachment; filename="import-report-${id.slice(0, 8)}.json"`,
      },
    })
  }

  // CSV
  const headers = ['#', 'Action', 'Matched By', 'Confidence', 'Reason', 'Name', 'Model', 'SKU', 'Brand', 'Norm Brand', 'Category', 'Norm Category', 'Product Type', 'AC Type', 'BTU', 'Price', 'Cost Price', 'Error']
  const csvRows = [headers.join(',')]

  for (const row of (rows ?? [])) {
    const d = row.raw_data as ParsedProduct
    csvRows.push([
      row.row_index + 1,
      row.action,
      row.match_type ?? '',
      row.confidence_score ?? '',
      escapeCsv(row.confidence_reason),
      escapeCsv(d.name),
      escapeCsv(d.model),
      escapeCsv(d.sku),
      escapeCsv(d.brand),
      escapeCsv(row.normalised_brand),
      escapeCsv(d.category),
      escapeCsv(row.normalised_category),
      escapeCsv(d.product_type),
      escapeCsv(d.ac_type),
      d.btu ?? '',
      d.price ?? '',
      d.cost_price ?? '',
      escapeCsv(row.error_message),
    ].map(v => escapeCsv(v)).join(','))
  }

  const csv      = csvRows.join('\r\n')
  const filename = `import-report-${id.slice(0, 8)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
