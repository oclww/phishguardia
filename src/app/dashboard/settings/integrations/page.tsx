'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ShieldCheck, RefreshCw, Unlink, CheckCircle2, AlertTriangle, Clock, Zap, Wifi, WifiOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'

interface MailConnection {
  id: string
  provider: 'gmail' | 'outlook'
  email: string
  is_active: boolean
  last_synced_at: string | null
  created_at: string
}

function GmailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      <path fill="#188038" d="M0 5.457L12 14.18 24 5.457v-.92c0-2.006-2.282-3.175-3.909-1.964L12 9.548 3.909 2.573C2.282 1.362 0 2.531 0 4.537v.92z" />
    </svg>
  )
}

export default function MailIntegrationsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  const [connections, setConnections] = useState<MailConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const loadConnections = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('mail_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setConnections(data || [])
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  // Check URL params for success/error after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'gmail_connected') {
      addToast('success', 'Gmail connecté !', 'Vos emails seront analysés automatiquement.')
      window.history.replaceState({}, '', window.location.pathname + '?tab=integrations')
      loadConnections()
    }
    if (params.get('error')) {
      addToast('error', 'Connexion échouée', 'Impossible de connecter Gmail. Réessayez.')
      window.history.replaceState({}, '', window.location.pathname + '?tab=integrations')
    }
  }, [])

  const handleConnect = () => {
    window.location.href = '/api/v1/mail/connect'
  }

  const handleDisconnect = async (conn: MailConnection) => {
    if (!user) return
    setDisconnecting(conn.id)
    try {
      const res = await fetch('/api/v1/mail/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, provider: conn.provider, email: conn.email }),
      })
      if (res.ok) {
        setConnections(prev => prev.filter(c => c.id !== conn.id))
        addToast('info', 'Boîte déconnectée', conn.email)
      } else {
        addToast('error', 'Erreur', 'Impossible de déconnecter')
      }
    } catch {
      addToast('error', 'Erreur réseau', '')
    } finally {
      setDisconnecting(null)
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/v1/mail/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer phishguard-cron-2026` },
      })
      const data = await res.json()
      if (data.success) {
        const total = data.results?.reduce((sum: number, r: any) => sum + (r.newEmails || 0), 0) || 0
        const threats = data.results?.reduce((sum: number, r: any) => sum + (r.threatsFound || 0), 0) || 0
        addToast('success', 'Sync terminée', `${total} email(s) analysé(s) · ${threats} menace(s) détectée(s)`)
        loadConnections()
      } else {
        addToast('error', 'Erreur sync', data.error || '')
      }
    } catch {
      addToast('error', 'Erreur réseau', '')
    } finally {
      setIsSyncing(false)
    }
  }

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais synchronisé'
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    if (diff < 60000) return 'Il y a moins d\'une minute'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>
          Boîtes mail connectées
        </h2>
        <p className="text-sm text-[#7a96b4] mt-1">
          Chaque email entrant est automatiquement analysé par l'IA en temps réel.
        </p>
      </div>

      {/* How it works */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Mail, color: '#7dd3fc', label: 'Email reçu', desc: 'Un nouvel email arrive dans ta boîte' },
            { icon: Zap, color: '#a78bfa', label: 'Analyse IA', desc: 'Heuristique + Gemini en <2 secondes' },
            { icon: ShieldCheck, color: '#32d583', label: 'Dashboard', desc: 'Résultat visible instantanément' },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: '#eaf2fb' }}>{label}</p>
              <p className="text-[11px]" style={{ color: '#4d6580' }}>{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected mailboxes */}
      <div className="space-y-3">
        <AnimatePresence>
          {isLoading ? (
            <Card className="p-6 flex items-center justify-center">
              <RefreshCw size={16} className="animate-spin text-[#7a96b4]" />
            </Card>
          ) : connections.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-8 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(125,211,252,.06)', border: '1px solid rgba(125,211,252,.15)' }}>
                  <WifiOff size={22} style={{ color: '#4d6580' }} />
                </div>
                <p className="text-sm font-semibold text-[#eaf2fb]">Aucune boîte connectée</p>
                <p className="text-xs text-[#4d6580] max-w-xs">
                  Connecte ta boîte Gmail pour que chaque email soit analysé automatiquement dès réception.
                </p>
              </Card>
            </motion.div>
          ) : (
            connections.map(conn => (
              <motion.div key={conn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-[#1a2740]">
                        <GmailIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#eaf2fb]">{conn.email}</p>
                          <Badge variant="success" dot>Actif</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={10} style={{ color: '#4d6580' }} />
                          <p className="text-[11px]" style={{ color: '#4d6580' }}>
                            Dernière sync : {formatLastSync(conn.last_synced_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(conn)}
                      disabled={disconnecting === conn.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ color: '#7a96b4', border: '1px solid #1a2740' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.borderColor = 'rgba(251,113,133,.3)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#7a96b4'; e.currentTarget.style.borderColor = '#1a2740' }}
                    >
                      {disconnecting === conn.id
                        ? <RefreshCw size={12} className="animate-spin" />
                        : <Unlink size={12} />
                      }
                      Déconnecter
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleConnect} className="gap-2">
          <GmailIcon size={15} />
          Connecter une boîte Gmail
        </Button>

        {connections.length > 0 && (
          <Button variant="outline" onClick={handleManualSync} isLoading={isSyncing} className="gap-2">
            <RefreshCw size={14} />
            Forcer une sync maintenant
          </Button>
        )}
      </div>

      {/* Auto-sync info */}
      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(65,232,196,.04)', border: '1px solid rgba(65,232,196,.1)' }}>
        <Wifi size={14} style={{ color: '#41e8c4', marginTop: 1, flexShrink: 0 }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: '#41e8c4' }}>Sync automatique</p>
          <p className="text-xs mt-0.5" style={{ color: '#4d6580' }}>
            Tes emails sont vérifiés automatiquement toutes les <strong style={{ color: '#7a96b0' }}>2 minutes</strong> via Supabase.
            Le résultat apparaît dans le dashboard en temps réel.
          </p>
        </div>
      </div>

      {/* Warning about test mode */}
      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,166,35,.04)', border: '1px solid rgba(245,166,35,.1)' }}>
        <AlertTriangle size={14} style={{ color: '#f5a623', marginTop: 1, flexShrink: 0 }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: '#f5a623' }}>App en mode test Google</p>
          <p className="text-xs mt-0.5" style={{ color: '#4d6580' }}>
            Ton app Google Cloud est en mode "Test". Seuls les emails listés comme <strong style={{ color: '#7a96b0' }}>testeurs</strong> peuvent
            se connecter. Pour supprimer cette limite, publie ton app sur{' '}
            <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener" className="text-[#7dd3fc] hover:underline">
              Google Console → Écran de consentement
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
