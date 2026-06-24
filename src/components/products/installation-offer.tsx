import { getSiteSettings } from '@/lib/data/queries'
import { CheckCircle2, Wrench } from 'lucide-react'

interface Props {
  acType: string | null
  coolingBtu: number | null
}

export default async function InstallationOffer({ acType, coolingBtu }: Props) {
  if (!acType || acType === 'Other') return null

  const settings = await getSiteSettings()
  if (String(settings.installation_offer_enabled ?? 'true') === 'false') return null

  const price12k   = String(settings.installation_pipe_price_12k   ?? '25')
  const priceLarge = String(settings.installation_pipe_price_large  ?? '29')

  const btu = coolingBtu ?? 0
  const tierLabel =
    btu > 0 && btu <= 12000
      ? `This unit (${btu.toLocaleString()} BTU): €${price12k} + VAT per additional metre`
      : btu > 12000
      ? `This unit (${btu.toLocaleString()} BTU): €${priceLarge} + VAT per additional metre`
      : null

  return (
    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <Wrench className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-900 text-sm">FREE standard installation included</p>

          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Includes:</p>
            {[
              'Up to 3 metres copper piping',
              '1 pair rubber anti-vibration mounts',
              'Standard installation',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-sm text-emerald-800">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-100">
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-2">Additional copper piping:</p>
            <ul className="space-y-1 text-xs text-emerald-700">
              <li>• 12,000 BTU units: €{price12k} + VAT per additional metre</li>
              <li>• 18,000 BTU and 24,000 BTU units: €{priceLarge} + VAT per additional metre</li>
            </ul>
            {tierLabel && (
              <p className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-lg px-3 py-1.5">
                {tierLabel}
              </p>
            )}
          </div>

          <p className="mt-3 text-[11px] text-emerald-600 leading-relaxed">
            Additional materials, electrical works, trunking, wall drilling, crane access, or non-standard installations may incur extra charges following site inspection.
          </p>
        </div>
      </div>
    </div>
  )
}
