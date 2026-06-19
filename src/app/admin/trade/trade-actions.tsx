'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  id: string
  applicationId: string
  status: string
  name: string
  email: string
}

export default function TradeActions({ id, applicationId, status, name, email }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function action(newStatus: 'approved' | 'rejected') {
    setLoading(true)
    const res = await fetch('/api/admin/trade', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, applicationId, status: newStatus, name, email }),
    })
    if (res.ok) {
      toast.success(newStatus === 'approved' ? 'Trade account approved' : 'Application rejected')
      router.refresh()
    } else {
      toast.error('Action failed')
    }
    setLoading(false)
  }

  if (status !== 'pending') return null

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => action('approved')} disabled={loading}
        className="text-xs text-green-600 hover:underline disabled:opacity-50">Approve</button>
      <button onClick={() => action('rejected')} disabled={loading}
        className="text-xs text-red-500 hover:underline disabled:opacity-50">Reject</button>
    </div>
  )
}
