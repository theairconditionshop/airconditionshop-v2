import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title:        string
  description?: string
  newHref?:     string
  newLabel?:    string
  action?:      React.ReactNode
}

export default function AdminPageHeader({
  title, description, newHref, newLabel, action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5 lg:mb-6">
      <div className="min-w-0">
        <h1 className="text-lg lg:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {newHref && (
          <Link href={newHref}>
            <Button variant="brand" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{newLabel ?? 'Add New'}</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        )}
        {action}
      </div>
    </div>
  )
}
