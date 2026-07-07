'use client'

/**
 * Single shared client for every admin upload surface (ImageUploadField,
 * campaign hero/gallery, product/series galleries). Do not re-implement
 * fetch/parse logic per component — import these instead.
 *
 * Deletion is intentionally NOT exposed here for "replace" flows. Storage
 * cleanup for superseded/removed images is handled exclusively by the
 * orphan sweep (see src/app/api/cron/cleanup-orphans/route.ts), which only
 * removes files no longer referenced anywhere in the database. Components
 * must never delete a file the instant a new one is chosen or "Remove" is
 * clicked — doing so destroys the old file even if the surrounding form is
 * never saved (Cancel, browser close, failed save all left the old image
 * gone). See product/series image galleries for the one legitimate
 * exception: those have no draft/Save step — each add/remove is already an
 * immediately-persisted, explicit CRUD action, not part of an unsaved form.
 */

export async function uploadMediaFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('files', file)
  const res = await fetch('/api/admin/media', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Upload request failed')
  const data = await res.json()
  // The media API returns HTTP 200 even when an individual file fails
  // validation — the per-file outcome is only visible in results[0].
  const first = data.results?.[0]
  if (!first?.url) throw new Error(first?.error || 'Upload returned no URL')
  return first.url as string
}
