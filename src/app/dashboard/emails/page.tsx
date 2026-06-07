'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  Archive,
  Flag,
  Loader2,
  InboxIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime, getScoreColor } from '@/lib/utils'

const PAGE_SIZE = 10

// ─── Types ──────────────────────────────────────────────────────────────────

interface SupabaseEmail {
  id: string
  from_email: string
  subject: string
  status: 'safe' | 'malicious'
  ai_score: number
  threat_type: string | null
  created_at: string
  user_id: string
}

type TabStatus = 'all' | 'safe' | 'suspicious' | 'malicious'

// ─── Tab config ──────────────────────────────────────────────────────────────

const tabConfig: { key: TabStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all', label: 'Tous', icon: Mail, color: '#7dd3fc' },
  { key: 'safe', label: 'Sûrs', icon: ShieldCheck, color: '#34d399' },
  { key: 'suspicious', label: 'Suspects', icon: ShieldAlert, color: '#fbbf24' },
  { key: 'malicious', label: 'Malveillants', icon: ShieldX, color: '#fb7185' },
]

// ─── Helper: derive display status from DB row ────────────────────────────────
// suspicious → status=malicious AND 45 <= ai_score < 75
// malicious  → status=malicious AND ai_score >= 75

function deriveDisplayStatus(email: SupabaseEmail): TabStatus {
  if (email.status === 'safe') return 'safe'
  if (email.ai_score >= 75) return 'malicious'
  if (email.ai_score >= 45) return 'suspicious'
  return 'safe'
}

