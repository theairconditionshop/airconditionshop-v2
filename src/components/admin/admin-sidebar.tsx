'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import {
  LayoutDashboard, Package, BookOpen, Wrench, FileText, Users,
  MessageSquare, Globe, Settings, Building2, ChevronDown, Megaphone,
  Tag, Layers, Image, Upload,
} from 'lucide-react'
import { useState } from 'react'

interface NavChild { label: string; href: string }
interface NavGroup {
  group: string
  items: NavItem[]
}
interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
  children?: NavChild[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Content',
    items: [
      { label: 'Homepage',   href: '/admin/homepage',                icon: Globe },
      { label: 'Campaigns',  href: '/admin/marketing/campaigns',     icon: Megaphone },
      { label: 'Blog',       href: '/admin/blog',                    icon: BookOpen },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      {
        label: 'Products', href: '/admin/products', icon: Package,
        children: [
          { label: 'All Products', href: '/admin/products' },
          { label: 'Categories',   href: '/admin/categories' },
          { label: 'Brands',       href: '/admin/brands' },
        ],
      },
      { label: 'Product Import', href: '/admin/product-import', icon: Upload },
    ],
  },
  {
    group: 'Sales',
    items: [
      { label: 'Trade Accounts',   href: '/admin/trade',     icon: Building2 },
      { label: 'Quotes',           href: '/admin/quotes',    icon: FileText },
      { label: 'Service Requests', href: '/admin/services',  icon: Wrench },
      { label: 'Enquiries',        href: '/admin/enquiries', icon: MessageSquare },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Media',    href: '/admin/media',    icon: Image,    roles: ['super_admin', 'admin'] },
      { label: 'Users',    href: '/admin/users',    icon: Users,    roles: ['super_admin', 'admin'] },
      { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'admin'] },
    ],
  },
]

// Kept for TS import compatibility even though not rendered
export { Tag, Layers }

function NavItemRow({ item, role }: { item: NavItem; role: UserRole }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(() => pathname.startsWith(item.href))
  const Icon = item.icon
  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))

  if (item.roles && !item.roles.includes(role)) return null

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
        </button>
        {expanded && (
          <div className="ml-6 mt-0.5 space-y-0.5">
            {item.children.map(child => (
              <Link key={child.href} href={child.href}
                className={cn(
                  'block px-3 py-1.5 rounded-lg text-xs transition-colors',
                  pathname === child.href ? 'bg-sky-600/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}>
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link href={item.href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      )}>
      <Icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  )
}

export default function AdminSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-white flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/" className="text-sm font-bold tracking-tight leading-tight text-white">
          THE AIRCONDITION<br />SHOP
        </Link>
        <p className="text-[11px] text-slate-500 mt-0.5">Admin Panel</p>
      </div>

      {/* Dashboard */}
      <div className="px-3 pt-3 pb-1">
        <Link href="/admin"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/admin' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 px-3 pb-4 space-y-4">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(i => !i.roles || i.roles.includes(role))
          if (!visibleItems.length) return null
          return (
            <div key={group.group}>
              <p className="px-3 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map(item => (
                  <NavItemRow key={item.href} item={item} role={role} />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          ← View website
        </Link>
      </div>
    </aside>
  )
}
