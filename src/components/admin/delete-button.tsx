'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteButton({ id, entity, label }: { id: string; entity: string; label: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/${entity}/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`${label} deleted`)
      router.refresh()
    } else {
      toast.error('Delete failed')
    }
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50">
      Delete
    </button>
  )
}
