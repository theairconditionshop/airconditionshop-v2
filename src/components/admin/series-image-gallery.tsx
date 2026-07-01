'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, X, Star, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SeriesImage } from '@/types/database'

interface Props {
  seriesId: string
  colourId: string | null      // null = series-level hero gallery
  label: string
  initial: SeriesImage[]
}

const MAX = 8

/** Self-contained gallery that persists immediately against the series images API. */
export default function SeriesImageGallery({ seriesId, colourId, label, initial }: Props) {
  const [images, setImages] = useState<SeriesImage[]>(
    [...initial].sort((a, b) => a.display_order - b.display_order)
  )
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canAdd = images.length < MAX

  async function uploadFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowed.includes(file.type)) { toast.error('Unsupported file type'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10 MB)'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (colourId) fd.append('colour_id', colourId)
    const res = await fetch(`/api/admin/series/${seriesId}/images`, { method: 'POST', body: fd })
    if (res.ok) {
      const img: SeriesImage = await res.json()
      setImages(prev => [...prev, img])
      toast.success('Image uploaded')
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Upload failed')
    }
    setUploading(false)
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).slice(0, MAX - images.length).forEach(uploadFile)
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/series/${seriesId}/images?imageId=${id}`, { method: 'DELETE' })
    if (res.ok) { setImages(prev => prev.filter(i => i.id !== id)); toast.success('Image removed') }
    else toast.error('Failed to remove image')
  }

  async function setPrimary(id: string) {
    const res = await fetch(`/api/admin/series/${seriesId}/images`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setPrimary: id }),
    })
    if (res.ok) setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === id })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">{label} <span className="text-slate-400 font-normal">· {images.length}/{MAX}</span></p>
        {canAdd && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
            <Upload className="w-3 h-3" /> Upload
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden" onChange={e => handleFiles(e.target.files)} />

      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <div key={img.id} className={cn('group relative aspect-square rounded-lg overflow-hidden border-2',
              img.is_primary ? 'border-blue-500' : 'border-slate-200')}>
              <Image src={img.thumbnail_url ?? img.url} alt={img.alt_text || `${label} ${idx + 1}`} fill sizes="100px" className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1">
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  {!img.is_primary && (
                    <button type="button" onClick={() => setPrimary(img.id)} title="Set as primary"
                      className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 cursor-pointer">
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <button type="button" onClick={() => remove(img.id)} title="Remove"
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {img.is_primary && <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase">Main</div>}
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <button type="button" onClick={() => !uploading && inputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-lg py-5 flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-slate-50/50 transition-colors cursor-pointer">
          {uploading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
          <span className="text-xs text-slate-500">{uploading ? 'Uploading…' : 'Drop or click to upload'}</span>
        </button>
      )}
    </div>
  )
}
