import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  newHref?: string
  newLabel?: string
  action?: React.ReactNode
}

export default function AdminPageHeader({ title, description, newHref, newLabel, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {newHref && (
        <Link href={newHref}>
          <Button variant="brand" size="sm">
            <Plus className="w-4 h-4 mr-1" />{newLabel ?? 'Add New'}
          </Button>
        </Link>
      )}
      {action}
    </div>
  )
}
