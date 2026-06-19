'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function EnquiryActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markRead() {
    setLoading(true)
    await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'read' }),
    })
    toast.success('Marked as read')
    router.refresh()
    setLoading(false)
  }

  if (status !== 'new') return null

  return (
    <button onClick={markRead} disabled={loading}
      className="text-xs text-sky-600 hover:underline disabled:opacity-50">
      Mark read
    </button>
  )
}
