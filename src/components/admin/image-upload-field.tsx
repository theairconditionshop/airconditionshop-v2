'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { RefreshCw, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  hint?: string
  aspectRatio?: string
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('files', file)
  const res = await fetch('/api/admin/media', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  const url = data.results?.[0]?.url
  if (!url) throw new Error('Upload returned no URL')
  return url as string
}

function deleteFile(url: string) {
  // Fire-and-forget — silently cleans up orphaned storage files
  fetch('/api/admin/media', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).catch(() => null)
}

export default function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  aspectRatio = '16 / 9',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragging, setDragging]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB')
      return
    }

    const oldUrl = value
    setUploading(true)
    setProgress(10)

    const interval = setInterval(() =>
      setProgress(p => Math.min(p + 18, 88)), 220)

    try {
      const url = await uploadFile(file)
      clearInterval(interval)
      setProgress(100)
      onChange(url)
      if (oldUrl) deleteFile(oldUrl)
      toast.success('Image uploaded successfully')
    } catch {
      clearInterval(interval)
      toast.error('Upload failed — please try again')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [value, onChange])

  function handleRemove() {
    if (value) deleteFile(value)
    onChange(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {value ? (
        /* ── Preview state ── */
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
          <div style={{ aspectRatio }}>
            <Image
              src={value}
              alt="Uploaded image preview"
              fill
              className="object-cover"
            />
          </div>

          {/* Overlay bar — always visible on mobile, hover on desktop */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-3 py-2.5
                          bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent
                          opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-sky-300
                         transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </button>

            <span className="text-white/25 text-xs">|</span>

            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300
                         transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center
                            bg-slate-950/70 backdrop-blur-sm gap-3">
              <div className="w-32 space-y-2">
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-white/70 text-center">Uploading {progress}%</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Upload zone ── */
        <div
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl
                      border-2 border-dashed cursor-pointer select-none transition-all duration-150
                      ${dragging
                        ? 'border-sky-400 bg-sky-50 scale-[1.01]'
                        : 'border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-sky-50/40'
                      }`}
          style={{ aspectRatio }}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 px-6 w-full">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="w-full max-w-[160px] space-y-1.5">
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">Uploading {progress}%</p>
              </div>
            </div>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                              ${dragging ? 'bg-sky-100' : 'bg-slate-100'}`}>
                <ImageIcon className={`w-6 h-6 transition-colors ${dragging ? 'text-sky-500' : 'text-slate-400'}`} />
              </div>
              <div className="text-center px-4">
                <p className={`text-sm font-semibold transition-colors ${dragging ? 'text-sky-600' : 'text-slate-600'}`}>
                  {dragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Max 10 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {hint && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  )
}
