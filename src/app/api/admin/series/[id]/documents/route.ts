import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin-guard'

const ACCEPTED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png', 'image/jpeg',
])
const MAX_BYTES = 30 * 1024 * 1024
const MAX_DOCS  = 20

function extOf(type: string, name: string): string {
  if (type === 'application/pdf') return 'pdf'
  const m = name.split('.').pop()
  return (m && m.length <= 5 ? m : 'file').toLowerCase()
}

// POST /api/admin/series/[id]/documents — upload a document (PDF/manual/spec sheet)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id: seriesId } = await params
    const db = createAdminClient()

    const form = await request.formData()
    const file  = form.get('file') as File | null
    const title = (form.get('title') as string | null)?.trim()
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ACCEPTED.has(file.type)) return NextResponse.json({ error: `File type not allowed: ${file.type || 'unknown'}` }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 30 MB)' }, { status: 400 })

    const { count } = await db.from('series_documents').select('id', { count: 'exact', head: true }).eq('series_id', seriesId)
    if ((count ?? 0) >= MAX_DOCS) return NextResponse.json({ error: `Maximum ${MAX_DOCS} documents` }, { status: 400 })

    const ext   = extOf(file.type, file.name)
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const path  = `series/${seriesId}/docs/${token}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const up = await db.storage.from('media').upload(path, buffer, { contentType: file.type })
    if (up.error) return NextResponse.json({ error: `Storage error: ${up.error.message}` }, { status: 500 })

    const { data: url } = db.storage.from('media').getPublicUrl(path)
    const { data: doc, error } = await db.from('series_documents').insert({
      series_id:     seriesId,
      title:         title || file.name,
      url:           url.publicUrl,
      file_type:     ext,
      size_bytes:    file.size,
      display_order: count ?? 0,
    }).select().single()
    if (error) return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    return NextResponse.json(doc)
  } catch (err) {
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }
}

// DELETE /api/admin/series/[id]/documents?docId=xxx
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: seriesId } = await params
  const docId = new URL(request.url).searchParams.get('docId')
  if (!docId) return NextResponse.json({ error: 'docId required' }, { status: 400 })

  const db = createAdminClient()
  const { data: doc } = await db.from('series_documents').select('url').eq('id', docId).eq('series_id', seriesId).single()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const key = doc.url.split('/storage/v1/object/public/media/')[1]
  if (key) await db.storage.from('media').remove([key])
  await db.from('series_documents').delete().eq('id', docId)
  return NextResponse.json({ ok: true })
}

// PATCH /api/admin/series/[id]/documents — reorder
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: seriesId } = await params
  const body = await request.json()
  const db = createAdminClient()
  if (Array.isArray(body.reorder)) {
    await Promise.all(body.reorder.map(({ id, display_order }: { id: string; display_order: number }) =>
      db.from('series_documents').update({ display_order }).eq('id', id).eq('series_id', seriesId)))
  }
  return NextResponse.json({ ok: true })
}
