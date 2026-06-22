'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, PauseCircle, Save } from 'lucide-react'

interface Props {
  userId: string
  applicationId: string
  status: string
  name: string
  email: string
  initialNotes: string
}

export default function TradeDetailActions({ userId, applicationId, status, name, email, initialNotes }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [notes, setNotes]     = useState(initialNotes)
  const [savingNotes, setSavingNotes] = useState(false)

  async function setStatus(newStatus: 'approved' | 'rejected' | 'suspended') {
    setLoading(newStatus)
    const res = await fetch('/api/admin/trade', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, applicationId, status: newStatus, name, email }),
    })
    if (res.ok) {
      toast.success(
        newStatus === 'approved'  ? 'Trade account approved — email sent to applicant' :
        newStatus === 'rejected'  ? 'Application rejected — email sent to applicant' :
        'Account suspended'
      )
      router.refresh()
    } else {
      toast.error('Action failed. Please try again.')
    }
    setLoading(null)
  }

  async function saveNotes() {
    setSavingNotes(true)
    const res = await fetch(`/api/admin/trade/${applicationId}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    if (res.ok) {
      toast.success('Notes saved')
    } else {
      toast.error('Failed to save notes')
    }
    setSavingNotes(false)
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Admin Actions</h3>
        <div className="space-y-2">
          {status !== 'approved' && (
            <button
              onClick={() => setStatus('approved')}
              disabled={!!loading}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading === 'approved' ? 'Approving…' : 'Approve Account'}
            </button>
          )}
          {status === 'approved' && (
            <button
              onClick={() => setStatus('suspended')}
              disabled={!!loading}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-semibold transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
              {loading === 'suspended' ? 'Suspending…' : 'Suspend Account'}
            </button>
          )}
          {status !== 'rejected' && (
            <button
              onClick={() => setStatus('rejected')}
              disabled={!!loading}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-600 text-sm font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {loading === 'rejected' ? 'Rejecting…' : 'Reject Application'}
            </button>
          )}
        </div>

        {status === 'approved' && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Account is currently active — trader has trade pricing access
            </p>
          </div>
        )}
      </div>

      {/* Internal notes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Internal Notes</h3>
        <p className="text-xs text-slate-400 mb-2">These notes are private — not visible to the trader.</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={5}
          placeholder="Add notes about this trader, e.g. credit limit, special terms, referral source…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none transition-colors"
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {savingNotes ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}
