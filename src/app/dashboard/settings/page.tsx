'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Lock,
  Bell,
  Plug,
  Camera,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Save,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'

type Tab = 'profile' | 'security' | 'notifications'

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'security', label: 'Sécurité', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-[#7dd3fc]' : 'bg-[#1a2740]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

const sessions = [
  { device: 'Chrome — macOS', ip: '192.168.1.42', location: 'Paris, France', current: true, lastSeen: 'Maintenant' },
  { device: 'Safari — iPhone', ip: '82.64.19.7', location: 'Paris, France', current: false, lastSeen: 'Il y a 2 heures' },
  { device: 'Firefox — Windows', ip: '91.198.14.22', location: 'Lyon, France', current: false, lastSeen: 'Il y a 3 jours' },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [company, setCompany] = useState(user?.company ?? '')

  // Security
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [factorId, setFactorId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [dbSessions, setDbSessions] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.app_metadata?.provider && user.app_metadata.provider !== 'email') {
        setIsOAuthUser(true)
      }
      
      const { data } = await supabase.auth.mfa.listFactors()
      if (data?.totp?.length && data.totp[0].status === 'verified') {
        setTwoFAEnabled(true)
        setFactorId(data.totp[0].id)
      } else {
        setTwoFAEnabled(false)
      }

      const { data: sessionData } = await supabase.from('user_sessions').select('*').eq('is_active', true).order('last_seen', { ascending: false })
      if (sessionData) setDbSessions(sessionData)
    }
    init()
  }, [])
  const [notifs, setNotifs] = useState({
    emailNewThreats: true,
    emailWeeklyReport: true,
    emailCriticalAlerts: true,
    emailDailySummary: false,
    smsNewThreats: false,
    smsCriticalAlerts: true,
    slackNewThreats: true,
    slackWeeklyReport: false,
    slackCriticalAlerts: true,
    slackDailySummary: true,
  })

  // Integrations
  const [integrations, setIntegrations] = useState({
    slack: { connected: true, webhook: 'https://hooks.slack.com/services/T0X9B/B08N7/xxxxx' },
    teams: { connected: false, webhook: '' },
    zapier: { connected: true, webhook: 'https://hooks.zapier.com/hooks/catch/xxxxxx/yyyyy' },
    apiWebhook: { connected: false, webhook: '' },
  })

  const handleSaveProfile = () => {
    addToast('success', 'Profil mis à jour', 'Vos informations ont été sauvegardées.')
  }

  const handleChangePwd = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      addToast('error', 'Champs manquants', 'Veuillez remplir tous les champs.')
      return
    }
    if (newPwd !== confirmPwd) {
      addToast('error', 'Erreur', 'Les nouveaux mots de passe ne correspondent pas.')
      return
    }
    if (newPwd.length < 6) {
      addToast('error', 'Mot de passe trop court', 'Minimum 6 caractères requis.')
      return
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) {
      addToast('error', 'Erreur', error.message)
    } else {
      addToast('success', 'Mot de passe modifié', 'Votre mot de passe a été mis à jour.')
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    }
  }

  const handleToggleMFA = async (enable: boolean) => {
    if (!enable && factorId) {
      if (confirm('Êtes-vous sûr de vouloir désactiver la 2FA ?')) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId })
        if (!error) {
          setTwoFAEnabled(false)
          setFactorId('')
          setQrCode('')
          addToast('success', 'A2F désactivée', '')
        } else {
          addToast('error', 'Erreur', error.message)
        }
      }
      return
    }

    if (enable) {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) {
        addToast('error', 'Erreur MFA', error.message)
        return
      }
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
    }
  }

  const handleVerifyMFACode = async () => {
    if (!mfaCode) return addToast('error', 'Entrez le code', '')
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeErr) return addToast('error', 'Erreur', challengeErr.message)

    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: mfaCode })
    if (error) {
      addToast('error', 'Code invalide', error.message)
    } else {
      setTwoFAEnabled(true)
      setQrCode('')
      setMfaCode('')
      addToast('success', 'A2F Activée', 'Authentification forte activée.')
    }
  }

  const handleRevokeSession = async (id: string, device: string) => {
    const { error } = await supabase.from('user_sessions').update({ is_active: false }).eq('id', id)
    if (!error) {
      setDbSessions(prev => prev.filter(s => s.id !== id))
      addToast('info', 'Session révoquée', device)
    } else {
      addToast('error', 'Erreur', error.message)
    }
  }

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))
    addToast('info', 'Préférence mise à jour', '')
  }

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations((prev) => ({
      ...prev,
      [key]: { ...prev[key], connected: !prev[key].connected },
    }))
    const int = integrations[key]
    addToast(
      int.connected ? 'info' : 'success',
      int.connected ? 'Intégration déconnectée' : 'Intégration connectée',
      key.charAt(0).toUpperCase() + key.slice(1)
    )
  }

  const inputClass =
    'w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2.5 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 transition-colors placeholder:text-[#7a96b4]'

  return (
    <div className="space-y-6 max-w-4xl pt-2">      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 p-1 bg-[#0c1526] border border-[#1a2740] rounded-2xl w-fit"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#7dd3fc]/15 text-[#7dd3fc] border border-[#7dd3fc]/30'
                  : 'text-[#7a96b4] hover:text-[#eaf2fb]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h2 className="text-base font-semibold text-[#eaf2fb] mb-5">Informations du profil</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#1a2740]">
              <div className="relative group">
                <Avatar name={`${firstName} ${lastName}`} size="xl" />
                <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-[#eaf2fb] font-semibold">{firstName} {lastName}</p>
                <p className="text-[#7a96b4] text-sm">{email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => addToast('info', 'Upload simulé', 'Fonctionnalité disponible en production.')}
                >
                  <Camera size={12} /> Changer l'avatar
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Entreprise</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Rôle</label>
                <div className="flex items-center gap-2 h-10">
                  <Badge variant="info">Administrateur</Badge>
                  <span className="text-[#7a96b4] text-xs">Non modifiable</span>
                </div>
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Plan</label>
                <div className="flex items-center gap-2 h-10">
                  <Badge variant="success">Pro</Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={handleSaveProfile}>
                <Save size={14} /> Enregistrer
              </Button>
              <Button variant="ghost">Annuler</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <h2 className="text-base font-semibold text-[#eaf2fb] mb-5">Changer le mot de passe</h2>
            
            {isOAuthUser ? (
              <div className="p-4 bg-[rgba(65,232,196,.05)] border border-[rgba(65,232,196,.2)] rounded-xl text-sm mb-2 text-[#eaf2fb]">
                <p className="font-semibold mb-1">🔐 Connecté via un service tiers</p>
                <p className="text-[#7a96b4] text-xs">La sécurité de votre authentification est déléguée à {(user as any)?.app_metadata?.provider || 'Google'}. Vous ne pouvez pas modifier votre mot de passe depuis cette interface.</p>
              </div>
            ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a96b4] hover:text-[#eaf2fb]"
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a96b4] hover:text-[#eaf2fb]"
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPwd && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          backgroundColor:
                            newPwd.length >= i * 3
                              ? i <= 1 ? '#fb7185' : i <= 2 ? '#fbbf24' : i <= 3 ? '#7dd3fc' : '#34d399'
                              : '#1a2740',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <Button onClick={handleChangePwd}>
                <Lock size={14} /> Modifier le mot de passe
              </Button>
            </div>
            )}
          </Card>

          {/* 2FA */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#eaf2fb]">Authentification à deux facteurs</h2>
                <p className="text-[#7a96b4] text-sm mt-0.5">
                  Protégez votre compte avec un code TOTP en plus du mot de passe.
                </p>
              </div>
              <Toggle
                checked={twoFAEnabled || !!qrCode}
                onChange={handleToggleMFA}
              />
            </div>
            {(twoFAEnabled || qrCode) && (
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 bg-[#060d18] rounded-xl border border-[#1a2740]">
                {qrCode ? (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-start gap-6">
                      <img src={qrCode} alt="QR Code 2FA" className="w-32 h-32 bg-white rounded-lg flex-shrink-0 object-contain p-2" />
                      <div className="text-sm text-[#7a96b4]">
                        <p className="text-[#eaf2fb] font-medium mb-1">Scannez ce QR code</p>
                        <p>Utilisez Google Authenticator, Authy ou une application TOTP compatible pour scanner ce code.</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input type="text" placeholder="Code à 6 chiffres" value={mfaCode} onChange={e=>setMfaCode(e.target.value)} className={inputClass + ' max-w-[150px] text-center tracking-widest'} />
                      <Button onClick={handleVerifyMFACode} variant="primary">Vérifier et Activer</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[#32d583] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[rgba(50,213,131,.1)] flex items-center justify-center">
                      <Lock size={14} />
                    </div>
                    <span>L'authentification à double facteur est actuellement active sur votre compte.</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Sessions */}
          <Card>
            <div className="flex items-center gap-2 mb-4 justify-between">
              <h2 className="text-base font-semibold text-[#eaf2fb]">Sessions actives</h2>
            </div>
            
            {dbSessions.length === 0 ? (
              <p className="text-sm text-[#7a96b4]">Chargement des sessions... (Assurez-vous d'avoir exécuté le script SQL si cela reste vide)</p>
            ) : (
              <div className="space-y-3">
                {dbSessions.map((s) => {
                  const isCurrent = typeof window !== 'undefined' && localStorage.getItem('tracked_session') === s.id
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 bg-[#060d18] rounded-xl border border-[#1a2740]"
                    >
                      <div className="flex items-center gap-3">
                        {s.device?.includes('iPhone') || s.device?.includes('iOS') || s.device?.includes('Android') ? (
                          <Smartphone size={18} className="text-[#7a96b4]" />
                        ) : (
                          <Monitor size={18} className="text-[#7a96b4]" />
                        )}
                        <div>
                          <p className="text-[#eaf2fb] text-sm font-medium">
                            {s.device}
                            {isCurrent && (
                              <Badge variant="success" className="ml-2 text-xs">Session Actuelle</Badge>
                            )}
                          </p>
                          <p className="text-[#7a96b4] text-xs">
                             IP: {s.ip || 'Inconnue'} · {new Date(s.last_seen).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevokeSession(s.id, s.device)}
                        >
                          Révoquer
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {[
            {
              channel: 'Email',
              icon: '📧',
              items: [
                { key: 'emailNewThreats' as const, label: 'Nouvelles menaces', desc: 'Alerte immédiate à chaque menace détectée' },
                { key: 'emailWeeklyReport' as const, label: 'Rapport hebdomadaire', desc: 'Résumé chaque lundi matin' },
                { key: 'emailCriticalAlerts' as const, label: 'Alertes critiques', desc: 'Uniquement pour les menaces critiques' },
                { key: 'emailDailySummary' as const, label: 'Résumé quotidien', desc: 'Synthèse chaque soir à 18h' },
              ],
            },
            {
              channel: 'SMS',
              icon: '📱',
              items: [
                { key: 'smsNewThreats' as const, label: 'Nouvelles menaces', desc: 'SMS pour chaque menace (peut être fréquent)' },
                { key: 'smsCriticalAlerts' as const, label: 'Alertes critiques', desc: 'SMS uniquement pour le niveau critique' },
              ],
            },
            {
              channel: 'Slack',
              icon: '💬',
              items: [
                { key: 'slackNewThreats' as const, label: 'Nouvelles menaces', desc: 'Message dans #security-alerts' },
                { key: 'slackWeeklyReport' as const, label: 'Rapport hebdomadaire', desc: 'Message dans #security-reports' },
                { key: 'slackCriticalAlerts' as const, label: 'Alertes critiques', desc: 'Mention @channel pour les critiques' },
                { key: 'slackDailySummary' as const, label: 'Résumé quotidien', desc: 'Synthèse quotidienne dans #security' },
              ],
            },
          ].map((group) => (
            <Card key={group.channel}>
              <h2 className="text-base font-semibold text-[#eaf2fb] mb-4">
                <span className="mr-2">{group.icon}</span>
                Notifications {group.channel}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#1a2740]/50 last:border-0">
                    <div>
                      <p className="text-[#eaf2fb] text-sm font-medium">{item.label}</p>
                      <p className="text-[#7a96b4] text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifs[item.key]}
                      onChange={() => toggleNotif(item.key)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  )
}
