'use client'

import { useState } from 'react'
import { CreditCard, Download, TrendingUp, Calendar, AlertCircle, CheckCircle, Zap, Building2, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { mockInvoices } from '@/data/mockData'
import { formatDate, cn } from '@/lib/utils'
import type { Invoice } from '@/types'

const USAGE_CURRENT = 67420
const USAGE_MAX = 100000
const USAGE_PCT = Math.round((USAGE_CURRENT / USAGE_MAX) * 100)

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '29€',
    description: 'Pour les petites équipes',
    features: ['5 utilisateurs', '10 000 emails/mois', 'Détection IA basique', 'Support communautaire'],
    isCurrent: false,
    Icon: Zap,
    color: '#34d399',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '79€',
    description: 'Pour les équipes en croissance',
    features: ['50 utilisateurs', '500 000 emails/mois', 'Détection IA avancée', 'Support prioritaire'],
    isCurrent: false,
    Icon: Rocket,
    color: '#7dd3fc',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sur mesure',
    description: 'Pour les grandes organisations',
    features: ['Utilisateurs illimités', 'Emails illimités', 'Déploiement on-premise', 'Support dédié 24/7'],
    isCurrent: false,
    Icon: Building2,
    color: '#a78bfa',
  },
]

export default function BillingClient({ initialSubscription, activePlanId, isYearly }: { initialSubscription: any, activePlanId: string | null, isYearly: boolean }) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id)
    await new Promise(r => setTimeout(r, 900))
    setDownloadingId(null)
    addToast('success', 'Téléchargement lancé', `Facture ${invoice.number} téléchargée`)
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsCancelling(false)
    setCancelOpen(false)
    addToast('info', 'Demande enregistrée', 'Votre abonnement sera résilié en fin de période')
  }

  const handleUpdatePayment = () => {
    addToast('info', 'Bientôt disponible', 'La mise à jour du moyen de paiement arrive prochainement')
  }

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(isYearly ? 'year' : 'month')
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  const handlePortal = async () => {
    setIsPortalLoading(true)
    try {
      const res = await fetch('/api/v1/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        addToast('error', 'Erreur Stripe', data.error || 'Impossible d\'ouvrir le portail')
        setIsPortalLoading(false)
      }
    } catch {
      addToast('error', 'Erreur réseau', 'Impossible de joindre le serveur')
      setIsPortalLoading(false)
    }
  }

  const handleCheckout = async (planId: string) => {
    if (planId === 'enterprise') {
      addToast('info', 'Contactez-nous', "Contactez notre équipe pour passer à Enterprise")
      return
    }

    setIsCheckoutLoading(true)
    try {
      const res = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: billingInterval, planId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        addToast('error', 'Erreur Stripe', data.error || 'Impossible d\'initier le paiement')
        setIsCheckoutLoading(false)
      }
    } catch {
      addToast('error', 'Erreur réseau', 'Impossible de joindre le serveur de facturation')
      setIsCheckoutLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[#eaf2fb]"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Facturation
        </h1>
        <p className="text-sm text-[#7a96b4] mt-1">Gérez votre abonnement et vos factures</p>
      </div>

      {/* Top row: plan */}
      <div className="max-w-3xl">
        {/* Current plan card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7dd3fc]/10 border border-[#7dd3fc]/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#7dd3fc]" />
              </div>
              <div>
                <p className="text-xs text-[#7a96b4] uppercase tracking-wider font-semibold">
                  Plan actuel
                </p>
                <p className="text-lg font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {activePlanId ? `Plan ${activePlanId.charAt(0).toUpperCase() + activePlanId.slice(1)}` : 'Plan Gratuit'}
                  <span className="text-sm font-normal text-[#7a96b4]">
                    {activePlanId ? (isYearly ? ' (Annuel)' : ' (Mensuel)') : ' (Essai 9 jours restants)'}
                  </span>
                </p>
              </div>
            </div>
            <Badge variant={activePlanId ? "success" : "high"}>{activePlanId ? "Actif" : "Libre"}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#7a96b4]">
            <Calendar size={14} className="text-[#a78bfa]" />
            <span>Facturation : <strong className="text-[#eaf2fb]">
              {initialSubscription 
                ? `Prochain cycle le ${new Date(initialSubscription.current_period_end).toLocaleDateString()}` 
                : 'Aucune facturation en cours'}
            </strong></span>
          </div>

          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7a96b4]">Emails analysés ce mois</span>
              <span className="text-[#eaf2fb] font-mono text-xs">
                {USAGE_CURRENT.toLocaleString('fr-FR')} / {USAGE_MAX.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="h-2 bg-[#1a2740] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${USAGE_PCT}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #7dd3fc, #a78bfa)',
                }}
              />
            </div>
            <p className="text-xs text-[#7a96b4]">{USAGE_PCT}% utilisé</p>
          </div>

          {activePlanId ? (
            <Button size="sm" onClick={handlePortal} isLoading={isPortalLoading} className="w-full" variant="outline">
              <TrendingUp size={15} />
              Gérer ma facturation (Stripe)
            </Button>
          ) : (
            <Button size="sm" onClick={() => document.getElementById('changer-de-plan')?.scrollIntoView({ behavior: 'smooth' })} className="w-full">
              <TrendingUp size={15} />
              Mettre à niveau (Stripe)
            </Button>
          )}
        </Card>
      </div>

      {/* Invoices */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1a2740] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#eaf2fb]">Historique des factures</h2>
          <Badge variant="default">{mockInvoices.length} factures</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2740]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Numéro
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Période
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#7a96b4] uppercase tracking-wider">
                  Télécharger
                </th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice, i) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#1a2740] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-mono text-[#7dd3fc]"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {invoice.number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#eaf2fb]">{invoice.period}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#eaf2fb]">
                      {(invoice.amount / 100).toFixed(2).replace('.', ',')}€
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'high' : 'critical'}>
                      {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Échouée'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#7a96b4]">{formatDate(invoice.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7a96b4] hover:text-[#7dd3fc] hover:bg-[#7dd3fc]/10 border border-transparent hover:border-[#7dd3fc]/20 transition-all disabled:opacity-50"
                    >
                      {downloadingId === invoice.id ? (
                        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download size={13} />
                      )}
                      PDF
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plan comparison */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="changer-de-plan">
          <h2
            className="text-base font-semibold text-[#eaf2fb]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Changer de plan
          </h2>

          <div className="flex items-center p-1 bg-[#060d18] border border-[#1a2740] rounded-xl self-start">
            <button 
              onClick={() => setBillingInterval('month')}
              className={cn("px-4 py-1.5 text-xs font-semibold rounded-lg transition-all", billingInterval === 'month' ? "bg-[#1a2740] text-[#eaf2fb]" : "text-[#7a96b4] hover:text-[#eaf2fb]")}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setBillingInterval('year')}
              className={cn("px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2", billingInterval === 'year' ? "bg-[#1a2740] text-[#eaf2fb]" : "text-[#7a96b4] hover:text-[#eaf2fb]")}
            >
              Annuel <Badge variant="success" className="text-[9px] py-0 px-1.5">-20%</Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`p-5 relative transition-all ${
                  plan.isCurrent
                    ? 'border-[#7dd3fc]/40 shadow-lg shadow-[#7dd3fc]/5'
                    : 'hover:border-[#1a2740]/80 hover:bg-[#0c1526]'
                }`}
              >
                {plan.id === activePlanId && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18]">
                      Plan actuel
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}
                  >
                    <plan.Icon size={16} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#eaf2fb]">{plan.name}</p>
                    <p className="text-xs text-[#7a96b4]">{plan.description}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-3" style={{ color: plan.color, fontFamily: 'Syne, sans-serif' }}>
                  {plan.id === 'pro' && billingInterval === 'year' ? '790€' : plan.id === 'starter' && billingInterval === 'year' ? '290€' : plan.price}
                  {plan.id !== 'enterprise' && <span className="text-sm font-normal text-[#7a96b4]">{billingInterval === 'year' ? '/an' : '/mois'}</span>}
                </p>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#7a96b4]">
                      <CheckCircle size={12} style={{ color: plan.color }} className="shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.id === activePlanId ? (
                  <Button variant="outline" size="sm" onClick={handlePortal} isLoading={isPortalLoading} className="w-full text-xs">
                    Gérer (sur Stripe)
                  </Button>
                ) : (
                  <Button
                    variant={plan.id === 'enterprise' ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleCheckout(plan.id)}
                    isLoading={isCheckoutLoading && plan.id !== 'enterprise'}
                    className="w-full text-xs"
                  >
                    {plan.id === 'enterprise' ? 'Contacter les ventes' : `Passer à ${plan.name}`}
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
