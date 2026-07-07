'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { RefreshCw, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { uploadMediaFile } from '@/lib/media/client'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  hint?: string
  aspectRatio?: string
  /** Recommended pixel width, e.g. 3840 */
  recommendedWidth?: number
  /** Recommended pixel height, e.g. 1646 */
  recommendedHeight?: number
  /** Aspect ratio label shown to the admin, e.g. "21:9" — defaults to a reduced form of width/height */
  aspectRatioLabel?: string
  /** Max upload size in MB shown to the admin (actual enforcement is separate, see handleFile) */
  maxSizeMb?: number
  /** Formats shown to the admin — actual validation is via the accept attribute below */
  formats?: string[]
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function reducedRatio(width: number, height: number): string {
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}

export default function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  aspectRatio = '16 / 9',
  recommendedWidth,
  recommendedHeight,
  aspectRatioLabel,
  maxSizeMb = 10,
  formats = ['JPG', 'PNG', 'WebP', 'AVIF'],
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragging, setDragging]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ratioLabel = aspectRatioLabel ?? (recommendedWidth && recommendedHeight ? reducedRatio(recommendedWidth, recommendedHeight) : null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (SVG, PNG, WebP, JPG)')
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be under ${maxSizeMb} MB`)
      return
    }

    setUploading(true)
    setProgress(10)

    const interval = setInterval(() =>
      setProgress(p => Math.min(p + 18, 88)), 220)

    // Only the network call is allowed to produce the "upload failed" toast.
    // Everything after a successful upload (state update) is handled outside
    // this try/catch so a bug there can never be misreported as an upload
    // failure when the file is already safely in Storage + the DB.
    //
    // Note what this function deliberately does NOT do: delete the old
    // image. The old (superseded) file is left alone — if the surrounding
    // form's Save is never clicked, fails, or the browser closes, the old
    // image must still be exactly where it was. Storage cleanup for files
    // no longer referenced by any saved record is handled entirely by the
    // scheduled orphan sweep (src/app/api/cron/cleanup-orphans/route.ts).
    let url: string
    try {
      url = await uploadMediaFile(file)
    } catch {
      clearInterval(interval)
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
      toast.error('Upload failed — please try again')
      return
    }

    clearInterval(interval)
    setProgress(100)
    onChange(url)
    toast.success('Image uploaded successfully')
    setUploading(false)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }, [onChange, maxSizeMb])

  function handleRemove() {
    // Same reasoning as above: clearing the field only updates local/draft
    // state. The file itself is left in Storage until the orphan sweep
    // confirms no saved record references it anymore.
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

      {(recommendedWidth || ratioLabel) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          {recommendedWidth && recommendedHeight && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Recommended Size</p>
              <p className="text-xs font-semibold text-slate-700">{recommendedWidth.toLocaleString()} × {recommendedHeight.toLocaleString()} px</p>
            </div>
          )}
          {ratioLabel && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Aspect Ratio</p>
              <p className="text-xs font-semibold text-slate-700">{ratioLabel}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Formats</p>
            <p className="text-xs font-semibold text-slate-700">{formats.join(' ')}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Maximum Size</p>
            <p className="text-xs font-semibold text-slate-700">{maxSizeMb} MB</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/webp,image/jpeg,image/avif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {value ? (
        /* ── Preview state ── */
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
          <div style={{ aspectRatio, position: 'relative' }}>
            <Image
              src={value}
              alt="Uploaded image preview"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={value.toLowerCase().endsWith('.svg')}
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
                <p className="text-xs text-slate-400 mt-1">{formats.join(', ')} · Max {maxSizeMb} MB</p>
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
