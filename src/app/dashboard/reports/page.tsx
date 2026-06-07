'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  totalEmails: number
  safeEmails: number
  maliciousEmails: number
  avgAiScore: number
  threatsByType: { type: string; count: number }[]
  threatsBySeverity: { critical: number; high: number; medium: number; low: number }
  topSenders: { from_email: string; count: number }[]
  rawThreats: ThreatRow[]
}

interface ThreatRow {
  id: string
  type: string
  severity: string
  created_at: string
  email_id?: string
}

type Period = 7 | 30 | 90

const THREAT_TYPES = ['phishing', 'spear-phishing', 'bec', 'malware', 'spam']
const TYPE_LABELS: Record<string, string> = {
  phishing: 'Phishing',
  'spear-phishing': 'Spear-Phishing',
  bec: 'BEC',
  malware: 'Malware',
  spam: 'Spam',
}
const TYPE_COLORS: Record<string, string> = {
  phishing: '#ff5f6d',
  'spear-phishing': '#a78bfa',
  bec: '#f5a623',
  malware: '#7dd3fc',
  spam: '#32d583',
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
}

const EMPTY_DATA: ReportData = {
  totalEmails: 0,
  safeEmails: 0,
  maliciousEmails: 0,
  avgAiScore: 0,
  threatsByType: [],
  threatsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  topSenders: [],
  rawThreats: [],
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function downloadCSV(threats: ThreatRow[], period: Period) {
  const header = ['id', 'type', 'severity', 'created_at', 'email_id']
  const rows = threats.map(t => [t.id, t.type, t.severity, t.created_at, t.email_id ?? ''].join(','))
  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `guardia_threats_last${period}days_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color, icon, index,
}: {
  label: string; value: string; sub?: string; color: string; icon: React.ReactNode; index: number
}) {
  return (
    <motion.div variants={fadeUp} custom={index} initial="hidden" animate="show">
      <Card className="relative overflow-hidden h-full">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-[#4a6580] font-medium mb-2">{label}</p>
            <p
              className="text-3xl font-bold tabular-nums truncate"
              style={{ color, fontFamily: 'Syne, sans-serif' }}
            >
              {value}
            </p>
            {sub && <p className="text-xs text-[#4a6580] mt-1.5">{sub}</p>}
          </div>
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-[#1a2740] overflow-hidden flex-1">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  )
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <div className="h-3 w-24 rounded bg-[#1a2740] mb-4" />
      <div className="h-8 w-20 rounded bg-[#1a2740] mb-2" />
      <div className="h-2.5 w-32 rounded bg-[#1a2740]" />
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [period, setPeriod] = useState<Period>(30)
  const [data, setData] = useState<ReportData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const since = new Date()
    since.setDate(since.getDate() - period)
    const sinceISO = since.toISOString()

    try {
      // ── emails ──
      const { data: emails } = await supabase
        .from('emails')
        .select('id, status, ai_score, from_email')
        .eq('user_id', user.id)
        .gte('created_at', sinceISO)

      const totalEmails = emails?.length ?? 0
      const safeEmails = emails?.filter(e => e.status === 'safe').length ?? 0
      const maliciousEmails = emails?.filter(e => e.status === 'malicious').length ?? 0
      const avgAiScore =
        totalEmails > 0
          ? Math.round(
              (emails ?? []).reduce((sum, e) => sum + (e.ai_score ?? 0), 0) / totalEmails * 10,
            ) / 10
          : 0

      // top 5 senders from malicious emails
      const senderMap: Record<string, number> = {}
      ;(emails ?? [])
        .filter(e => e.status === 'malicious')
        .forEach(e => {
          if (e.from_email) senderMap[e.from_email] = (senderMap[e.from_email] ?? 0) + 1
        })
      const topSenders = Object.entries(senderMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([from_email, count]) => ({ from_email, count }))

      // ── threats ──
      const { data: threats } = await supabase
        .from('threats')
        .select('id, type, severity, created_at, email_id')
        .eq('user_id', user.id)
        .gte('created_at', sinceISO)

      const rawThreats: ThreatRow[] = (threats ?? []) as ThreatRow[]

      // by type
      const typeMap: Record<string, number> = {}
      rawThreats.forEach(t => {
        if (t.type) typeMap[t.type] = (typeMap[t.type] ?? 0) + 1
      })
      const threatsByType = THREAT_TYPES.map(type => ({
        type,
        count: typeMap[type] ?? 0,
      })).filter(x => x.count > 0)

      // by severity
      const threatsBySeverity = {
        critical: rawThreats.filter(t => t.severity === 'critical').length,
        high: rawThreats.filter(t => t.severity === 'high').length,
        medium: rawThreats.filter(t => t.severity === 'medium').length,
        low: rawThreats.filter(t => t.severity === 'low').length,
      }

      setData({
        totalEmails,
        safeEmails,
        maliciousEmails,
        avgAiScore,
        threatsByType,
        threatsBySeverity,
        topSenders,
        rawThreats,
      })
    } catch (err) {
      console.error('Report fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, period, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const detectionRate =
    data.totalEmails > 0
      ? ((data.maliciousEmails / data.totalEmails) * 100).toFixed(1)
      : '0.0'

  const totalThreats = data.rawThreats.length
  const maxTypeCount = Math.max(...data.threatsByType.map(t => t.count), 1)

  const severityTotal =
    data.threatsBySeverity.critical +
    data.threatsBySeverity.high +
    data.threatsBySeverity.medium +
    data.threatsBySeverity.low

  const handleExport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 300))
    downloadCSV(data.rawThreats, period)
    setExporting(false)
  }

  const periods: { label: string; value: Period }[] = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
  ]

  return (
    <div className="min-h-screen bg-[#060d18] text-[#eaf2fb] p-6 lg:p-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#eaf2fb]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Reports
          </h1>
          <p className="text-sm text-[#4a6580] mt-0.5">
            Security analytics for{' '}
            <span className="text-[#7dd3fc]">{user?.company || 'your organisation'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0d1520] border border-[#1a2740]">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  period === p.value
                    ? 'bg-[#1a2740] text-[#7dd3fc] shadow-sm'
                    : 'text-[#4a6580] hover:text-[#8aa8c0]',
                ].join(' ')}
              >
                Last {p.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            isLoading={exporting}
            disabled={data.rawThreats.length === 0}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </Button>

          {/* Refresh */}
          <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
            <svg
              className={['w-3.5 h-3.5', loading ? 'animate-spin' : ''].join(' ')}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            index={0}
            label="Emails Scanned"
            value={fmtNum(data.totalEmails)}
            sub={`${data.safeEmails} safe · ${data.maliciousEmails} malicious`}
            color="#7dd3fc"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <KpiCard
            index={1}
            label="Threats Blocked"
            value={fmtNum(totalThreats)}
            sub={`across ${period}-day window`}
            color="#ff5f6d"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            }
          />
          <KpiCard
            index={2}
            label="Detection Rate"
            value={`${detectionRate}%`}
            sub="of all emails flagged"
            color="#a78bfa"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <KpiCard
            index={3}
            label="Avg AI Score"
            value={data.avgAiScore > 0 ? `${data.avgAiScore}` : '—'}
            sub="risk confidence (0–100)"
            color="#32d583"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Threat Breakdown */}
        <div className="lg:col-span-2">
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[#c8d8e8]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Threat Breakdown
                </h2>
                <span className="text-xs text-[#4a6580]">{totalThreats} total</span>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="h-2.5 w-28 rounded bg-[#1a2740]" />
                        <div className="flex-1 h-1.5 rounded bg-[#1a2740]" />
                        <div className="h-2.5 w-8 rounded bg-[#1a2740]" />
                      </div>
                    ))}
                  </div>
                ) : data.threatsByType.length === 0 ? (
                  <EmptyState label="No threats recorded in this period" />
                ) : (
                  <div className="space-y-3.5">
                    {THREAT_TYPES.map(type => {
                      const entry = data.threatsByType.find(t => t.type === type)
                      const count = entry?.count ?? 0
                      const pct = Math.round((count / maxTypeCount) * 100)
                      const totalPct = totalThreats > 0 ? ((count / totalThreats) * 100).toFixed(1) : '0.0'
                      const color = TYPE_COLORS[type] ?? '#7dd3fc'
                      return (
                        <div key={type} className="flex items-center gap-3 group">
                          <div className="w-[120px] shrink-0 flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: color }}
                            />
                            <span className="text-xs text-[#8aa8c0] truncate">{TYPE_LABELS[type]}</span>
                          </div>
                          <ProgressBar pct={pct} color={color} />
                          <div className="w-[70px] shrink-0 text-right">
                            <span className="text-xs font-semibold tabular-nums" style={{ color }}>
                              {count}
                            </span>
                            <span className="text-[10px] text-[#4a6580] ml-1">({totalPct}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>

        {/* Severity Distribution */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show">
          <Card className="h-full">
            <h2 className="font-semibold text-[#c8d8e8] mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Severity Distribution
            </h2>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="h-5 w-20 rounded-md bg-[#1a2740]" />
                    <div className="h-5 w-8 rounded bg-[#1a2740]" />
                  </div>
                ))}
              </div>
            ) : severityTotal === 0 ? (
              <EmptyState label="No severity data" />
            ) : (
              <div className="space-y-3">
                {(
                  [
                    { key: 'critical', label: 'Critical', variant: 'critical' as const, color: '#ff5f6d' },
                    { key: 'high', label: 'High', variant: 'high' as const, color: '#f5a623' },
                    { key: 'medium', label: 'Medium', variant: 'medium' as const, color: '#5e9ef7' },
                    { key: 'low', label: 'Low', variant: 'low' as const, color: '#32d583' },
                  ] as const
                ).map(({ key, label, variant, color }) => {
                  const count = data.threatsBySeverity[key]
                  const pct = severityTotal > 0 ? ((count / severityTotal) * 100).toFixed(0) : '0'
                  return (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant={variant} dot>{label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#4a6580]">{pct}%</span>
                        <span
                          className="text-sm font-bold tabular-nums w-8 text-right"
                          style={{ color }}
                        >
                          {count}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {/* Stacked bar */}
                <div className="mt-4 h-2 rounded-full overflow-hidden flex gap-0.5">
                  {(
                    [
                      { key: 'critical', color: '#ff5f6d' },
                      { key: 'high', color: '#f5a623' },
                      { key: 'medium', color: '#5e9ef7' },
                      { key: 'low', color: '#32d583' },
                    ] as const
                  ).map(({ key, color }) => {
                    const pct = severityTotal > 0
                      ? (data.threatsBySeverity[key] / severityTotal) * 100
                      : 0
                    return pct > 0 ? (
                      <motion.div
                        key={key}
                        className="h-full rounded-sm"
                        style={{ background: color, width: `${pct}%` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    ) : null
                  })}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ── Top Senders ── */}
      <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="font-semibold text-[#c8d8e8]"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Top Malicious Senders
              </h2>
              <p className="text-xs text-[#4a6580] mt-0.5">Most frequent threat sources in the selected period</p>
            </div>
            <Badge variant="critical" dot>Live</Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#1a2740]" />
                  <div className="flex-1 h-3 rounded bg-[#1a2740]" />
                  <div className="h-5 w-12 rounded bg-[#1a2740]" />
                </div>
              ))}
            </div>
          ) : data.topSenders.length === 0 ? (
            <EmptyState label="No malicious senders detected in this period" />
          ) : (
            <div className="divide-y divide-[#1a2740]">
              {data.topSenders.map((sender, i) => {
                const initials = sender.from_email
                  .split('@')[0]
                  .slice(0, 2)
                  .toUpperCase()
                const rank = i + 1
                const maxCount = data.topSenders[0].count
                const barPct = Math.round((sender.count / maxCount) * 100)
                return (
                  <motion.div
                    key={sender.from_email}
                    variants={fadeUp}
                    custom={6 + i * 0.5}
                    initial="hidden"
                    animate="show"
                    className="flex items-center gap-4 py-3 group"
                  >
                    {/* Rank */}
                    <span
                      className="text-xs font-bold tabular-nums w-4 shrink-0 text-center"
                      style={{ color: rank === 1 ? '#ff5f6d' : rank === 2 ? '#f5a623' : '#4a6580' }}
                    >
                      {rank}
                    </span>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#1a2740] border border-[#253347] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#ff5f6d]">{initials}</span>
                    </div>

                    {/* Email + bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#c8d8e8] truncate font-mono">{sender.from_email}</p>
                      <div className="mt-1.5">
                        <ProgressBar pct={barPct} color="#ff5f6d" />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="shrink-0 text-right">
                      <Badge variant="critical">{sender.count}</Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Card>
      </motion.div>

    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-10 h-10 rounded-full bg-[#1a2740] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#2a3d55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm text-[#2a3d55] text-center">{label}</p>
    </div>
  )
}
