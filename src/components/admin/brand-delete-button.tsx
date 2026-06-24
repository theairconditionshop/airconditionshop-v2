'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  id: string
  label: string
}

export default function BrandDeleteButton({ id, label }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })

      if (res.ok) {
        toast.success(`"${label}" deleted`)
        router.refresh()
        return
      }

      const json = await res.json().catch(() => null)

      if (res.status === 409 && json?.code === 'HAS_PRODUCTS') {
        // FK blocked — offer deactivation instead
        const deactivate = confirm(
          `${json.error}\n\nWould you like to deactivate "${label}" instead? It will be hidden from the website but its products will remain linked.`
        )
        if (deactivate) {
          await handleDeactivate()
        }
        return
      }

      toast.error(json?.error ?? 'Delete failed — please try again')
    } catch {
      toast.error('Delete failed — network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeactivate() {
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      if (res.ok) {
        toast.success(`"${label}" deactivated — hidden from website`)
        router.refresh()
      } else {
        const json = await res.json().catch(() => null)
        toast.error(json?.error ?? 'Deactivate failed — please try again')
      }
    } catch {
      toast.error('Deactivate failed — network error')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50 cursor-pointer"
    >
      {loading ? 'Working…' : 'Delete'}
    </button>
  )
}
