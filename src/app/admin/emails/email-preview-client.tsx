'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, Send, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Template definitions ─────────────────────────────────────────────────────

interface TemplateConfig {
  key:         string
  label:       string
  description: string
  badge:       string
  badgeBg:     string
  badgeFg:     string
}

const TEMPLATES: TemplateConfig[] = [
  // ── Auth / OTP ──────────────────────────────────────────────────────────────
  {
    key:         'verify_email',
    label:       'Email Verification (OTP)',
    description: 'Sent during trade account registration — contains a 6-digit verification code.',
    badge: 'OTP', badgeBg: '#EFF6FF', badgeFg: '#1E40AF',
  },
  {
    key:         'admin_otp',
    label:       'Admin Login Code (2FA)',
    description: 'Sent when an admin logs in — contains a 6-digit two-factor authentication code.',
    badge: 'OTP', badgeBg: '#EFF6FF', badgeFg: '#1E40AF',
  },
  {
    key:         'password_reset',
    label:       'Password Reset (OTP)',
    description: 'Sent when a user requests a password reset — contains a 6-digit code.',
    badge: 'Auth', badgeBg: '#F0F9FF', badgeFg: '#0C4A6E',
  },
  {
    key:         'password_changed',
    label:       'Password Changed',
    description: 'Sent as a security confirmation after a password is successfully updated.',
    badge: 'Auth', badgeBg: '#F0FDF4', badgeFg: '#14532D',
  },
  // ── Trade ───────────────────────────────────────────────────────────────────
  {
    key:         'trade_received',
    label:       'Application Received',
    description: 'Sent to applicant immediately after a trade account application is submitted.',
    badge: 'Trade', badgeBg: '#FEF3C7', badgeFg: '#92400E',
  },
  {
    key:         'trade_approved',
    label:       'Application Approved',
    description: 'Sent when an admin approves a trade account application.',
    badge: 'Trade', badgeBg: '#D1FAE5', badgeFg: '#065F46',
  },
  {
    key:         'trade_reactivated',
    label:       'Account Reactivated',
    description: 'Sent when a suspended account is restored to approved status by an admin.',
    badge: 'Trade', badgeBg: '#D1FAE5', badgeFg: '#065F46',
  },
  {
    key:         'trade_rejected',
    label:       'Application Rejected',
    description: 'Sent when an admin rejects an application, optionally with a reason.',
    badge: 'Trade', badgeBg: '#FEE2E2', badgeFg: '#991B1B',
  },
  {
    key:         'trade_suspended',
    label:       'Account Suspended',
    description: 'Sent when an admin suspends an active trade account.',
    badge: 'Trade', badgeBg: '#FEF3C7', badgeFg: '#78350F',
  },
  // ── Customer ─────────────────────────────────────────────────────────────────
  {
    key:         'contact_enquiry',
    label:       'Contact Enquiry (User)',
    description: "Confirmation sent to customer after they submit the contact form.",
    badge: 'Customer', badgeBg: '#F0F9FF', badgeFg: '#0C4A6E',
  },
  {
    key:         'quote_request',
    label:       'Quote Request (User)',
    description: 'Confirmation sent to customer after they submit a quote request.',
    badge: 'Customer', badgeBg: '#F0F9FF', badgeFg: '#0C4A6E',
  },
  {
    key:         'quote_sent',
    label:       'Quote Sent',
    description: 'Sent to customer when admin sends a formal quote document.',
    badge: 'Customer', badgeBg: '#F0F9FF', badgeFg: '#0C4A6E',
  },
  {
    key:         'service_request',
    label:       'Service Request (User)',
    description: 'Confirmation sent to customer after they submit a service request.',
    badge: 'Service', badgeBg: '#F0FDF4', badgeFg: '#14532D',
  },
  {
    key:         'service_booked',
    label:       'Service Appointment Confirmed',
    description: 'Sent to customer when admin books and schedules a service appointment.',
    badge: 'Service', badgeBg: '#F0FDF4', badgeFg: '#14532D',
  },
]

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ tpl, adminEmail }: { tpl: TemplateConfig; adminEmail: string }) {
  const [open,    setOpen]    = useState(false)
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadPreview() {
    if (preview) { setOpen(o => !o); return }
    setLoading(true)
    const res = await fetch(`/api/admin/emails/preview?key=${tpl.key}`)
    if (res.ok) {
      const { html } = await res.json()
      setPreview(html)
      setOpen(true)
    } else {
      toast.error('Failed to load preview.')
    }
    setLoading(false)
  }

  async function sendTest() {
    if (!adminEmail) { toast.error('Admin email not found.'); return }
    setSending(true)

    const res = await fetch('/api/admin/emails/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: tpl.key, to: adminEmail }),
    })

    setSending(false)

    if (res.ok) {
      setSent(true)
      toast.success(`Test email sent to ${adminEmail}`)
      setTimeout(() => setSent(false), 4000)
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error || 'Failed to send test email.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">{tpl.label}</h3>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: tpl.badgeBg, color: tpl.badgeFg }}
            >
              {tpl.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{tpl.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadPreview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading
              ? <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              : open ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {open ? 'Hide' : 'Preview'}
          </button>

          <Button
            onClick={sendTest}
            loading={sending}
            disabled={sending || sent}
            className={`text-xs px-3 py-2 h-auto ${sent ? '!bg-green-600' : ''}`}
          >
            {sent
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> Sent</>
              : <><Send className="w-3.5 h-3.5" /> Send Test</>}
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      {open && preview && (
        <div className="border-t border-slate-100">
          <iframe
            srcDoc={preview}
            title={`Preview: ${tpl.label}`}
            className="w-full"
            style={{ height: '600px', border: 'none' }}
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EmailPreviewClient() {
  // Admin email is taken from the env fallback; in a real session you'd pass it
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@theairconditionshop.com'

  return (
    <div className="space-y-4">
      {TEMPLATES.map(tpl => (
        <TemplateCard key={tpl.key} tpl={tpl} adminEmail={adminEmail} />
      ))}
    </div>
  )
}
