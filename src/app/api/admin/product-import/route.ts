import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { detectPdfType } from '@/services/ai/gemini-product-parser'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

// GET /api/admin/product-import — list imports
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('product_imports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/product-import — upload PDF + create import
export async function POST(req: NextRequest) {
  const profile = await requireAdmin()
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const typeOverride = formData.get('type') as string | null

  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 })
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'PDF must be under 20 MB' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const db = createAdminClient()

  // Detect type via Gemini (unless admin overrode it)
  let pdfType: 'catalogue' | 'price_list'
  if (typeOverride === 'catalogue' || typeOverride === 'price_list') {
    pdfType = typeOverride
  } else {
    try {
      pdfType = await detectPdfType(buffer)
    } catch {
      pdfType = 'catalogue'
    }
  }

  // Store PDF in Supabase storage
  const importId   = crypto.randomUUID()
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath   = `product-imports/${importId}/${safeName}`

  const { error: uploadError } = await db.storage
    .from('media')
    .upload(filePath, buffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
  }

  // Create import record
  const { data: imp, error: dbError } = await db
    .from('product_imports')
    .insert({
      id:         importId,
      type:       pdfType,
      status:     'pending',
      filename:   file.name,
      file_path:  filePath,
      created_by: profile.id,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(imp, { status: 201 })
}
