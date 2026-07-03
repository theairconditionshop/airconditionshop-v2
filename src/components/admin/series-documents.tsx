'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import type { SeriesDocument } from '@/types/database'

interface Props {
  seriesId: string
  initial: SeriesDocument[]
}

/** Documents / downloads manager — persists immediately against the series documents API. */
export default function SeriesDocuments({ seriesId, initial }: Props) {
  const [docs, setDocs] = useState<SeriesDocument[]>(
    [...initial].sort((a, b) => a.display_order - b.display_order)
  )
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (title.trim()) fd.append('title', title.trim())
    const res = await fetch(`/api/admin/series/${seriesId}/documents`, { method: 'POST', body: fd })
    if (res.ok) {
      const doc: SeriesDocument = await res.json()
      setDocs(prev => [...prev, doc])
      setTitle('')
      toast.success('Document uploaded')
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Upload failed')
    }
    setUploading(false)
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/series/${seriesId}/documents?docId=${id}`, { method: 'DELETE' })
    if (res.ok) { setDocs(prev => prev.filter(d => d.id !== id)); toast.success('Document removed') }
    else toast.error('Failed to remove')
  }

  async function move(idx: number, dir: -1 | 1) {
    const next = [...docs]
    const j = idx + dir
    if (j < 0 || j >= next.length) return
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setDocs(next)
    await fetch(`/api/admin/series/${seriesId}/documents`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder: next.map((d, i) => ({ id: d.id, display_order: i })) }),
    })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Downloads &amp; documents <span className="text-slate-400 font-normal">— PDFs, manuals, spec sheets</span></label>

      {docs.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
          {docs.map((d, idx) => (
            <li key={d.id} className="flex items-center gap-2 px-3 py-2">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-700 flex-1 truncate hover:text-blue-600">{d.title}</a>
              {d.file_type && <span className="text-[10px] uppercase font-semibold text-slate-400">{d.file_type}</span>}
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer">↑</button>
              <button onClick={() => move(idx, 1)} disabled={idx === docs.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer">↓</button>
              <button onClick={() => remove(d.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 items-center">
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Document title (optional)"
          className="h-9 flex-1 rounded-md border border-slate-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,image/png,image/jpeg" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 text-sm text-blue-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
        </button>
      </div>
    </div>
  )
}
