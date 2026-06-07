'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Download, Mail, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, X, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

const crumbMap: Record<string, string> = {
  dashboard: "Vue d'ensemble", threats: 'Menaces', emails: 'Emails',
  reports: 'Rapports', settings: 'Paramètres', team: 'Équipe',
  billing: 'Facturation', api: 'API', alerts: 'Alertes', search: 'Recherche',
}

// ─── Scan Modal ───────────────────────────────────────────────────────────────
function ScanModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const supabase = createClient()

  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const inputClass = 'w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2.5 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 transition-colors placeholder:text-[#4d6580] resize-none'

  const handleScan = async () => {
    if (!from && !subject && !body) {
      setError('Remplis au moins un champ.')
      return
    }
    setError('')
    setIsLoading(true)
    setResult(null)

    try {
      // Fetch first active API key for this user
      const { data: keys } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .limit(1)

      if (!keys || keys.length === 0) {
        setError("Aucune clé API active. Crée-en une dans l'onglet API.")
        setIsLoading(false)
        return
      }

      const apiKey = keys[0].key
      const res = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ from, subject, body }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setFrom('')
    setSubject('')
    setBody('')
    setError('')
  }

  const getScoreColor = (score: number) =>
    score >= 75 ? '#ff5f6d' : score >= 45 ? '#f5a623' : '#32d583'

  const getStatusIcon = (status: string) => {
    if (status === 'blocked') return <ShieldX size={28} className="text-[#ff5f6d]" />
    if (status === 'quarantined') return <ShieldAlert size={28} className="text-[#f5a623]" />
    return <ShieldCheck size={28} className="text-[#32d583]" />
  }

  const getStatusLabel = (status: string) => ({
    blocked: { label: 'Bloqué', color: '#ff5f6d', bg: 'rgba(255,95,109,.08)' },
    quarantined: { label: 'Quarantaine', color: '#f5a623', bg: 'rgba(245,166,35,.08)' },
    safe: { label: 'Sûr', color: '#32d583', bg: 'rgba(50,213,131,.08)' },
  })[status] ?? { label: status, color: '#7a96b0', bg: 'transparent' }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(6,13,24,.8)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: .96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .96, y: 12 }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          className="w-full max-w-lg"
          style={{ background: '#0c1526', border: '1px solid #1a2740', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,.6)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1a2740' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(65,232,196,.1)', border: '1px solid rgba(65,232,196,.2)' }}>
                <Mail size={15} style={{ color: '#41e8c4' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#eaf2fb', fontFamily: 'Syne, sans-serif' }}>Scanner un email</p>
                <p className="text-xs" style={{ color: '#4d6580' }}>Analyse IA heuristique + Gemini</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: '#4d6580' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#eaf2fb')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4d6580')}
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ── RESULT VIEW ── */}
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Score circle */}
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1a2740" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={getScoreColor(result.ai_score)}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(result.ai_score / 100) * 264} 264`}
                          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${getScoreColor(result.ai_score)}60)` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-mono" style={{ color: getScoreColor(result.ai_score) }}>{result.ai_score}</span>
                        <span className="text-[9px] uppercase tracking-wider" style={{ color: '#4d6580' }}>/ 100</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#eaf2fb' }}>
                          {result.threat_type !== 'none' ? result.threat_type.toUpperCase() : 'Email sûr'}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ color: getStatusLabel(result.status).color, background: getStatusLabel(result.status).bg }}>
                          {getStatusLabel(result.status).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Signals breakdown */}
                  {result.signals && (
                    <div className="space-y-2 mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4d6580' }}>Signaux détectés</p>
                      {Object.entries(result.signals).map(([key, val]: any) => {
                        const labels: Record<string, string> = {
                          domainSpoofing: 'Spoofing domaine',
                          urgencyKeywords: "Mots d'urgence",
                          suspiciousLinks: 'Liens suspects',
                          subjectPatterns: 'Patterns sujet',
                          senderAnomaly: 'Anomalie expéditeur',
                        }
                        const max: Record<string, number> = { domainSpoofing: 30, urgencyKeywords: 20, suspiciousLinks: 20, subjectPatterns: 15, senderAnomaly: 15 }
                        const pct = Math.round((val / (max[key] || 30)) * 100)
                        const c = pct > 60 ? '#ff5f6d' : pct > 30 ? '#f5a623' : '#32d583'
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: '#7a96b0' }}>{labels[key] ?? key}</span>
                              <span className="font-mono" style={{ color: c }}>{val}/{max[key] || 30}</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: '#1a2740' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .6, ease: 'easeOut' }}
                                className="h-full rounded-full" style={{ background: c }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs mb-5" style={{ color: '#4d6580' }}>
                    <span>Moteur :</span>
                    <span className="px-2 py-0.5 rounded" style={{ background: '#1a2740', color: '#7dd3fc' }}>{result.engine || 'heuristic'}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">Nouveau scan</Button>
                    <Button size="sm" onClick={onClose} className="flex-1">Fermer</Button>
                  </div>
                </motion.div>
              ) : (
                /* ── FORM VIEW ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a96b0' }}>Expéditeur (From)</label>
                    <input className={inputClass} placeholder="attacker@micros0ft-alert.com" value={from} onChange={e => setFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a96b0' }}>Sujet</label>
                    <input className={inputClass} placeholder="Votre compte sera suspendu dans 24h" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a96b0' }}>Corps de l'email <span style={{ color: '#4d6580' }}>(optionnel)</span></label>
                    <textarea className={inputClass} rows={4} placeholder="Cliquez ici immédiatement pour éviter la suspension de votre compte..." value={body} onChange={e => setBody(e.target.value)} />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,95,109,.08)', border: '1px solid rgba(255,95,109,.2)', color: '#ff5f6d' }}>
                      <AlertTriangle size={13} /> {error}
                      {error.includes('clé API') && (
                        <Link href="/dashboard/api" className="ml-auto underline shrink-0" onClick={onClose}>Créer une clé →</Link>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Annuler</Button>
                    <button
                      onClick={handleScan}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ background: isLoading ? '#1a2740' : 'linear-gradient(135deg, #41e8c4, #5e9ef7)', color: isLoading ? '#4d6580' : '#060d18', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                      {isLoading ? <><Loader2 size={14} className="animate-spin" /> Analyse en cours…</> : <><Mail size={14} /> Analyser</>}
                    </button>
                  </div>

                  <p className="text-xs text-center" style={{ color: '#374f67' }}>
                    Utilise ta première clé API active · <Link href="/dashboard/api" className="text-[#7dd3fc] hover:underline" onClick={onClose}>Gérer les clés</Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
export function DashboardHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((s, i) => ({
    label: crumbMap[s] ?? s,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Vue d'ensemble"
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
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
              {['Toutes', 'Critiques', 'Quarantaine'].map((t, i) => (
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
            <Download size={12} />Exporter
          </Button>

          {/* Scan email — now functional */}
          <Button
            variant="primary"
            size="sm"
            className="hidden md:flex gap-1.5"
            onClick={() => setShowScanModal(true)}
          >
            <Mail size={12} />Scanner email
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
              <div className="absolute right-0 mt-2 w-80 bg-[#0c1526] border border-[#1e2a3a] rounded-2xl shadow-2xl overflow-hidden z-50">
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
              <Avatar src={user.avatar} name={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email} size="sm" />
            </Link>
          )}
        </div>
      </header>

      {/* Scan Modal */}
      {showScanModal && <ScanModal onClose={() => setShowScanModal(false)} />}
    </>
  )
}
