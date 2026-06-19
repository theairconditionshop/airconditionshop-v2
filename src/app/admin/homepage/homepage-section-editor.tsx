'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HomepageSectionEditor({ section }: { section: Record<string, unknown> }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(
    typeof section.content === 'object' && section.content !== null
      ? JSON.stringify(section.content, null, 2)
      : '{}'
  )
  const [saving, setSaving] = useState(false)

  async function save() {
    let parsed: unknown
    try { parsed = JSON.parse(content) }
    catch { toast.error('Invalid JSON'); return }
    setSaving(true)
    const res = await fetch(`/api/admin/homepage/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: parsed }),
    })
    if (res.ok) {
      toast.success('Section saved')
      router.refresh()
    } else {
      toast.error('Save failed')
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        <div>
          <span className="font-semibold text-slate-900 text-sm">{String(section.title || section.section_key)}</span>
          {section.subtitle != null && <p className="text-xs text-slate-400 mt-0.5">{String(section.subtitle)}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            section.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          )}>
            {section.is_active ? 'Active' : 'Hidden'}
          </span>
          <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4">
          <p className="text-xs text-slate-500">Edit the JSON content for this section. Keys depend on the section type.</p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
          />
          <Button variant="brand" size="sm" onClick={save} loading={saving}>Save Section</Button>
        </div>
      )}
    </div>
  )
}
