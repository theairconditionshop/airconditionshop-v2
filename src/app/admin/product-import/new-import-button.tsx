'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NewImportButton() {
  const [open,    setOpen]    = useState(false)
  const [file,    setFile]    = useState<File | null>(null)
  const [type,    setType]    = useState<'auto' | 'catalogue' | 'price_list'>('auto')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (type !== 'auto') fd.append('type', type)

      const res  = await fetch('/api/admin/product-import', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      toast.success('PDF uploaded — ready to parse')
      router.push(`/admin/product-import/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        New Import
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !loading && setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Upload Supplier PDF</h2>
              {!loading && (
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>

            {/* File drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div>
                  <p className="font-medium text-blue-700 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Click to select a PDF</p>
                  <p className="text-xs text-slate-400 mt-1">Max 20 MB</p>
                </div>
              )}
            </div>

            {/* Type override */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">PDF Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as typeof type)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto-detect (recommended)</option>
                <option value="catalogue">Information Catalogue</option>
                <option value="price_list">Price List</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Catalogues update existing products only. Price lists can also create new products.
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full flex items-center justify-center gap-2 h-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : 'Upload & Continue'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
