'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Profile } from '@/types/database'
import AdminSidebar from './admin-sidebar'
import AdminHeader  from './admin-header'

// ─── Sidebar state context ────────────────────────────────────────────────────

interface SidebarCtx { open: boolean; toggle: () => void; close: () => void }
const SidebarContext = createContext<SidebarCtx>({ open: false, toggle: () => {}, close: () => {} })
export const useSidebar = () => useContext(SidebarContext)

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function AdminShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const [open, setOpen] = useState(false)
  const toggle  = useCallback(() => setOpen(v => !v), [])
  const close   = useCallback(() => setOpen(false),    [])

  // Body scroll lock + ESC to close
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <SidebarContext.Provider value={{ open, toggle, close }}>
      <div className="flex h-[100dvh] bg-[#F8FAFC] overflow-hidden">
        <AdminSidebar role={profile.role} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminHeader profile={profile} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 lg:px-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
