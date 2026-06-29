'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Faq } from '@/types/database'

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

const CATEGORIES = ['general', 'installation', 'service', 'trade', 'products', 'contact']

export default function FaqForm({ faq }: { faq?: Faq }) {
  const router = useRouter()
  const isEdit = !!faq

  const [form, setForm] = useState({
    question:      faq?.question      ?? '',
    answer:        faq?.answer        ?? '',
    category:      faq?.category      ?? 'general',
    display_order: faq?.display_order ?? 0,
    is_active:     faq?.is_active     ?? true,
  })
  const [saving, setSaving] = useState(false)

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/faq/${faq!.id}` : '/api/admin/faq'
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
      toast.success(isEdit ? 'FAQ updated' : 'FAQ added')
      router.push('/admin/faqs')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-100 p-6">

      <Field label="Question" required>
        <input className={inputCls} value={form.question}
          placeholder="How long does installation take?"
          onChange={e => set('question', e.target.value)} />
      </Field>

      <Field label="Answer" required>
        <textarea className={textareaCls} rows={6} value={form.answer}
          placeholder="Write the answer here…"
          onChange={e => set('answer', e.target.value)} />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Category">
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors capitalize"
            value={form.category}
            onChange={e => set('category', e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </Field>
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
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="brand" loading={saving}>
          {isEdit ? 'Save Changes' : 'Add FAQ'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
