'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateImageFile, uploadFileStaged, UploadError, STAGE_LABELS, type UploadStage } from '@/lib/media/client'
import UploadRequirements from '@/components/admin/upload-requirements'

export default function MediaLibrary() {
  const [stage, setStage] = useState<UploadStage | null>(null)
  const [progress, setProgress] = useState(0)
  const uploading = stage !== null
  const [cleaning, setCleaning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleCleanup() {
    setCleaning(true)
    try {
      const res = await fetch('/api/cron/cleanup-orphans', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(body.error || 'Cleanup failed')
        return
      }
      toast.success(
        body.deleted > 0
          ? `Removed ${body.deleted} orphaned file(s)`
          : 'No orphaned files found — nothing to clean up'
      )
      router.refresh()
    } catch {
      toast.error('Cleanup failed — please try again')
    } finally {
      setCleaning(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    // Validate every file up front — invalid files never reach the server.
    setStage('validating')
    for (const f of Array.from(files)) {
      const invalid = await validateImageFile(f, { allowSvg: true, allowPdf: true })
      if (invalid) { setStage(null); toast.error(invalid); return }
    }

    // Upload sequentially so each file gets real staged progress and each
    // request stays well under the platform body limit.
    let ok = 0
    for (const f of Array.from(files)) {
      try {
        const data = await uploadFileStaged({
          url: '/api/admin/media', fieldName: 'files', file: f,
          onStage: setStage, onProgress: setProgress,
        }) as { results?: { url?: string; error?: string }[] } | null
        const first = data?.results?.[0]
        if (!first?.url) throw new UploadError(first?.error || `"${f.name}" upload returned no URL`)
        ok++
      } catch (err) {
        setStage(null)
        setProgress(0)
        toast.error(err instanceof UploadError ? err.message : `"${f.name}" failed — see browser console for details`)
        if (ok > 0) router.refresh()
        return
      }
    }
    setStage('complete')
    toast.success(`${ok} file(s) uploaded`)
    router.refresh()
    setStage(null)
    setProgress(0)
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 focus-visible:outline-2 focus-visible:outline-sky-500 transition-colors"
        role="button"
        tabIndex={0}
        aria-label="Upload media files — click, press Enter, or drop files here"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
        <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden"
          onChange={e => handleFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-sky-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-700 text-sm" aria-live="polite">
              {stage
                ? stage === 'uploading' ? `Uploading… ${progress}%` : STAGE_LABELS[stage]
                : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Images (JPG, PNG, WebP), SVG logos and PDFs supported</p>
          </div>
          {!uploading && <Button variant="outline" size="sm" type="button">Choose Files</Button>}
        </div>
      </div>

      <UploadRequirements allowSvg />


      {/* Placeholder grid */}
      <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
        <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Uploaded media will appear here.</p>
        <p className="text-xs text-slate-300 mt-1">
          Media is stored in Supabase Storage. Configure your bucket in the Supabase dashboard.
        </p>
      </div>

      {/* Orphan cleanup — runs automatically once a day; this button triggers it on demand */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
        <div>
          <p className="text-sm font-medium text-slate-700">Storage cleanup</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Removes uploaded files no longer referenced by any saved page, product, brand, or campaign.
            Files uploaded in the last 48 hours are never touched, so an in-progress edit is always safe.
            Runs automatically every night — use this to run it immediately.
          </p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={handleCleanup} loading={cleaning} className="shrink-0 gap-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          Run Cleanup Now
        </Button>
      </div>
    </div>
  )
}
