import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react'

interface Props {
  availability: string
  showWarranty?: boolean
}

const ITEMS = [
  {
    icon:  Truck,
    label: 'Delivery across all Malta',
    sub:   'Including Gozo & Comino',
    color: 'text-blue-600',
    bg:    'bg-blue-50',
  },
  {
    icon:  Clock,
    label: 'Fast turnaround',
    sub:   'Typically 2–5 business days',
    color: 'text-emerald-600',
    bg:    'bg-emerald-50',
  },
  {
    icon:  MapPin,
    label: 'Mosta showroom',
    sub:   'Mon–Fri 08:00–18:00, Sat 08:00–14:00',
    color: 'text-amber-600',
    bg:    'bg-amber-50',
  },
  {
    icon:  ShieldCheck,
    label: 'Full warranty included',
    sub:   'Manufacturer + installation warranty',
    color: 'text-violet-600',
    bg:    'bg-violet-50',
  },
]

export default function DeliveryInfo({ availability, showWarranty = true }: Props) {
  const inStock = availability !== 'out_of_stock'
  const items = showWarranty ? ITEMS : ITEMS.filter(i => i.label !== 'Full warranty included')

  return (
    <div className="mt-5 rounded-2xl border border-slate-100 overflow-hidden">
      {/* Stock indicator */}
      <div className={`px-4 py-2.5 flex items-center gap-2 text-sm font-medium ${inStock ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
        <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
        {inStock
          ? availability === 'in_stock' ? 'In stock — ready for fast dispatch' : 'Available to order — contact us for lead time'
          : 'Currently out of stock — contact us for restock date'}
      </div>

      {/* Delivery details */}
      <div className="divide-y divide-slate-50">
        {items.map(({ icon: Icon, label, sub, color, bg }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 bg-white">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