// ─── UI Components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TabStatus }) {
  const map: Record<TabStatus, { variant: 'success' | 'high' | 'critical' | 'default'; label: string }> = {
    all: { variant: 'default', label: 'Inconnu' },
    safe: { variant: 'success', label: 'Sûr' },
    suspicious: { variant: 'high', label: 'Suspect' },
    malicious: { variant: 'critical', label: 'Malveillant' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

function ScoreBar({ score }: { score: number }) {
  const color = getScoreColor(score)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1a2740] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs font-semibold w-7 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

function AIScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score)
  const r = 54
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1a2740" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" textAnchor="middle" fill="#eaf2fb" fontSize="28" fontWeight="bold" fontFamily="monospace">
          {score}
        </text>
        <text x="70" y="85" textAnchor="middle" fill="#7a96b4" fontSize="12">
          / 100
        </text>
      </svg>
      <p className="text-sm text-[#7a96b4] mt-1">Score de risque IA</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmailsPage() {
  const { addToast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  const [emails, setEmails] = useState<SupabaseEmail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabStatus>('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedEmail, setSelectedEmail] = useState<SupabaseEmail | null>(null)

  // keep a stable ref to user.id for the realtime subscription
  const userIdRef = useRef<string | undefined>(user?.id)
  useEffect(() => { userIdRef.current = user?.id }, [user?.id])

  // ── Fetch emails ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return

    async function fetchEmails() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('emails')
        .select('id, from_email, subject, status, ai_score, threat_type, created_at, user_id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching emails:', error)
        addToast('error', 'Erreur de chargement', 'Impossible de récupérer les emails.')
      } else {
        setEmails(data ?? [])
      }
      setIsLoading(false)
    }

    fetchEmails()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`emails:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newEmail = payload.new as SupabaseEmail
          setEmails((prev) => [newEmail, ...prev])
          addToast('info', 'Nouvel email analysé', `De : ${newEmail.from_email}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtering & pagination ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return emails.filter((e) => {
      const displayStatus = deriveDisplayStatus(e)

      const matchTab =
        activeTab === 'all' ||
        displayStatus === activeTab

      const matchSearch =
        !search ||
        e.from_email.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase())

      const matchSeverity =
        severityFilter === 'all' ||
        (severityFilter === 'high' && e.ai_score >= 80) ||
        (severityFilter === 'medium' && e.ai_score >= 40 && e.ai_score < 80) ||
        (severityFilter === 'low' && e.ai_score < 40)

      return matchTab && matchSearch && matchSeverity
    })
  }, [emails, search, activeTab, severityFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = useMemo(() => ({
    all: emails.length,
    safe: emails.filter((e) => deriveDisplayStatus(e) === 'safe').length,
    suspicious: emails.filter((e) => deriveDisplayStatus(e) === 'suspicious').length,
    malicious: emails.filter((e) => deriveDisplayStatus(e) === 'malicious').length,
  }), [emails])

  const handleAction = (action: string) => {
    const msgs: Record<string, string> = {
      safe: 'Email marqué comme sûr',
      quarantine: 'Email mis en quarantaine',
      report: 'Email signalé pour analyse',
    }
    addToast('success', msgs[action] || 'Action effectuée', 'La liste a été mise à jour.')
    setSelectedEmail(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#eaf2fb]">Emails Analysés</h1>
          <p className="text-[#7a96b4] text-sm mt-0.5">
            {isLoading ? 'Chargement…' : `${emails.length} email${emails.length !== 1 ? 's' : ''} dans la base`}
          </p>
        </div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 flex-wrap"
      >
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? 'border-[#7dd3fc]/40 bg-[#7dd3fc]/10 text-[#7dd3fc]'
                  : 'border-[#1a2740] bg-[#0c1526]/60 text-[#7a96b4] hover:border-[#1a2740]/80 hover:bg-white/5'
              }`}
              style={isActive ? { borderColor: `${tab.color}40`, backgroundColor: `${tab.color}12`, color: tab.color } : {}}
            >
              <Icon size={14} />
              {tab.label}
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                style={
                  isActive
                    ? { backgroundColor: `${tab.color}20`, color: tab.color }
                    : { backgroundColor: '#1a2740', color: '#7a96b4' }
                }
              >
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2">
              <Search size={15} className="text-[#7a96b4] flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher expéditeur, sujet…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="bg-transparent text-[#eaf2fb] text-sm outline-none w-full placeholder:text-[#7a96b4]"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1) }}
              className="bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2 text-sm text-[#eaf2fb] outline-none"
            >
              <option value="all">Tout niveau de risque</option>
              <option value="high">Risque élevé (≥80)</option>
              <option value="medium">Risque moyen (40–79)</option>
              <option value="low">Risque faible ({"<"}40)</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-0 overflow-hidden">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#7a96b4]">
              <Loader2 size={36} className="animate-spin text-[#7dd3fc]" />
              <p className="text-sm">Chargement des emails…</p>
            </div>
          ) : emails.length === 0 ? (
            /* Empty state (no emails at all) */
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#7a96b4]">
              <InboxIcon size={48} className="text-[#1a2740]" />
              <p className="text-base font-medium text-[#eaf2fb]">Aucun email analysé</p>
              <p className="text-sm">Les emails analysés par Guardia apparaîtront ici.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a2740]">
                    <th className="text-left text-[#7a96b4] font-medium px-4 py-3">De</th>
                    <th className="text-left text-[#7a96b4] font-medium px-4 py-3">Sujet</th>
                    <th className="text-left text-[#7a96b4] font-medium px-4 py-3">Reçu</th>
                    <th className="text-left text-[#7a96b4] font-medium px-4 py-3">Statut</th>
                    <th className="text-left text-[#7a96b4] font-medium px-4 py-3 min-w-[120px]">Score IA</th>
                    <th className="text-left text-[#7a96b4] font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#7a96b4]">
                        <div className="flex flex-col items-center gap-3">
                          <InboxIcon size={32} className="text-[#1a2740]" />
                          <span>Aucun email correspond à votre recherche.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((email) => (
                      <tr
                        key={email.id}
                        className="border-b border-[#1a2740]/40 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setSelectedEmail(email)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={email.from_email} size="sm" />
                            <p className="text-[#eaf2fb] text-xs truncate max-w-[160px]">{email.from_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#eaf2fb] truncate max-w-[220px]">{email.subject}</p>
                        </td>
                        <td className="px-4 py-3 text-[#7a96b4] text-xs whitespace-nowrap">
                          {formatDateTime(email.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={deriveDisplayStatus(email)} />
                        </td>
                        <td className="px-4 py-3 min-w-[120px]">
                          <ScoreBar score={email.ai_score} />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmail(email)}
                          >
                            Détail
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination — only when not loading and there are emails */}
          {!isLoading && emails.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a2740]">
              <p className="text-[#7a96b4] text-sm">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} — page {page} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={15} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-[#7dd3fc]/15 text-[#7dd3fc] border border-[#7dd3fc]/30'
                        : 'text-[#7a96b4] hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Email Detail Modal */}
      <Modal
        isOpen={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
        title="Détail de l'email"
        size="lg"
      >
        {selectedEmail && (() => {
          const displayStatus = deriveDisplayStatus(selectedEmail)
          return (
            <div className="space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-[#7a96b4] text-xs mb-1">De</p>
                  <p className="text-[#eaf2fb] font-medium break-all">{selectedEmail.from_email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#7a96b4] text-xs mb-1">Sujet</p>
                  <p className="text-[#eaf2fb] font-medium">{selectedEmail.subject}</p>
                </div>
                <div>
                  <p className="text-[#7a96b4] text-xs mb-1">Reçu le</p>
                  <p className="text-[#eaf2fb]">{formatDateTime(selectedEmail.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={displayStatus} />
                  {selectedEmail.threat_type && (
                    <Badge variant="high">{selectedEmail.threat_type}</Badge>
                  )}
                </div>
              </div>

              {/* AI Score Gauge */}
              <div className="flex flex-col items-center py-2 border-t border-[#1a2740]">
                <AIScoreGauge score={selectedEmail.ai_score} />
              </div>

              {/* Risk Explanation */}
              <div className="rounded-xl bg-[#060d18] border border-[#1a2740] p-4 text-sm text-[#7a96b4]">
                <p className="text-[#eaf2fb] font-medium mb-1">Analyse IA</p>
                {selectedEmail.ai_score >= 80 ? (
                  <p>
                    Cet email présente un risque <span className="text-[#fb7185] font-semibold">très élevé</span>.
                    Plusieurs indicateurs critiques ont été détectés : usurpation d&apos;identité, liens malveillants
                    et/ou pièces jointes dangereuses. Il a été automatiquement bloqué.
                  </p>
                ) : selectedEmail.ai_score >= 40 ? (
                  <p>
                    Cet email présente un risque <span className="text-[#fbbf24] font-semibold">modéré</span>.
                    Certains éléments atypiques ont été relevés. Une vérification manuelle est recommandée
                    avant d&apos;interagir avec son contenu.
                  </p>
                ) : (
                  <p>
                    Cet email semble <span className="text-[#34d399] font-semibold">légitime</span>.
                    Aucun indicateur malveillant significatif n&apos;a été détecté. Le score de risque est faible.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-[#1a2740]">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleAction('safe')}
                >
                  <CheckCircle size={14} /> Marquer sûr
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleAction('quarantine')}
                >
                  <Archive size={14} /> Quarantaine
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('report')}
                >
                  <Flag size={14} /> Signaler
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSelectedEmail(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
