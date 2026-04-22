'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, ChevronRight, Filter, Download, Mail, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

const crumbMap: Record<string, string> = {
  dashboard: "Vue d'ensemble", threats: 'Menaces', emails: 'Emails',
  reports: 'Rapports', settings: 'Paramètres', team: 'Équipe',
  billing: 'Facturation', api: 'API', alerts: 'Alertes', search: 'Recherche',
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((s, i) => ({
    label: crumbMap[s] ?? s,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Vue d'ensemble"
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="shrink-0 flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid #1e2a3a', background: '#0d1117' }}>
      <div className="flex items-center gap-6 flex-1 min-w-0">
        {/* Title + date */}
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#eaf2ff', fontFamily: 'Syne, sans-serif' }}>
            {pageTitle}
          </h1>
          <p className="text-xs capitalize mt-0.5" style={{ color: '#374f67' }}>
            {today} · Données en temps réel
          </p>
        </div>

        {/* Filter tabs — only on main dashboard */}
        {pathname === '/dashboard' && (
          <div className="hidden lg:flex items-center gap-1 ml-4">
            {['Toutes','Critiques','Quarantaine'].map((t, i) => (
              <button key={t}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  i === 0 
                    ? "bg-[#eaf2fb] text-[#060d18] shadow-sm"
                    : "text-[#7a96b0] border border-[#1e2a3a] bg-transparent hover:text-[#eaf2ff] hover:bg-white/5"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Export */}
        <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5">
          <Download size={12}/>Exporter
        </Button>

        {/* Scan email */}
        <Button variant="primary" size="sm" className="hidden md:flex gap-1.5">
          <Mail size={12}/>Scanner email
        </Button>

        {/* Notif */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={cn(
              "relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-[#161c26] border border-[#1e2a3a]",
              showNotifs ? "text-[#eaf2ff]" : "text-[#4d6580] hover:text-[#eaf2ff] hover:bg-[#1a2232]"
            )}
          >
            <Bell size={14} className="transition-transform active:scale-95" />
          </button>

          {showNotifs && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-[#0c1526] border border-[#1e2a3a] rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-[#1e2a3a] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#eaf2fb]">Notifications</span>
                <Link href="/dashboard/alerts" className="text-[10px] text-[#7dd3fc] hover:underline" onClick={() => setShowNotifs(false)}>Voir tout</Link>
              </div>
              <div className="p-8 text-center text-[#7a96b4]">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Vous n'avez pas de nouvelles notifications.</p>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        {user && (
          <Link href="/dashboard/settings" className="flex items-center gap-2 ml-1">
            <Avatar src={user.avatar} name={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email} size="sm"/>
          </Link>
        )}
      </div>
    </header>
  )
}
