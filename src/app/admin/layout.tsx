import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSession, getProfile } from '@/lib/auth/session'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader  from '@/components/admin/admin-header'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar role={profile.role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
