'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, PauseCircle, Save, AlertTriangle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  userId:        string
  applicationId: string
  status:        string
  name:          string
  email:         string
  companyName:   string
  initialNotes:  string
}

type ConfirmModal = 'suspend' | 'reject' | null

// ─── Confirmation modal ───────────────────────────────────────────────────────

function ConfirmModal({
  type, name, companyName, onConfirm, onCancel, loading,
}: {
  type:        'suspend' | 'reject'
  name:        string
  companyName: string
  onConfirm:   (reason: string) => void
  onCancel:    () => void
  loading:     boolean
}) {
  const [reason, setReason] = useState('')

  const isSuspend = type === 'suspend'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{   opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSuspend ? 'bg-amber-50' : 'bg-red-50'}`}>
          <AlertTriangle className={`w-6 h-6 ${isSuspend ? 'text-amber-500' : 'text-red-500'}`} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {isSuspend ? 'Suspend this trade account?' : 'Reject this application?'}
        </h3>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          {isSuspend
            ? `${name} from ${companyName} will temporarily lose access to trade pricing and their dashboard.`
            : `This action cannot be undone. ${name} will be notified by email.`}
        </p>

        {/* Reason field */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Reason <span className="text-slate-400 font-normal">(optional — included in email to customer)</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder={isSuspend
              ? 'e.g. Account under review, outstanding invoice…'
              : 'e.g. Unable to verify business details…'}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer ${
              isSuspend ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? (isSuspend ? 'Suspending…' : 'Rejecting…') : (isSuspend ? 'Suspend' : 'Reject')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TradeDetailActions({
  userId, applicationId, status, name, email, companyName, initialNotes,
}: Props) {
  const router = useRouter()
  const [loading, setLoading]           = useState<string | null>(null)
  const [notes, setNotes]               = useState(initialNotes)
  const [savingNotes, setSavingNotes]   = useState(false)
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null)

  async function executeAction(
    newStatus: 'approved' | 'rejected' | 'suspended',
    reason?: string
  ) {
    setLoading(newStatus)
    setConfirmModal(null)

    const res = await fetch('/api/admin/trade', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, applicationId, status: newStatus, name, email, companyName, reason }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      toast.error('Action failed. Please try again.')
      setLoading(null)
      return
    }

    const emailDelivered: boolean = data?.emailDelivered !== false

    if (newStatus === 'approved') {
      toast.success(
        emailDelivered
          ? 'Trade account approved — confirmation email sent'
          : 'Trade account approved — email could not be delivered'
      )
      router.refresh()
    } else if (newStatus === 'rejected') {
      if (!emailDelivered) {
        toast.warning('Application rejected — email could not be delivered')
      } else {
        toast.success('Application rejected — email sent to applicant')
      }
      router.push('/admin/trade')
    } else if (newStatus === 'suspended') {
      toast.success(
        emailDelivered
          ? 'Account suspended — notification email sent'
          : 'Account suspended — email could not be delivered'
      )
      router.refresh()
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
    <>
      {/* Confirmation modals */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            type={confirmModal}
            name={name}
            companyName={companyName}
            loading={!!loading}
            onConfirm={reason => executeAction(confirmModal === 'suspend' ? 'suspended' : 'rejected', reason)}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Action buttons */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Admin Actions</h3>
          <div className="space-y-2">
            {status !== 'approved' && (
              <button
                onClick={() => executeAction('approved')}
                disabled={!!loading}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading === 'approved' ? 'Approving…' : 'Approve Account'}
              </button>
            )}
            {status === 'approved' && (
              <button
                onClick={() => setConfirmModal('suspend')}
                disabled={!!loading}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 disabled:opacity-50 text-amber-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                {loading === 'suspended' ? 'Suspending…' : 'Suspend Account'}
              </button>
            )}
            {status !== 'rejected' && (
              <button
                onClick={() => setConfirmModal('reject')}
                disabled={!!loading}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-600 text-sm font-semibold transition-colors cursor-pointer"
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
                Account active — trader has full trade access
              </p>
            </div>
          )}
          {status === 'suspended' && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                <PauseCircle className="w-3.5 h-3.5" />
                Account suspended — no trade access
              </p>
              <button
                onClick={() => executeAction('approved')}
                disabled={!!loading}
                className="mt-2 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {loading === 'approved' ? 'Reactivating…' : 'Reactivate Account'}
              </button>
            </div>
          )}
          {status === 'rejected' && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Application rejected
              </p>
            </div>
          )}
        </div>

        {/* Internal notes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Internal Notes</h3>
          <p className="text-xs text-slate-400 mb-3">Private — not visible to the trader.</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
            placeholder="Credit limit, special terms, referral source…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none transition-colors"
          />
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {savingNotes ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
      </div>
    </>
  )
}
