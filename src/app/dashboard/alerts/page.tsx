'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Mail, ShieldAlert, CheckCircle2, ShieldX, Skull } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

// Simulation d'une interface locale de Threat pour le typage
interface Threat {
  id: string
  created_at: string
  type: string
  severity: string
  sender_email: string
  subject: string
  status: string
  ai_score: number
}

export default function AlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Threat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchAlerts()
    }
  }, [user])

  const fetchAlerts = async () => {
    setIsLoading(true)
    try {
      // On récupère toutes les menaces de l'utilisateur, triées par date (les plus récentes d'abord)
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des alertes', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'text-[#fb7185] bg-[#fb7185]/10 border-[#fb7185]/20'
    if (severity === 'high') return 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20'
    if (severity === 'medium') return 'text-[#7dd3fc] bg-[#7dd3fc]/10 border-[#7dd3fc]/20'
    return 'text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20'
  }

  const getThreatIcon = (type: string) => {
    if (type === 'malware') return <Skull size={18} className="text-[#fb7185]" />
    if (type === 'spear-phishing') return <ShieldX size={18} className="text-[#fbbf24]" />
    return <AlertTriangle size={18} className="text-[#fb7185]" />
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#eaf2fb] flex items-center gap-2">
          <AlertTriangle size={24} className="text-[#fb7185]" />
          Alertes de Sécurité
        </h1>
        <p className="text-[#7a96b4] text-sm mt-1">
          Centre de réponse immédiate aux menaces identifiées par l'IA.
        </p>
      </motion.div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[#eaf2fb]">Flux d'alertes en temps réel</h2>
          <Badge variant="outline" className="border-[#fb7185]/30 text-[#fb7185]">
            {alerts.length} menace{alerts.length > 1 ? 's' : ''} interceptée{alerts.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-[#7dd3fc] border-t-transparent animate-spin mb-4" />
            <p className="text-[#7a96b4] text-sm">Chargement du flux sécuritaire...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#34d399]/5 border border-[#34d399]/10 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[#34d399]/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-[#34d399]" />
            </div>
            <h3 className="text-lg font-semibold text-[#34d399] mb-1">Aucune alerte active</h3>
            <p className="text-[#7a96b4] text-sm max-w-sm">
              Votre infrastructure est sécurisée. L'Intelligence Artificielle n'a détecté aucune menace nécessitant votre attention.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative bg-[#0c1526] border border-[#1a2740] rounded-2xl p-5 hover:border-[#253347] transition-all group overflow-hidden"
              >
                {/* Accent line on the left indicating severity */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    backgroundColor: alert.severity === 'critical' ? '#fb7185' : alert.severity === 'high' ? '#fbbf24' : '#7dd3fc'
                  }}
                />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Info Principale */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#060d18] border border-[#1a2740] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      {getThreatIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[#eaf2fb] font-semibold text-sm capitalize">
                          {alert.type.replace('-', ' ')}
                        </span>
                        <span className="flex items-center gap-1 text-[#7a96b4] text-xs ml-auto">
                          <Clock size={12} />
                          {new Date(alert.created_at).toLocaleString('fr-FR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <h3 className="text-[#eaf2fb] text-base font-medium mb-1 truncate">
                        {alert.subject}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-[#7a96b4] text-xs">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{alert.sender_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-[#1a2740] pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                    <div className="flex flex-col items-center md:items-end mb-2">
                      <span className="text-[10px] text-[#7a96b4] font-semibold uppercase tracking-wider mb-1">Score IA</span>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-[#fb7185]/20 relative">
                        <span className="text-[#fb7185] font-bold text-sm">{alert.ai_score}</span>
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="21" cy="21" r="19" stroke="currentColor" strokeWidth="3" fill="none" className="text-[#fb7185]" strokeDasharray="120" strokeDashoffset={120 - (120 * alert.ai_score / 100)} />
                        </svg>
                      </div>
                    </div>
                    <Badge variant={alert.status === 'blocked' ? 'danger' : 'info'} className="text-[10px] w-full text-center justify-center">
                      {alert.status === 'blocked' ? 'Bloqué' : 'Quarantaine'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
