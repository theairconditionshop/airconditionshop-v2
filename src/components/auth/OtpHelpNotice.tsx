import { Info } from 'lucide-react'

export default function OtpHelpNotice() {
  return (
    <div className="mt-5 w-full rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
      <div className="flex gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-blue-800 mb-1.5">
            Didn&apos;t receive your verification code?
          </p>
          <ul className="space-y-1 text-[13px] text-blue-700 leading-relaxed">
            <li>• Please check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
            <li>• Delivery usually takes less than a minute, but may occasionally take a little longer.</li>
            <li>• If you&apos;re still having trouble, contact us during business hours.</li>
          </ul>
          <p className="mt-2 text-[13px] text-blue-700">
            📞{' '}
            <a
              href="tel:+35679661889"
              className="font-semibold text-blue-800 hover:text-blue-900 transition-colors"
            >
              +356 7966 1889
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
