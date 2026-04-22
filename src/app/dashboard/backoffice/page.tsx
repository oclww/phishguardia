'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Mail, Activity, Eye, Key } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate } from '@/lib/utils'

export default function BackofficePage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [globalStats, setGlobalStats] = useState({ emails: 0, threats: 0, keys: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    if (user?.email === 'oclaw78@gmail.com') {
      loadData()
    } else {
      setError("Accès refusé. Cette page est réservée au Super Administrateur.")
      setIsLoading(false)
    }
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Pour une vraie vue globale, RLS doit être bypassée ou configuré pour l'admin.
      // Si la policy Super Admin est active, on recevra toutes les données.
      
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*')
      if (pErr) throw pErr

      const { data: emailsProps } = await supabase.from('emails').select('*', { count: 'exact', head: true })
      const { data: threatsProps } = await supabase.from('threats').select('*', { count: 'exact', head: true })
      const { data: keysProps } = await supabase.from('api_keys').select('*', { count: 'exact', head: true })

      setGlobalStats({
        emails: emailsProps?.length || 0, // Placeholder, vrai count nécessite une requête admin ou RPC
        threats: threatsProps?.length || 0,
        keys: keysProps?.length || 0
      })

      // Simulated aggregations pour l'instant vue qu'on a pas de count group by natif coté client
      // Dans un vrai SAAS backoffice on ferait ça coté Serveur (Route API avec le Service_Role)
      setCompanies(profiles || [])
      
    } catch (err: any) {
      console.error(err)
      setError("Erreur de communication avec la base de données. Avez-vous exécuté la requête SQL RLS ?")
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/20 px-6 py-4 rounded-xl text-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#fbbf24] flex items-center gap-2">
          <ShieldAlert size={24} />
          Backoffice Super Admin
        </h1>
        <p className="text-[#7a96b4] text-sm mt-1">Vue panoramique de l'écosystème PhishGuard.IA</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Entreprises Clientes', value: companies.length, icon: Activity, color: '#34d399' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card padding="md" className="border-[#fbbf24]/20">
              <div className="flex items-center gap-3 mb-2">
                <k.icon size={16} style={{ color: k.color }} />
                <span className="text-[#7a96b4] text-sm font-medium">{k.label}</span>
              </div>
              <p className="text-3xl font-bold font-mono text-[#eaf2fb]">{k.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold text-[#eaf2fb] mb-5">Toutes les entreprises</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2740] pb-2">
                <th className="text-left text-xs font-semibold text-[#7a96b4] uppercase tracking-wider px-4 py-3">Entreprise</th>
                <th className="text-left text-xs font-semibold text-[#7a96b4] uppercase tracking-wider px-4 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-[#7a96b4] uppercase tracking-wider px-4 py-3">Admin Email</th>
                <th className="text-left text-xs font-semibold text-[#7a96b4] uppercase tracking-wider px-4 py-3">Téléphone</th>
                <th className="text-left text-xs font-semibold text-[#7a96b4] uppercase tracking-wider px-4 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-[#7a96b4] uppercase tracking-wider px-4 py-3">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-6 text-[#7a96b4] text-sm">Chargement cryptographique...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-[#7a96b4] text-sm">Aucune donnée trouvée.</td></tr>
              ) : (
                companies.map((c, i) => (
                  <motion.tr 
                    key={c.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#1a2740] hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#eaf2fb] block">{c.company || 'Sans nom'}</span>
                      <span className="text-[10px] text-[#7a96b4]">{c.company_size ? `${c.company_size} employés` : 'Taille inconnue'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#eaf2fb]">{c.first_name} {c.last_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1a2740]/50 rounded-lg w-fit border border-[#1a2740]">
                        <Mail size={12} className="text-[#34d399]" />
                        <span className="text-xs font-mono text-[#c8d8e8]">Non exposé via RLS table profils par défaut sauf pour soi</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#7a96b4]">{c.phone || 'Non renseigné'}</td>
                    <td className="px-4 py-3"><Badge variant="success">{c.plan || 'pro'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[#7a96b4]">{new Date(c.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
