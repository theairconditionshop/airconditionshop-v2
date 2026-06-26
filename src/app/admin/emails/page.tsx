import type { Metadata } from 'next'
import EmailPreviewClient from './email-preview-client'

export const metadata: Metadata = { title: 'Email Templates — Admin' }

export default function EmailTemplatesPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Email Templates</h1>
        <p className="text-sm text-slate-500 mt-1">
          Preview every transactional email and send test copies to your inbox.
        </p>
      </div>
      <EmailPreviewClient />
    </div>
  )
}
