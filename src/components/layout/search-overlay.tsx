'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchProduct {
  id: string
  name: string
  slug: string
  sku: string | null
  retail_price: number | null
  currency: string
  cooling_btu: number | null
  energy_rating: string | null
  brand: { name: string; slug: string } | null
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
      setQuery('')
      setResults([])
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

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[201] bg-white shadow-2xl"
          >
            {/* Search input row */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 h-18 py-4">
                <Search aria-hidden="true" className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={handleChange}
                  placeholder="Search products, brands, SKU…"
                  className="flex-1 text-lg text-slate-900 placeholder:text-slate-400 bg-transparent outline-none border-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {loading && <Loader2 aria-hidden="true" className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              {(results.length > 0 || (searched && !loading)) && (
                <div className="pb-6 border-t border-slate-100 pt-4">
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
                              href={`/products/${product.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                              <div className="flex-none w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-100">
                                {img ? (
                                  <Image src={img.url} alt={product.name} width={48} height={48}
                                    className="w-full h-full object-contain p-1" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">AC</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {product.brand && <span className="text-xs text-slate-400">{product.brand.name}</span>}
                                  {product.sku && <span className="text-xs text-slate-300">· {product.sku}</span>}
                                  {product.cooling_btu && (
                                    <span className="text-xs text-slate-400">· {product.cooling_btu.toLocaleString()} BTU</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-none flex items-center gap-3">
                                {product.energy_rating && (
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {product.energy_rating}
                                  </span>
                                )}
                                {product.retail_price != null && (
                                  <span className="text-sm font-semibold text-slate-900">
                                    {new Intl.NumberFormat('en-MT', { style: 'currency', currency: product.currency || 'EUR', maximumFractionDigits: 0 }).format(product.retail_price)}
                                  </span>
                                )}
                                <ArrowRight aria-hidden="true" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                          href={`/products?search=${encodeURIComponent(query)}`}
                          onClick={onClose}
                          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Search aria-hidden="true" className="w-4 h-4" />
                          See all results for &quot;{query}&quot;
                          <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-slate-500 text-sm mb-3">
                        No products found for <strong>&quot;{query}&quot;</strong>
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
                <div className="pb-6 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Daikin', 'Mitsubishi', 'Panasonic', '9000 BTU', '12000 BTU', 'Heat Pump', 'Inverter'].map(term => (
                      <button
                        key={term}
                        onClick={() => { setQuery(term); doSearch(term) }}
                        className="px-3 py-1.5 text-sm text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-slate-100 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
