'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, X, Star, Loader2, ImageIcon, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImage {
  id: string
  url: string
  thumbnail_url: string | null
  alt_text: string | null
  is_primary: boolean
  display_order: number
}

interface Props {
  productId: string
  initialImages?: ProductImage[]
}

const MAX_IMAGES = 6

export default function ProductImageGallery({ productId, initialImages = [] }: Props) {
  const [images, setImages]     = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => a.display_order - b.display_order)
  )
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [dragging, setDragging]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canAdd = images.length < MAX_IMAGES

  async function uploadFile(file: File) {
    if (!canAdd) { toast.error(`Maximum ${MAX_IMAGES} images`); return }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowed.includes(file.type)) { toast.error('Unsupported file type'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10 MB)'); return }

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/admin/products/${productId}/images`, { method: 'POST', body: fd })
    if (res.ok) {
      const img: ProductImage = await res.json()
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
    const remaining = MAX_IMAGES - images.length
    Array.from(files).slice(0, remaining).forEach(f => uploadFile(f))
  }

  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, { method: 'DELETE' })
    if (res.ok) {
      setImages(prev => {
        const next = prev.filter(i => i.id !== imageId)
        // promote next primary if needed
        if (prev.find(i => i.id === imageId)?.is_primary && next.length > 0) {
          next[0] = { ...next[0], is_primary: true }
        }
        return next
      })
      toast.success('Image removed')
    } else {
      toast.error('Failed to remove image')
    }
  }

  async function handleSetPrimary(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setPrimary: imageId }),
    })
    if (res.ok) {
      setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })))
      toast.success('Primary image set')
    }
  }

  // Drag-to-reorder
  function handleDragStart(id: string) { setDragging(id) }
  function handleDragEnd() { setDragging(null) }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragging || dragging === targetId) return
    setImages(prev => {
      const from  = prev.findIndex(i => i.id === dragging)
      const to    = prev.findIndex(i => i.id === targetId)
      if (from === -1 || to === -1) return prev
      const next  = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next.map((img, idx) => ({ ...img, display_order: idx }))
    })
  }

  async function persistOrder(newOrder: ProductImage[]) {
    await fetch(`/api/admin/products/${productId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder: newOrder.map((img, i) => ({ id: img.id, display_order: i })) }),
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Product Images</h3>
          <p className="text-xs text-slate-400 mt-0.5">{images.length}/{MAX_IMAGES} images · First image is the primary/featured image</p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(img.id)}
              onDragEnd={() => { handleDragEnd(); persistOrder(images) }}
              onDragOver={e => handleDragOver(e, img.id)}
              className={cn(
                'group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-grab active:cursor-grabbing',
                img.is_primary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300',
                dragging === img.id && 'opacity-40 scale-95'
              )}
            >
              <Image src={img.thumbnail_url ?? img.url} alt={img.alt_text || `Product image ${idx + 1}`} fill sizes="120px" className="object-cover" />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-1">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      title="Set as primary"
                      className="w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    title="Remove image"
                    className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary badge */}
              {img.is_primary && (
                <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Main
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute bottom-1.5 right-1.5 text-white/0 group-hover:text-white/70 transition-colors">
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone — shown if can add more */}
      {canAdd && (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl transition-colors duration-200 cursor-pointer',
            dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50',
            uploading && 'pointer-events-none'
          )}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <div className="flex flex-col items-center gap-2 py-8">
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500">Uploading…</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">Drop images here or click to upload</p>
                <p className="text-xs text-slate-400">JPG, PNG, WebP, AVIF · Max 10 MB each · {MAX_IMAGES - images.length} slot{MAX_IMAGES - images.length !== 1 ? 's' : ''} remaining</p>
              </>
            )}
          </div>
        </div>
      )}

      {images.length === 0 && !canAdd && (
        <p className="text-sm text-slate-400 text-center py-4">Maximum images reached</p>
      )}
    </div>
  )
}
