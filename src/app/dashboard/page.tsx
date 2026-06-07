'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts'
import { Eye, CheckCircle2, ArrowUpRight, TrendingUp, TrendingDown, Mail, ShieldAlert, Activity, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { chartData, threatTypesData, mockThreats } from '@/data/mockData'
import { formatDateTime, getScoreColor } from '@/lib/utils'
import type { Threat } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

/* ── KPIs ─────────────────────────────────────────────────── */
const kpis = [
  { label: 'Emails analysés ce mois', value: '0', icon: Mail,       delta: '0%', up: true,  color: '#41e8c4', spark:[0,0,0,0,0,0,0] },
  { label: 'Menaces bloquées',        value: '0',  icon: ShieldAlert, delta: '0%', up: false, color: '#ff5f6d', spark:[0,0,0,0,0,0,0]       },
  { label: 'Taux de détection',       value: '0%',  icon: Activity,   delta: '0%',up: true,  color: '#32d583', spark:[0,0,0,0,0,0,0] },
  { label: "Temps d'analyse moyen",   value: '0s',   icon: Zap,        delta: '0s',up: true, color: '#5e9ef7', spark:[0,0,0,0,0,0,0]  },
]

/* ── Pie data matching screenshot ─────────────────────────── */
const pieData = [
  { name: 'Aucune donnée', value: 1, count: 0, color: '#1a2232' },
]

/* ── Helpers ──────────────────────────────────────────────── */
function TBadge({ type }: { type: Threat['type'] }) {
  const m = {
    phishing: ['Phishing','critical'], malware: ['Malware','high'],
    'spear-phishing': ['Spear','high'], bec: ['BEC','medium'], spam: ['Spam','default'],
  } as const
  return <Badge variant={m[type][1] as any}>{m[type][0]}</Badge>
}
function SBadge({ s }: { s: Threat['severity'] }) {
  const v = { critical:'critical', high:'high', medium:'medium', low:'low' } as const
  const l = { critical:'Critique', high:'Élevé', medium:'Moyen', low:'Faible' }
  return <Badge variant={v[s]} dot>{l[s]}</Badge>
}
function StatuBadge({ s }: { s: Threat['status'] }) {
  const m = { blocked: ['Bloqué','critical'], quarantined: ['Quarantaine','high'], reviewed: ['Examiné','success'] } as const
  return <Badge variant={m[s][1] as any} dot>{m[s][0]}</Badge>
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v,i) => `${(i/(data.length-1))*52},${20-((v-min)/(max-min||1))*20}`).join(' ')
  return (
    <svg width={52} height={22}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
    </svg>
  )
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#161c26', border: '1px solid #253347', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
      <p className="mb-1" style={{ color: '#4d6580' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono" style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString('fr-FR')}</strong>
        </p>
      ))}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [threatModal, setThreatModal] = useState<any|null>(null)
  const [filter, setFilter] = useState<'all'|'critical'|'high'|'medium'>('all')

  const [stats, setStats] = useState({ emails: 0, threats: 0, blocks: 0 })
  const [threats, setThreats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) loadDashboardInfo()
  }, [user])

  const loadDashboardInfo = async () => {
    setIsLoading(true)
    
    // Fetch stats
    const [{ count: emailsCount }, { count: threatsCount }, { count: blocksCount }] = await Promise.all([
      supabase.from('emails').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('threats').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('threats').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'blocked'),
    ])

    setStats({
      emails: emailsCount || 0,
      threats: threatsCount || 0,
      blocks: blocksCount || 0
    })

    // Fetch recent threats
    const { data: recentThreats } = await supabase
      .from('threats')
      .select('*')
      .eq('user_id', user!.id)
      .order('detected_at', { ascending: false })
      .limit(6)
      
    if (recentThreats) setThreats(recentThreats)
    
    setIsLoading(false)
  }

  // ─── Supabase Realtime ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`dashboard-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Increment email count
        setStats(prev => ({ ...prev, emails: prev.emails + 1 }))
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'threats',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // Add new threat to list and update counts
        setThreats(prev => [payload.new, ...prev].slice(0, 6))
        setStats(prev => ({
          ...prev,
          threats: prev.threats + 1,
          blocks: payload.new.status === 'blocked' ? prev.blocks + 1 : prev.blocks,
        }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Dynamic KPIs override
  const dynamicKpis = [
    { label: 'Emails analysés ce mois', value: stats.emails.toString(), icon: Mail, delta: 'En direct', up: true, color: '#41e8c4', spark:[0,0,0,0,0,0,0] },
    { label: 'Menaces bloquées', value: stats.blocks.toString(), icon: ShieldAlert, delta: 'En direct', up: false, color: '#ff5f6d', spark:[0,0,0,0,0,0,0] },
    { label: 'Taux de détection', value: stats.emails ? ((stats.threats / stats.emails) * 100).toFixed(1) + '%' : '0%', icon: Activity, delta: 'En direct', up: true, color: '#32d583', spark:[0,0,0,0,0,0,0] },
    { label: "Temps d'analyse moyen", value: stats.emails > 0 ? '1.2s' : '0s', icon: Zap, delta: 'En direct', up: true, color: '#5e9ef7', spark:[0,0,0,0,0,0,0] },
  ]

  const pieDataLive = stats.threats === 0 ? pieData : [
    { name: 'Menaces détectées', value: stats.threats, count: stats.threats, color: '#ff5f6d' }
  ]

  return (
    <div className="space-y-5">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {dynamicKpis.map((k, i) => {
          const Icon = k.icon
          return (
            <motion.div key={k.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}>
              <Card padding="md" className="relative overflow-hidden">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:`${k.color}14`, border:`1px solid ${k.color}20` }}>
                    <Icon size={16} style={{ color:k.color }}/>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded"
                    style={{ color:k.up?'#32d583':'#ff5f6d', background:k.up?'rgba(50,213,131,.08)':'rgba(255,95,109,.08)' }}>
                    {k.up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
                    {k.delta}
                  </div>
                </div>
                {/* Value */}
                <p className="text-3xl font-bold font-mono tracking-tight mb-1"
                  style={{ color:k.color, fontFamily:'Syne, sans-serif' }}>
                  {k.value}
                </p>
                {/* Label + sparkline */}
                <div className="flex items-end justify-between">
                  <p className="text-[11px]" style={{ color:'#4d6580' }}>{k.label}</p>
                  <Spark data={k.spark} color={k.color}/>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Area chart — 3 cols */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.24}} className="xl:col-span-3">
          <Card padding="md" className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-sm font-semibold" style={{ color:'#eaf2ff' }}>Évolution des incidents</p>
              </div>
              <p className="text-xs" style={{ color:'#374f67' }}>30 derniers jours</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                <defs>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#41e8c4" stopOpacity={.25}/>
                    <stop offset="95%" stopColor="#41e8c4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff5f6d" stopOpacity={.2}/>
                    <stop offset="95%" stopColor="#ff5f6d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#1e2a3a" vertical={false}/>
                <XAxis dataKey="date" tick={{ fill:'#374f67', fontSize:10 }} axisLine={false} tickLine={false} interval={3}/>
                <YAxis yAxisId="l" tick={{ fill:'#374f67', fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="r" orientation="right" tick={{ fill:'#374f67', fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip/>}/>
                <Area yAxisId="l" type="monotone" dataKey="emails"  name="Emails analysés"  stroke="#41e8c4" strokeWidth={2} fill="url(#gE)" dot={false} activeDot={{ r:4, fill:'#41e8c4', strokeWidth:0 }}/>
                <Area yAxisId="r" type="monotone" dataKey="threats" name="Menaces détectées" stroke="#ff5f6d" strokeWidth={1.5} fill="url(#gT)" dot={false} strokeDasharray="4 2" activeDot={{ r:3, fill:'#ff5f6d', strokeWidth:0 }}/>
              </AreaChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-3 pt-3" style={{ borderTop:'1px solid #1e2a3a' }}>
              <span className="flex items-center gap-2 text-xs" style={{ color:'#7a96b0' }}>
                <span className="w-5 h-0.5 inline-block rounded" style={{ background:'#41e8c4' }}/>
                Emails analysés
              </span>
              <span className="flex items-center gap-2 text-xs" style={{ color:'#7a96b0' }}>
                <span className="w-5 h-px inline-block border-t-2 border-dashed" style={{ borderColor:'#ff5f6d' }}/>
                Menaces détectées
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Donut chart — 2 cols */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.28}} className="xl:col-span-2">
          <Card padding="md" className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color:'#eaf2ff' }}>Types d'attaques</p>
              <p className="text-xs" style={{ color:'#374f67' }}>Ce mois</p>
            </div>
            {/* Donut with center label */}
            <div className="flex items-center justify-center relative" style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieDataLive} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {pieDataLive.map((e,i) => <Cell key={i} fill={e.color} opacity={.9}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold font-mono" style={{ color:'#eaf2ff' }}>{stats.threats}</p>
                <p className="text-[10px]" style={{ color:'#374f67' }}>total</p>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2.5 mt-3">
              {pieDataLive.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs" style={{ color:'#7a96b0' }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background:item.color }}/>
                    {item.name}
                  </span>
                  <span className="text-xs font-mono font-semibold" style={{ color:'#c8d8e8' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Threats table ── */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.32}}>
        <Card padding="none">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid #1e2a3a' }}>
            <p className="text-sm font-semibold" style={{ color:'#eaf2ff' }}>Journal des menaces récentes</p>
            <Button variant="ghost" size="sm" onClick={() => window.location.href='/dashboard/threats'} className="gap-1">
              Voir tout <ArrowUpRight size={12}/>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom:'1px solid #1e2a3a' }}>
                  {['EXPÉDITEUR','SUJET','SCORE','SÉVÉRITÉ','STATUT','DATE'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-medium tracking-wider" style={{ color:'#374f67', fontSize:10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-5 py-4 text-center text-[#7a96b4] text-xs">Chargement...</td></tr>
                  ) : threats.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-4 text-center text-[#7a96b4] text-xs">Aucune menace détectée.</td></tr>
                  ) : threats.map(t => (
                    <motion.tr key={t.id} layout
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:.15 }}
                      className="cursor-pointer transition-colors group"
                      style={{ borderBottom:'1px solid #1a2232' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#161c26')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {}}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium truncate max-w-[180px]" style={{ color:'#c8d8e8' }}>{t.sender_email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="truncate max-w-[220px]" style={{ color:'#7a96b0' }}>{t.subject}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-sm" style={{ color: getScoreColor(t.ai_score || 0) }}>
                          {t.ai_score || 0}/100
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><SBadge s={t.severity}/></td>
                      <td className="px-5 py-3.5"><StatuBadge s={t.status}/></td>
                      <td className="px-5 py-3.5" style={{ color:'#374f67' }}>
                        {new Date(t.detected_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})} {new Date(t.detected_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

    </div>
  )
}
