'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Testimonial } from '@/types/database'

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
const textareaCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const router = useRouter()
  const isEdit = !!testimonial

  const [form, setForm] = useState({
    name:          testimonial?.name          ?? '',
    title:         testimonial?.title         ?? '',
    company:       testimonial?.company       ?? '',
    content:       testimonial?.content       ?? '',
    rating:        testimonial?.rating        ?? 5,
    display_order: testimonial?.display_order ?? 0,
    is_active:     testimonial?.is_active     ?? true,
  })
  const [saving, setSaving] = useState(false)

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.content.trim()) {
      toast.error('Name and review content are required')
      return
    }
    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/testimonial/${testimonial!.id}` : '/api/admin/testimonial'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error(json?.error ?? 'Save failed')
        return
      }
      toast.success(isEdit ? 'Testimonial updated' : 'Testimonial added')
      router.push('/admin/testimonials')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-100 p-6">

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Customer name" required>
          <input className={inputCls} value={form.name} placeholder="John Borg"
            onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="Job title">
          <input className={inputCls} value={form.title} placeholder="Homeowner"
            onChange={e => set('title', e.target.value)} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Company">
          <input className={inputCls} value={form.company} placeholder="Company name (optional)"
            onChange={e => set('company', e.target.value)} />
        </Field>
        <Field label="Rating">
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
            value={form.rating}
            onChange={e => set('rating', Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Review content" required>
        <textarea className={textareaCls} rows={5} value={form.content}
          placeholder="Write the customer's review here…"
          onChange={e => set('content', e.target.value)} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Display order">
          <input type="number" className={inputCls} value={form.display_order} min={0}
            onChange={e => set('display_order', Number(e.target.value))} />
        </Field>
        <Field label="Visibility">
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
            value={form.is_active ? 'active' : 'hidden'}
            onChange={e => set('is_active', e.target.value === 'active')}
          >
            <option value="active">Active — shown on website</option>
            <option value="hidden">Hidden — not shown</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="brand" loading={saving}>
          {isEdit ? 'Save Changes' : 'Add Testimonial'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
