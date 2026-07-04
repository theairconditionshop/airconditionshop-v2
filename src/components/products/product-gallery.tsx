'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return a.display_order - b.display_order
  })

  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(0)

  function goTo(idx: number) {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  function prev() { goTo((activeIdx - 1 + sorted.length) % sorted.length) }
  function next() { goTo((activeIdx + 1) % sorted.length) }

  if (!sorted.length) {
    return (
      <div className="aspect-square border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center gap-3" style={{ borderRadius: 2 }}>
        <span className="text-[11px] font-semibold tracking-[0.25em] text-slate-300 uppercase">
          {productName}
        </span>
        <div className="w-12 h-px bg-slate-200" />
        <span className="text-[10px] tracking-[0.2em] text-slate-300 uppercase">No images yet</span>
      </div>
    )
  }

  const active = sorted[activeIdx]

  return (
    <div className="space-y-3">
      {/* Hero image */}
      <div className="relative aspect-square border border-slate-200 overflow-hidden bg-slate-50 group" style={{ borderRadius: 2 }}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            variants={{
              enter:  (d: number) => ({ x: d * 40, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:   (d: number) => ({ x: -d * 40, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={active.url}
              alt={active.alt_text || productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={activeIdx === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
              style={{ borderRadius: 2 }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
              style={{ borderRadius: 2 }}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'transition-all duration-200 cursor-pointer',
                    i === activeIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  )}
                  style={{ borderRadius: 1 }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => goTo(i)}
              className={cn(
                'relative aspect-square overflow-hidden border-2 transition-all duration-200 cursor-pointer',
                i === activeIdx
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-slate-300'
              )}
              style={{ borderRadius: 2 }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.thumbnail_url ?? img.url}
                alt={img.alt_text || `${productName} view ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
