'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Generic "Duplicate" action for admin list rows — copies the record via
 * POST /api/admin/{entity}/{id}/duplicate and jumps straight to editing the
 * copy. The fast path for entering families of near-identical items.
 */
export default function DuplicateButton({ id, entity, label, editPath }: { id: string; entity: string; label: string; editPath: (id: string) => string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDuplicate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/${entity}/${id}/duplicate`, { method: 'POST' })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.id) {
        toast.success(`${label} duplicated — editing the copy`)
        router.push(editPath(json.id))
      } else {
        toast.error(json?.error ?? 'Duplicate failed — please try again')
      }
    } catch {
      toast.error('Duplicate failed — network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDuplicate} disabled={loading}
      className="text-xs text-slate-500 hover:text-slate-700 hover:underline disabled:opacity-50 cursor-pointer">
      {loading ? 'Duplicating…' : 'Duplicate'}
    </button>
  )
}
