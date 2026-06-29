'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'

const STORAGE_KEY = 'tacs_recently_viewed'
const MAX_ITEMS   = 6

export interface RecentItem {
  id:    string
  slug:  string
  name:  string
  image: string | null
  price: string | null
}

// Call this on the product page to record the view
export function recordView(item: RecentItem) {
  try {
    const raw   = localStorage.getItem(STORAGE_KEY)
    const list: RecentItem[] = raw ? JSON.parse(raw) : []
    const next  = [item, ...list.filter(i => i.id !== item.id)].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable — ignore
  }
}

export default function RecentlyViewed({ currentId }: { currentId?: string }) {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    try {
      const raw  = localStorage.getItem(STORAGE_KEY)
      const list: RecentItem[] = raw ? JSON.parse(raw) : []
      setItems(list.filter(i => i.id !== currentId).slice(0, 4))
    } catch {
      // ignore
    }
  }, [currentId])

  if (items.length === 0) return null

  return (
    <section className="mt-16 pt-10 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <h2 className="font-semibold text-slate-900 text-lg">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map(item => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <span className="text-slate-300 text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                {item.name}
              </p>
              {item.price && (
                <p className="mt-1 text-xs font-semibold text-slate-700">{item.price}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
