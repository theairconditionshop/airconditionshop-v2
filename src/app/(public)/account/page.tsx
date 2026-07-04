import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { getSession, getProfile } from '@/lib/auth/session'
import AccountForm from './account-form'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  const profile = await getProfile()

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-14">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Account</h1>
          <p className="text-slate-500 text-sm mb-8">{user.email}</p>
          <div className="bg-white border border-slate-200 p-8" style={{ borderRadius: 2 }}>
            <AccountForm profile={profile} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
