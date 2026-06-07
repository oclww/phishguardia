'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield, LayoutDashboard, Mail, AlertTriangle, Bell,
  BarChart2, Search, CreditCard, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, Zap, X, Menu,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

// Bottom nav items for mobile (most used)
const mobileNavItems = [
  { href: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/emails',  icon: Mail,            label: 'Emails'    },
  { href: '/dashboard/threats', icon: AlertTriangle,   label: 'Menaces'   },
  { href: '/dashboard/alerts',  icon: Bell,            label: 'Alertes'   },
  { href: '/dashboard/settings',icon: Settings,        label: 'Paramètres'},
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
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

      {/* ── Mobile: top bar burger ──────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: '#0d1117', borderBottom: '1px solid #1e2a3a' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #41e8c4, #5e9ef7)' }}>
            <Shield size={13} style={{ color: '#0d1117' }} strokeWidth={2.5}/>
          </div>
          <span className="font-bold text-sm" style={{ color: '#eaf2ff', fontFamily: 'Syne, sans-serif' }}>
            PhishGuard<span style={{ color: '#41e8c4' }}>.IA</span>
          </span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-[#7a96b4] hover:text-[#eaf2fb] hover:bg-white/5 transition-all">
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile: slide-in drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col overflow-hidden"
              style={{ background: '#0d1117', borderRight: '1px solid #1e2a3a' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between h-14 px-4" style={{ borderBottom: '1px solid #1e2a3a' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #41e8c4, #5e9ef7)' }}>
                    <Shield size={13} style={{ color: '#0d1117' }} strokeWidth={2.5}/>
                  </div>
                  <span className="font-bold text-sm" style={{ color: '#eaf2ff', fontFamily: 'Syne, sans-serif' }}>
                    PhishGuard<span style={{ color: '#41e8c4' }}>.IA</span>
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-[#7a96b4] hover:text-[#eaf2fb] hover:bg-white/5 transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* User info */}
              {user && (
                <div className="flex items-center gap-3 mx-3 mt-4 p-3 rounded-xl" style={{ background: '#161c26', border: '1px solid #1e2a3a' }}>
                  <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="sm"/>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: '#eaf2fb' }}>{user.firstName} {user.lastName}</p>
                    <p className="text-xs truncate" style={{ color: '#4d6580' }}>{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {sections.map(section => (
                  <div key={section.label}>
                    <p className="px-3 mb-2 text-[10px] font-semibold tracking-[.1em]" style={{ color: '#374f67' }}>
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map(item => {
                        const active = isActive(item.href)
                        const Icon = item.icon
                        return (
                          <Link key={item.href} href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                              active ? 'text-[#eaf2ff] bg-[#1a2232]' : 'text-[#4d6580] hover:text-[#c8d8e8] hover:bg-[#161c26]'
                            )}>
                            <Icon size={18} className="shrink-0" style={{ color: active ? '#41e8c4' : undefined }}/>
                            <span className="flex-1">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Logout */}
              <div className="p-3" style={{ borderTop: '1px solid #1e2a3a' }}>
                <button onClick={() => { logout(); setMobileOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#374f67] hover:bg-[rgba(255,95,109,.06)] hover:text-[#ff5f6d] transition-colors">
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom tab bar ──────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-1"
        style={{ background: '#0d1117', borderTop: '1px solid #1e2a3a', paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
        {mobileNavItems.map(item => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[48px]"
              style={{ color: active ? '#41e8c4' : '#374f67' }}>
              <Icon size={20} />
              <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
              {active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: '#41e8c4' }} />}
            </Link>
          )
        })}
      </div>
    </>
  )
}
