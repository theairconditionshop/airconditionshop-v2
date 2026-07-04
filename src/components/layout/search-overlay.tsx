'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, ArrowRight, Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchProduct {
  id: string
  name: string
  slug: string
  href?: string | null
  sku: string | null
  retail_price: number | null
  original_price: number | null
  price_visibility: string | null
  price_hidden: boolean
  currency: string
  cooling_btu: number | null
  product_type: string | null
  energy_rating: string | null
  brand: { name: string; slug: string } | null
  category: { name: string; slug: string } | null
  images: { url: string; is_primary: boolean }[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<SearchProduct[]>([])
  const [loading, setLoading]       = useState(false)
  const [searched, setSearched]     = useState(false)
  const inputRef                    = useRef<HTMLInputElement>(null)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearched(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setSearched(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 280)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Panel — fullscreen on mobile, top-panel on desktop */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 lg:inset-auto lg:top-0 lg:left-0 lg:right-0 z-[201] bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            {/* Search input row */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
              <div className="flex items-center gap-3 py-4 border-b border-slate-100">
                <Search aria-hidden="true" className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={handleChange}
                  placeholder="Search products, brands, SKU…"
                  className="flex-1 text-lg text-slate-900 placeholder:text-slate-400 bg-transparent outline-none border-none min-w-0"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search input"
                />
                {loading && <Loader2 aria-hidden="true" className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer" style={{ borderRadius: 2 }}
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable results area */}
            <div className="flex-1 overflow-y-auto lg:max-h-[70vh]">
              <div className="max-w-3xl mx-auto px-4 sm:px-6">

                {/* Results */}
                {(results.length > 0 || (searched && !loading)) && (
                  <div className="py-4">
                    {results.length > 0 ? (
                      <>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          {results.length} result{results.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-1">
                          {results.map(product => {
                            const img = product.images?.find(i => i.is_primary) || product.images?.[0]
                            return (
                              <Link
                                key={product.id}
                                href={product.href ?? `/products/${product.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-4 px-3 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors group" style={{ borderRadius: 2 }}
                              >
                                {/* Thumbnail */}
                                <div className="flex-none w-12 h-12 bg-slate-100 overflow-hidden border border-slate-100 shrink-0" style={{ borderRadius: 2 }}>
                                  {img ? (
                                    <Image src={img.url} alt={product.name} width={48} height={48}
                                      className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight px-1">
                                        {product.brand?.name?.slice(0, 4) ?? 'AC'}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Name + meta */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    {product.brand && (
                                      <span className="text-xs text-slate-400">{product.brand.name}</span>
                                    )}
                                    {product.category && !product.cooling_btu && (
                                      <span className="text-xs text-slate-400">· {product.category.name}</span>
                                    )}
                                    {product.cooling_btu && (
                                      <span className="text-xs text-slate-400">· {product.cooling_btu.toLocaleString()} BTU</span>
                                    )}
                                  </div>
                                </div>

                                {/* Price / badge */}
                                <div className="flex-none flex items-center gap-2 shrink-0">
                                  {product.energy_rating && (
                                    <span className="hidden sm:inline text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                      {product.energy_rating}
                                    </span>
                                  )}
                                  {product.price_hidden ? (
                                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-400 whitespace-nowrap">
                                      <Lock aria-hidden="true" className="w-3 h-3" /> Trade
                                    </span>
                                  ) : (() => {
                                    const displayPrice = product.retail_price ?? product.original_price
                                    return displayPrice != null ? (
                                      <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                                        {new Intl.NumberFormat('en-MT', { style: 'currency', currency: product.currency || 'EUR', maximumFractionDigits: 2 }).format(displayPrice)}
                                      </span>
                                    ) : null
                                  })()}
                                  <ArrowRight aria-hidden="true" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <Link
                            href={`/products?search=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors py-2"
                          >
                            <Search aria-hidden="true" className="w-4 h-4" />
                            See all results for &quot;{query}&quot;
                            <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-slate-100 flex items-center justify-center mx-auto mb-4" style={{ borderRadius: 2 }}>
                          <Search className="w-5 h-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <p className="text-slate-700 font-semibold mb-1">No results found</p>
                        <p className="text-slate-400 text-sm mb-4">
                          No products matched <strong>&quot;{query}&quot;</strong>
                        </p>
                        <Link
                          href="/products"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Browse all products <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions when empty */}
                {!searched && query.length < 2 && (
                  <div className="py-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Popular searches</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['9000 BTU', '12000 BTU', '18000 BTU', 'Heat Pump', 'Copper Pipe', 'Cable Trunking', 'Isolator Switch', 'Wall Bracket'].map(term => (
                        <button
                          key={term}
                          onClick={() => { setQuery(term); doSearch(term) }}
                          className="px-3 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 transition-colors cursor-pointer" style={{ borderRadius: 2 }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Browse by brand</p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/brands"
                        onClick={onClose}
                        className="px-3 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors" style={{ borderRadius: 2 }}
                      >
                        Browse all brands →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
