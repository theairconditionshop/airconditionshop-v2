'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GripVertical, Plus, Trash2, Save, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ImageUploadField from '@/components/admin/image-upload-field'

export interface HomepageCard {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  href: string
  display_order: number
  is_active: boolean
}

type DestOption = { label: string; href: string }
type DestOptions = { categories: DestOption[]; brands: DestOption[]; series: DestOption[]; campaigns: DestOption[] }

const DEST_TYPES = [
  { key: 'categories', label: 'Category' },
  { key: 'brands',     label: 'Brand' },
  { key: 'series',     label: 'Product Series' },
  { key: 'campaigns',  label: 'Campaign' },
  { key: 'custom',     label: 'Product / Custom URL' },
] as const

function destTypeFor(href: string): string {
  if (href.startsWith('/products/category/')) return 'categories'
  if (href.startsWith('/brands/'))            return 'brands'
  if (href.startsWith('/campaigns/'))         return 'campaigns'
  if (/^\/products\/[^/]+\/[^/]+$/.test(href)) return 'series'
  return 'custom'
}

export default function HomepageCardsEditor({ initial }: { initial: HomepageCard[] }) {
  const [cards, setCards] = useState<HomepageCard[]>(initial)
  const [options, setOptions] = useState<DestOptions | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/homepage-cards/options')
      .then(r => r.ok ? r.json() : null)
      .then(setOptions)
      .catch(() => setOptions(null))
  }, [])

  // ── Drag & drop ordering (saves automatically on drop) ──────────────────
  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragging || dragging === targetId) return
    setCards(prev => {
      const from = prev.findIndex(c => c.id === dragging)
      const to   = prev.findIndex(c => c.id === targetId)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next.map((c, i) => ({ ...c, display_order: i + 1 }))
    })
  }

  async function persistOrder() {
    setDragging(null)
    const res = await fetch('/api/admin/homepage-cards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: cards.map(c => ({ id: c.id, display_order: c.display_order })) }),
    })
    if (res.ok) { toast.success('Card order saved'); router.refresh() }
    else toast.error('Failed to save order — please try again')
  }

  async function addCard() {
    setAdding(true)
    const res = await fetch('/api/admin/homepage-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Card', href: '/products', is_active: false }),
    })
    const body = await res.json().catch(() => null)
    if (res.ok && body?.id) {
      setCards(prev => [...prev, body as HomepageCard])
      toast.success('Card added (hidden until you activate it)')
    } else {
      toast.error(body?.error || 'Failed to add card')
    }
    setAdding(false)
  }

  return (
    <div className="space-y-3">
      {cards.map(card => (
        <CardRow
          key={card.id}
          card={card}
          options={options}
          dragging={dragging === card.id}
          onDragStart={() => setDragging(card.id)}
          onDragOver={e => handleDragOver(e, card.id)}
          onDragEnd={persistOrder}
          onChange={next => setCards(prev => prev.map(c => c.id === next.id ? next : c))}
          onDelete={() => setCards(prev => prev.filter(c => c.id !== card.id))}
        />
      ))}

      <Button variant="outline" onClick={addCard} loading={adding} className="gap-2 w-full">
        <Plus className="w-4 h-4" /> Add Card
      </Button>
    </div>
  )
}

function CardRow({ card, options, dragging, onDragStart, onDragOver, onDragEnd, onChange, onDelete }: {
  card: HomepageCard
  options: DestOptions | null
  dragging: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  onChange: (c: HomepageCard) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(card)
  const [destType, setDestType] = useState(destTypeFor(card.href))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(card)

  function patch(next: Partial<HomepageCard>) {
    setDraft(d => ({ ...d, ...next }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/homepage-cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title, subtitle: draft.subtitle,
        image_url: draft.image_url ?? '', href: draft.href, is_active: draft.is_active,
      }),
    })
    const body = await res.json().catch(() => null)
    if (res.ok) { onChange(body as HomepageCard); toast.success('Card saved — now live') }
    else toast.error(body?.error || 'Save failed — please try again')
    setSaving(false)
  }

  async function remove() {
    if (!confirm(`Delete card "${card.title}"? This takes effect immediately.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/homepage-cards/${card.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Card deleted'); onDelete() }
    else { toast.error('Delete failed — please try again'); setDeleting(false) }
  }

  const destOptions: DestOption[] = destType !== 'custom' && options
    ? options[destType as keyof DestOptions] ?? []
    : []

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-white rounded-2xl border transition-all overflow-hidden',
        dragging ? 'border-blue-400 shadow-md opacity-70' : open ? 'border-blue-200 shadow-sm' : 'border-slate-100 hover:border-slate-200',
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" aria-label="Drag to reorder" />
        <button onClick={() => setOpen(v => !v)} className="flex-1 flex items-center gap-3 text-left min-w-0 cursor-pointer">
          <span className={cn('w-2 h-2 rounded-full shrink-0', card.is_active ? 'bg-emerald-400' : 'bg-slate-300')} />
          <span className="font-semibold text-slate-900 text-sm truncate">{card.title}</span>
          <span className="text-xs text-slate-400 truncate hidden sm:inline">{card.href}</span>
        </button>
        {card.is_active
          ? <Eye className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="Visible on homepage" />
          : <EyeOff className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-label="Hidden" />}
        <button onClick={() => setOpen(v => !v)} aria-label={open ? 'Collapse card' : 'Edit card'} className="p-1 cursor-pointer">
          <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Title</span>
              <input
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={draft.title}
                onChange={e => patch({ title: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Subtitle (optional)</span>
              <input
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={draft.subtitle ?? ''}
                placeholder="Small text under the title"
                onChange={e => patch({ subtitle: e.target.value || null })}
              />
            </label>
          </div>

          {/* Destination */}
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Destination type</span>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={destType}
                onChange={e => setDestType(e.target.value)}
              >
                {DEST_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </label>
            {destType === 'custom' ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">Destination URL</span>
                <input
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={draft.href}
                  placeholder="/products/my-product or https://…"
                  onChange={e => patch({ href: e.target.value })}
                />
              </label>
            ) : (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">Destination</span>
                <select
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={draft.href}
                  onChange={e => patch({ href: e.target.value })}
                >
                  {!destOptions.some(o => o.href === draft.href) && <option value={draft.href}>{draft.href}</option>}
                  {destOptions.map(o => <option key={o.href} value={o.href}>{o.label}</option>)}
                </select>
              </label>
            )}
          </div>

          <ImageUploadField
            label="Card Image"
            hint="Shown in the card's image frame. Leave empty to show the category icon fallback."
            aspectRatio="5 / 4"
            recommendedWidth={1000}
            recommendedHeight={800}
            value={draft.image_url}
            onChange={url => patch({ image_url: url })}
          />

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={e => patch({ is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 cursor-pointer"
            />
            Show this card on the homepage
          </label>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={remove}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting…' : 'Delete card'}
            </button>
            <div className="flex items-center gap-3">
              {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
              <Button onClick={save} loading={saving} disabled={!dirty} size="sm" className="gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
