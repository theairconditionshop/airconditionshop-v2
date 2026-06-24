'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Loader2, Play, Send, Download, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, AlertTriangle, RefreshCw, FileJson,
} from 'lucide-react'
import type { ParsedProduct } from '@/services/ai/gemini-product-parser'

type ImportStatus = 'pending' | 'parsing' | 'preview' | 'importing' | 'complete' | 'failed'
type RowAction    = 'create' | 'update' | 'skip' | 'review' | 'failed'

interface ImportRecord {
  id:                 string
  type:               'catalogue' | 'price_list'
  status:             ImportStatus
  filename:           string
  replace_existing:   boolean
  parsed_count:       number
  created_count:      number
  updated_count:      number
  skipped_count:      number
  failed_count:       number
  needs_review_count: number
  error_message:      string | null
}

interface ImportRow {
  id:                  string
  row_index:           number
  action:              RowAction
  match_type:          'sku' | 'model' | 'name' | null
  matched_product_id:  string | null
  raw_data:            ParsedProduct
  error_message:       string | null
  confidence_score:    number | null
  confidence_reason:   string | null
  normalised_brand:    string | null
  normalised_category: string | null
  product?:            { id: string; name: string; slug: string } | null
}

interface Props {
  initialImport: ImportRecord
  initialRows:   ImportRow[]
}

// ── Confidence badge ──────────────────────────────────────────────────────────
function ConfidenceBadge({ score }: { score: number | null }) {
  if (score == null) return null
  const color = score >= 90 ? 'bg-emerald-100 text-emerald-700'
    : score >= 70           ? 'bg-amber-100 text-amber-700'
    :                         'bg-red-100 text-red-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${color}`}>
      {score}
    </span>
  )
}

// ── Action badge / selector ───────────────────────────────────────────────────
function ActionBadge({ action, onChange }: { action: RowAction; onChange?: (a: RowAction) => void }) {
  const cfg: Record<RowAction, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    skip:   'bg-slate-100 text-slate-500',
    review: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-600',
  }
  if (!onChange || action === 'failed') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${cfg[action]}`}>
        {action}
      </span>
    )
  }
  return (
    <select
      value={action}
      onChange={e => onChange(e.target.value as RowAction)}
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer outline-none ${cfg[action]}`}
    >
      <option value="create">create</option>
      <option value="update">update</option>
      <option value="review">review</option>
      <option value="skip">skip</option>
    </select>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────
