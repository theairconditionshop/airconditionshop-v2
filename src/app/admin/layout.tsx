import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSession, getProfile } from '@/lib/auth/session'
import AdminShell from '@/components/admin/admin-shell'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/')

  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <AdminShell profile={profile}>
      {children}
    </AdminShell>
  )
}
