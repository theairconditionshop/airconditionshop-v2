'use client'

import { Info } from 'lucide-react'
import { MAX_UPLOAD_MB } from '@/lib/media/client'

interface Props {
  /** e.g. "1500 × 1500 px (square preferred)" or ["Desktop: 1920 × 1080 px", "Mobile: 900 × 1600 px"] */
  dimensions?: string | string[]
  /** Include SVG in the formats line (logos only) */
  allowSvg?: boolean
  className?: string
}

/**
 * Small info panel shown under every admin upload field so admins always
 * know the accepted formats, size limit, and recommended dimensions.
 */
export default function UploadRequirements({ dimensions, allowSvg = false, className = '' }: Props) {
  const dims = dimensions == null ? [] : Array.isArray(dimensions) ? dimensions : [dimensions]
  return (
    <div className={`rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500 ${className}`}>
      <p className="flex items-center gap-1.5 font-semibold text-slate-600 mb-1">
        <Info className="w-3 h-3 text-slate-400" aria-hidden="true" /> Image Requirements
      </p>
      <p><span className="font-medium text-slate-600">Formats:</span> JPG, JPEG, PNG, WEBP{allowSvg ? ' (SVG for logos only)' : ''}</p>
      <p><span className="font-medium text-slate-600">Maximum file size:</span> {MAX_UPLOAD_MB} MB</p>
      {dims.map(d => (
        <p key={d}><span className="font-medium text-slate-600">Recommended:</span> {d}</p>
      ))}
      <p className="mt-1 text-slate-400">Images are automatically optimized to WebP. Large images may take a few seconds to process.</p>
    </div>
  )
}
