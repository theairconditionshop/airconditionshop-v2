'use client'

import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import { LogOut, User } from 'lucide-react'

export default function AdminHeader({ profile }: { profile: Profile }) {
  const router = useRouter()

  async function signOut() {
    // POST to server route so HttpOnly cookies (verified_2fa, pending_2fa)
    // are cleared alongside the Supabase session. Client-side signOut()
    // cannot touch HttpOnly cookies, which would leave verified_2fa valid
    // and allow OTP bypass on the next login within 24 hours.
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <span className="font-medium">{profile.full_name || profile.email}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">{profile.role.replace('_', ' ')}</span>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </header>
  )
}
