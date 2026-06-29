'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface PremiumImageProps {
  src?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  className?: string
  containerClassName?: string
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  shadow?: boolean
  hoverZoom?: boolean
  objectPosition?: string
  placeholderLabel?: string
  placeholderIcon?: React.ReactNode
  aspectRatio?: string
}

const ROUNDED_MAP = {
  none: '',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}

export function PremiumImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className = '',
  containerClassName = '',
  rounded = 'xl',
  shadow = true,
  hoverZoom = true,
  objectPosition = 'center',
  placeholderLabel,
  placeholderIcon,
  aspectRatio,
}: PremiumImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const roundedClass = ROUNDED_MAP[rounded]
  const shadowClass = shadow ? 'shadow-xl shadow-black/10' : ''

  if (!src || errored) {
    return (
      <div
        className={`relative overflow-hidden ${roundedClass} ${shadowClass} ${containerClassName}`}
        style={aspectRatio ? { aspectRatio } : undefined}
        role="img"
        aria-label={placeholderLabel ?? alt}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center">
            {placeholderIcon ?? <ImageOff className="w-5 h-5 text-slate-400" aria-hidden="true" />}
          </div>
          {placeholderLabel && (
            <p className="text-[11px] font-medium text-slate-400 tracking-wide text-center px-4">{placeholderLabel}</p>
          )}
        </div>
      </div>
    )
  }

  const imgClass = [
    'object-cover transition-all duration-700 ease-out',
    loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]',
    hoverZoom ? 'group-hover:scale-[1.03]' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={`relative overflow-hidden ${roundedClass} ${shadowClass} ${hoverZoom ? 'group' : ''} ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton shown while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse" aria-hidden="true" />
      )}

      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={85}
          style={{ objectFit: 'cover', objectPosition }}
          className={imgClass}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          quality={85}
          style={{ objectFit: 'cover', objectPosition }}
          className={imgClass}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}
