'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import {
  LayoutDashboard, Package, BookOpen, Wrench, FileText, Users,
  MessageSquare, Globe, Settings, Building2, ChevronDown, Megaphone,
  Tag, Layers, Image, Upload, Mail, X, ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from './admin-shell'

// ─── Navigation structure ─────────────────────────────────────────────────────

interface NavChild { label: string; href: string }
interface NavGroup  { group: string; items: NavItem[] }
interface NavItem {
  label:     string
  href:      string
  icon:      React.ElementType
  roles?:    UserRole[]
  children?: NavChild[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Content',
    items: [
      { label: 'Homepage',  href: '/admin/homepage',            icon: Globe },
      { label: 'Campaigns', href: '/admin/marketing/campaigns', icon: Megaphone },
      { label: 'Blog',      href: '/admin/blog',                icon: BookOpen },
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
      { label: 'Email Templates', href: '/admin/emails',   icon: Mail,     roles: ['super_admin', 'admin'] },
      { label: 'Media',           href: '/admin/media',    icon: Image,    roles: ['super_admin', 'admin'] },
      { label: 'Users',           href: '/admin/users',    icon: Users,    roles: ['super_admin', 'admin'] },
      { label: 'Settings',        href: '/admin/settings', icon: Settings, roles: ['super_admin', 'admin'] },
    ],
  },
]

// Keep for TS import compatibility
export { Tag, Layers }

// ─── Single nav row ───────────────────────────────────────────────────────────

function NavItemRow({
  item,
  role,
  onNavigate,
}: {
  item:        NavItem
  role:        UserRole
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(() => pathname.startsWith(item.href))
  const Icon = item.icon
  const isActive = pathname === item.href ||
    (item.href !== '/admin' && pathname.startsWith(item.href + '/'))

  if (item.roles && !item.roles.includes(role)) return null

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
            isActive
              ? 'bg-sky-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white',
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', expanded && 'rotate-180')} />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="children"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-6 mt-0.5 pb-0.5 space-y-0.5">
                {item.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-xs transition-colors',
                      pathname === child.href
                        ? 'bg-sky-600/20 text-sky-300 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800',
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-sky-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  )
}

// ─── Shared sidebar body ──────────────────────────────────────────────────────

function SidebarBody({
  role,
  showClose = false,
  onNavigate,
}: {
  role:        UserRole
  showClose?:  boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo + optional close button */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-start justify-between shrink-0">
        <div>
          <Link
            href="/"
            onClick={onNavigate}
            className="text-sm font-bold tracking-tight leading-tight text-white"
          >
            THE AIRCONDITION<br />SHOP
          </Link>
          <p className="text-[11px] text-slate-500 mt-0.5">Admin Panel</p>
        </div>
        {showClose && (
          <button
            onClick={onNavigate}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors -mr-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dashboard */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/admin'
              ? 'bg-sky-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white',
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 px-3 pb-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map(group => {
          const visible = group.items.filter(i => !i.roles || i.roles.includes(role))
          if (!visible.length) return null
          return (
            <div key={group.group}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {visible.map(item => (
                  <NavItemRow
                    key={item.href}
                    item={item}
                    role={role}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View website
        </Link>
      </div>
    </div>
  )
}

// ─── Exported sidebar (desktop + mobile drawer) ───────────────────────────────

export default function AdminSidebar({ role }: { role: UserRole }) {
  const { open, close } = useSidebar()

  return (
    <>
      {/* ── Desktop: always-visible fixed column ── */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-slate-900 text-white flex-col overflow-hidden">
        <SidebarBody role={role} />
      </aside>

      {/* ── Mobile: overlay + drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] bg-slate-900 text-white flex flex-col overflow-hidden shadow-2xl rounded-r-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              drag="x"
              dragConstraints={{ left: -400, right: 0 }}
              dragElastic={{ left: 0.05, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -300) close()
              }}
            >
              <SidebarBody role={role} showClose onNavigate={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
