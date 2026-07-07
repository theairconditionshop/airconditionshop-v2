'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MediaLibrary() {
  const [uploading, setUploading] = useState(false)
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
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('files', f))
    const res = await fetch('/api/admin/media', { method: 'POST', body: formData })
    if (res.ok) {
      toast.success(`${files.length} file(s) uploaded`)
      router.refresh()
    } else {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 transition-colors"
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
            <p className="font-medium text-slate-700 text-sm">{uploading ? 'Uploading…' : 'Drop files here or click to browse'}</p>
            <p className="text-xs text-slate-400 mt-1">Images (JPG, PNG, WebP) and PDFs supported</p>
          </div>
          {!uploading && <Button variant="outline" size="sm" type="button">Choose Files</Button>}
        </div>
      </div>

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