function ExpandedRow({ row, pdfType }: { row: ImportRow; pdfType: 'catalogue' | 'price_list' }) {
  const d = row.raw_data
  return (
    <div className="bg-slate-50 border-t border-slate-100">
      {/* Confidence breakdown */}
      {row.confidence_reason && (
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ConfidenceBadge score={row.confidence_score} />
          <span>{row.confidence_reason}</span>
          {row.normalised_brand && row.normalised_brand !== d.brand && (
            <span className="ml-2 text-violet-600">Brand normalised: <strong>{row.normalised_brand}</strong></span>
          )}
          {row.normalised_category && row.normalised_category !== d.category && (
            <span className="ml-2 text-violet-600">Category normalised: <strong>{row.normalised_category}</strong></span>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 text-xs text-slate-600">
        {d.brand        && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Brand</span>{d.brand}</div>}
        {d.category     && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Category</span>{d.category}</div>}
        {d.model        && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Model</span>{d.model}</div>}
        {d.sku          && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">SKU</span>{d.sku}</div>}
        {d.product_type && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Product Type</span>{d.product_type}</div>}
        {d.ac_type      && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">AC Type</span>{d.ac_type}</div>}
        {d.btu          && <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">BTU</span>{d.btu.toLocaleString()}</div>}
        {pdfType === 'price_list' && d.price != null &&
          <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Price</span>€{d.price.toFixed(2)}</div>}
        {pdfType === 'price_list' && d.cost_price != null &&
          <div><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Cost Price</span>€{d.cost_price.toFixed(2)}</div>}
        {d.description &&
          <div className="col-span-full"><span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Description</span>{d.description}</div>}
        {d.applications?.length > 0 &&
          <div className="col-span-full">
            <span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Applications</span>
            <ul className="list-disc list-inside space-y-0.5">{d.applications.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>}
        {d.features?.length > 0 &&
          <div className="col-span-full">
            <span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Features</span>
            <ul className="list-disc list-inside space-y-0.5">{d.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>}
        {d.specifications && Object.keys(d.specifications).length > 0 &&
          <div className="col-span-full">
            <span className="font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Specifications</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {Object.entries(d.specifications).map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-slate-400">{k}:</span><span>{v}</span></div>
              ))}
            </div>
          </div>}
      </div>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function ImportWizard({ initialImport, initialRows }: Props) {
  const [imp,        setImp]        = useState<ImportRecord>(initialImport)
  const [rows,       setRows]       = useState<ImportRow[]>(initialRows)
  const [expanded,   setExpanded]   = useState<Set<string>>(new Set())
  const [replaceAll, setReplaceAll] = useState(imp.replace_existing)
  const [loading,    setLoading]    = useState(false)
  const [filter,     setFilter]     = useState<RowAction | 'all'>('all')
  const router = useRouter()

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const refreshImport = useCallback(async () => {
    const res  = await fetch(`/api/admin/product-import/${imp.id}`)
    const data = await res.json()
    if (data.import) setImp(data.import)
    if (data.rows)   setRows(data.rows)
  }, [imp.id])

  async function handleParse() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/product-import/${imp.id}/parse`, { method: 'POST' })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Parse failed')
      }
      toast.success('Parsing complete')
      await refreshImport()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Parse failed')
      await refreshImport()
    }
    setLoading(false)
  }

  async function handleExecute() {
    setLoading(true)
    try {
      await fetch(`/api/admin/product-import/${imp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replace_existing: replaceAll }),
      })

      const res  = await fetch(`/api/admin/product-import/${imp.id}/execute`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Execute failed')

      toast.success(`Import complete: ${data.created} created, ${data.updated} updated`)
      await refreshImport()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
      await refreshImport()
    }
    setLoading(false)
  }

  async function updateRowAction(rowId: string, action: RowAction) {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, action } : r))
    await fetch(`/api/admin/product-import/${imp.id}/rows/${rowId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
  }

  const isParsing   = imp.status === 'parsing' || (loading && imp.status === 'pending')
  const isImporting = imp.status === 'importing' || (loading && imp.status === 'preview')
  const canParse    = ['pending', 'failed'].includes(imp.status) && !loading
  const canExecute  = imp.status === 'preview' && !loading

  const actionCounts = rows.reduce(
    (acc, r) => { acc[r.action] = (acc[r.action] ?? 0) + 1; return acc },
    {} as Record<string, number>,
  )

  const visibleRows = filter === 'all' ? rows : rows.filter(r => r.action === filter)

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-semibold text-slate-900">{imp.filename}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                imp.type === 'price_list' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
              }`}>
                {imp.type === 'price_list' ? 'Price List' : 'Catalogue'}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {imp.status === 'pending'   && 'Ready to parse — click Parse PDF to extract products with AI.'}
              {imp.status === 'parsing'   && 'Analysing PDF with Gemini AI — this may take up to 60 seconds…'}
              {imp.status === 'preview'   && `${rows.length} products extracted. Review and import.`}
              {imp.status === 'importing' && 'Importing products…'}
              {imp.status === 'complete'  && 'Import complete.'}
              {imp.status === 'failed'    && `Parse failed: ${imp.error_message}`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {imp.status === 'complete' && (
              <>
                <a
                  href={`/api/admin/product-import/${imp.id}/export?format=csv`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <Download className="w-4 h-4" /> CSV
                </a>
                <a
                  href={`/api/admin/product-import/${imp.id}/export?format=json`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <FileJson className="w-4 h-4" /> JSON
                </a>
              </>
            )}

            {(isParsing || isImporting) && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isParsing ? 'Parsing…' : 'Importing…'}
              </div>
            )}

            {canParse && (
              <button
                onClick={handleParse}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" /> Parse PDF
              </button>
            )}

            {imp.status === 'failed' && !loading && (
              <button
                onClick={handleParse}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Retry Parse
              </button>
            )}

            {canExecute && (
              <button
                onClick={handleExecute}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" /> Import Now
              </button>
            )}
          </div>
        </div>

        {/* Replace existing toggle */}
        {imp.status === 'preview' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
            <input
              id="replace"
              type="checkbox"
              checked={replaceAll}
              onChange={e => setReplaceAll(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <label htmlFor="replace" className="text-sm font-medium text-slate-700 cursor-pointer">
                Replace Existing Data
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                When off: only null/empty fields on existing products are updated. When on: all fields are overwritten.
                Manually-edited products are always protected unless this is enabled.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Report summary — complete */}
      {imp.status === 'complete' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Created',         value: imp.created_count,      color: 'text-green-600', bg: 'bg-green-50'  },
            { label: 'Updated',         value: imp.updated_count,      color: 'text-blue-600',  bg: 'bg-blue-50'   },
            { label: 'Skipped',         value: imp.skipped_count,      color: 'text-slate-500', bg: 'bg-slate-50'  },
            { label: 'Needs Review',    value: imp.needs_review_count, color: 'text-amber-600', bg: 'bg-amber-50'  },
            { label: 'Failed',          value: imp.failed_count,       color: 'text-red-500',   bg: 'bg-red-50'    },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
              <p className={`text-3xl font-bold ${color}`}>{value ?? 0}</p>
              <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview counts + filter bar */}
      {imp.status === 'preview' && rows.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {([
            { key: 'all',    label: 'All',          count: rows.length,                   color: 'bg-slate-100 text-slate-600 hover:bg-slate-200'  },
            { key: 'create', label: 'Create',        count: actionCounts.create  ?? 0,    color: 'bg-green-100 text-green-700 hover:bg-green-200'   },
            { key: 'update', label: 'Update',        count: actionCounts.update  ?? 0,    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'      },
            { key: 'review', label: 'Needs Review',  count: actionCounts.review  ?? 0,    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200'   },
            { key: 'skip',   label: 'Skip',          count: actionCounts.skip    ?? 0,    color: 'bg-slate-100 text-slate-500 hover:bg-slate-200'   },
          ] as const).map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key as RowAction | 'all')}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors cursor-pointer ${color} ${filter === key ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              {count} {label}
            </button>
          ))}
        </div>
      )}

      {/* Preview table */}
      {visibleRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Extracted Products</p>
            <p className="text-xs text-slate-400">{visibleRows.length} {filter !== 'all' ? `${filter} ` : ''}row{visibleRows.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-slate-50">
            {visibleRows.map(row => {
              const d        = row.raw_data
              const isExp    = expanded.has(row.id)
              const editable = imp.status === 'preview'

              return (
                <div key={row.id}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/40 transition-colors">
                    <span className="text-xs text-slate-300 w-5 shrink-0">{row.row_index + 1}</span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{d.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                        {d.model && <span>Model: {d.model}</span>}
                        {d.sku   && <span>SKU: {d.sku}</span>}
                        {d.brand && <span>{d.brand}</span>}
                        {d.ac_type && <span className="text-sky-600">{d.ac_type}</span>}
                        {d.btu     && <span className="text-sky-600">{d.btu.toLocaleString()} BTU</span>}
                        {row.match_type && (
                          <span className="text-blue-500">
                            Matched by {row.match_type}
                            {row.product?.name && ` → "${row.product.name}"`}
                          </span>
                        )}
                        {row.action === 'review' && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />Low confidence — manual review required
                          </span>
                        )}
                        {row.action === 'failed' && row.error_message && (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />{row.error_message}
                          </span>
                        )}
                      </div>
                    </div>

                    {imp.type === 'price_list' && d.price != null && (
                      <span className="text-sm font-medium text-slate-700 shrink-0">€{d.price.toFixed(2)}</span>
                    )}

                    <ConfidenceBadge score={row.confidence_score} />

                    <ActionBadge
                      action={row.action}
                      onChange={editable ? (a) => updateRowAction(row.id, a) : undefined}
                    />

                    <button
                      onClick={() => toggleExpand(row.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                    >
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExp && <ExpandedRow row={row} pdfType={imp.type} />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {imp.status === 'preview' && rows.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <XCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products extracted</p>
          <p className="text-sm text-slate-400 mt-1">The AI found no HVAC products in this PDF. Try re-parsing with a different type setting.</p>
        </div>
      )}

      {/* Filter empty state */}
      {imp.status === 'preview' && rows.length > 0 && visibleRows.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium">No rows match this filter</p>
        </div>
      )}

      {/* Parsing placeholder */}
      {isParsing && rows.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
          <p className="text-slate-600 font-medium">Gemini is reading your PDF…</p>
          <p className="text-sm text-slate-400 mt-1">This usually takes 15–60 seconds depending on PDF size.</p>
        </div>
      )}
    </div>
  )
}
