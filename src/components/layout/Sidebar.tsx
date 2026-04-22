'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield, LayoutDashboard, Mail, AlertTriangle, Bell,
  BarChart2, Search, CreditCard, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const sections = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/dashboard',         icon: LayoutDashboard, label: "Vue d'ensemble", badge: null  },
      { href: '/dashboard/emails',  icon: Mail,            label: 'Emails analysés', badge: null },
      { href: '/dashboard/threats', icon: AlertTriangle,   label: 'Menaces bloquées',badge: null },
      { href: '/dashboard/alerts',  icon: Bell,            label: 'Alertes',          badge: null },
    ],
  },
  {
    label: 'ANALYSE',
    items: [
      { href: '/dashboard/reports', icon: BarChart2, label: 'Rapports',    badge: null },
      { href: '/dashboard/search',  icon: Search,    label: 'Recherche',   badge: null },
      { href: '/dashboard/billing', icon: CreditCard,label: 'Facturation', badge: null },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { href: '/dashboard/team',     icon: Users,    label: 'Équipe',     badge: null },
      { href: '/dashboard/settings', icon: Settings, label: 'Paramètres', badge: null },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 210 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col h-screen shrink-0 overflow-hidden"
      style={{ background: '#0d1117', borderRight: '1px solid #1e2a3a' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 shrink-0" style={{ borderBottom: '1px solid #1e2a3a' }}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #41e8c4, #5e9ef7)', boxShadow: '0 0 20px rgba(65,232,196,.3)' }}>
            <Shield size={15} style={{ color: '#0d1117' }} strokeWidth={2.5}/>
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight truncate" style={{ color: '#eaf2ff', fontFamily: 'Syne, sans-serif' }}>
              PhishGuard<span style={{ color: '#41e8c4' }}>.IA</span>
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-5" style={{ padding: collapsed ? '16px 8px' : '16px 10px' }}>
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[.1em]" style={{ color: '#374f67' }}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-100',
                      collapsed && 'justify-center px-2',
                      active
                        ? 'text-[#eaf2ff] bg-[#1a2232]'
                        : 'text-[#4d6580] hover:text-[#c8d8e8] hover:bg-[#161c26]'
                    )}>
                    <Icon size={16} className="shrink-0" style={{ color: active ? '#41e8c4' : undefined }}/>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                            style={{ background: active ? 'rgba(65,232,196,.15)' : 'rgba(255,95,109,.12)', color: active ? '#41e8c4' : '#ff5f6d' }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {user?.email === 'oclaw78@gmail.com' && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[.1em] text-[#fbbf24]">
                SUPER ADMIN
              </p>
            )}
            <div className="space-y-0.5">
              <Link href="/dashboard/backoffice"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-100',
                  collapsed && 'justify-center px-2',
                  isActive('/dashboard/backoffice')
                    ? 'text-black bg-[#fbbf24]'
                    : 'text-[#fbbf24] hover:bg-[#fbbf24]/10'
                )}>
                <Zap size={16} className="shrink-0" />
                {!collapsed && <span className="flex-1 truncate">Backoffice Global</span>}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Plan banner */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: '#1a2232', border: '1px solid #253347' }}>
          <p className="text-xs font-semibold text-[#eaf2fb]">Plan Business</p>
          <p className="text-[10px] mt-0.5 mb-3" style={{ color: '#4d6580' }}>9 jours restants d'essai</p>
          <button className="w-full py-1.5 rounded-lg text-xs font-semibold bg-[#eaf2fb] text-[#060d18] shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300">
            Passer au payant
          </button>
        </div>
      )}

      {/* Bottom */}
      <div className="shrink-0 pb-3 px-2 space-y-0.5" style={{ borderTop: '1px solid #1e2a3a', paddingTop: '10px' }}>
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl" style={{ background: '#161c26' }}>
            <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="sm"/>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: '#c8d8e8' }}>{user.firstName} {user.lastName}</p>
              <p className="text-[10px] truncate" style={{ color: '#374f67' }}>{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className={cn(
            'group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#374f67] hover:bg-[rgba(255,95,109,.06)] hover:text-[#ff5f6d] transition-colors duration-200', 
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={14} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <button onClick={() => setCollapsed(v => !v)}
          className={cn(
            'group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#374f67] hover:bg-white/5 hover:text-[#c8d8e8] transition-colors duration-200',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight size={14} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
          ) : (
            <>
              <ChevronLeft size={14} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
