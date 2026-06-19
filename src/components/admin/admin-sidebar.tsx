'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import {
  LayoutDashboard, Package, Tag, BookOpen, Wrench, FileText, Users,
  MessageSquare, Globe, Settings, Image, Building2, ChevronDown, Briefcase,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
  children?: { label: string; href: string }[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/admin',           icon: LayoutDashboard },
  { label: 'Homepage CMS',href: '/admin/homepage',  icon: Globe },
  {
    label: 'Products', href: '/admin/products', icon: Package,
    children: [
      { label: 'All Products',  href: '/admin/products' },
      { label: 'Categories',    href: '/admin/categories' },
      { label: 'Brands',        href: '/admin/brands' },
    ],
  },
  { label: 'Blog',          href: '/admin/blog',      icon: BookOpen },
  { label: 'Services',      href: '/admin/services',  icon: Wrench },
  { label: 'Quotes',        href: '/admin/quotes',    icon: FileText },
  { label: 'CRM',           href: '/admin/crm',       icon: Briefcase },
  { label: 'Trade Accounts',href: '/admin/trade',     icon: Building2 },
  { label: 'Enquiries',     href: '/admin/enquiries', icon: MessageSquare },
  { label: 'Media',         href: '/admin/media',     icon: Image },
  { label: 'Users',         href: '/admin/users',     icon: Users,  roles: ['super_admin', 'admin'] },
  { label: 'Settings',      href: '/admin/settings',  icon: Settings, roles: ['super_admin', 'admin'] },
]

export default function AdminSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string | null>('Products')

  const visible = NAV.filter(item => !item.roles || item.roles.includes(role))

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-white flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/" className="text-sm font-bold tracking-tight leading-tight">
          THE AIRCONDITION<br />SHOP
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visible.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const hasChildren = !!item.children
          const isExpanded = expanded === item.label

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                </button>
                {isExpanded && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    {item.children!.map(child => (
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
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}>
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
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
