'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (!user.company) {
        router.push('/onboarding')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #41e8c4, #5e9ef7)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#0d1117" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <p className="text-xs" style={{ color: '#374f67' }}>Chargement...</p>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1117' }}>
      <Sidebar/>
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader/>
        {/* pt-14 = top bar height on mobile, pb-16 = bottom tab bar height on mobile */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-[calc(56px+1rem)] md:pt-6 pb-[calc(64px+1rem)] md:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
