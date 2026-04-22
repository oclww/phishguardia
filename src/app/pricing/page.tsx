'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, Minus, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const plans = [
  {
    id: 'starter', name: 'Starter', monthlyPrice: 29, annualPrice: 23,
    description: 'Parfait pour les petites équipes qui démarrent.',
    color: '#7a96b4',
    features: ['5 utilisateurs', '10 000 emails/mois', 'Détection IA basique', 'Alertes email', 'Dashboard basique', 'Support email', 'API accès limité'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    id: 'pro', name: 'Pro', monthlyPrice: 79, annualPrice: 63,
    description: 'Pour les équipes en croissance qui ont besoin de plus.',
    color: '#7dd3fc',
    features: ['25 utilisateurs', '100 000 emails/mois', 'Détection IA avancée', 'Alertes temps réel', 'Dashboard complet', 'Rapports PDF', 'API complète', 'Slack & Teams', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    id: 'enterprise', name: 'Enterprise', monthlyPrice: 0, annualPrice: 0,
    description: 'Solution sur-mesure pour les grandes organisations.',
    color: '#a78bfa',
    features: ['Utilisateurs illimités', 'Emails illimités', 'IA personnalisée', 'SLA 99.9%', 'On-premise option', 'SSO/SAML', 'Audit logs', 'Support dédié 24/7', 'Formation équipe'],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
]

const comparisonFeatures = [
  { name: 'Utilisateurs', starter: '5', pro: '25', enterprise: 'Illimité' },
  { name: 'Emails analysés/mois', starter: '10 000', pro: '100 000', enterprise: 'Illimité' },
  { name: 'Détection IA', starter: 'Basique', pro: 'Avancée', enterprise: 'Personnalisée' },
  { name: 'Alertes temps réel', starter: false, pro: true, enterprise: true },
  { name: 'Dashboard analytique', starter: false, pro: true, enterprise: true },
  { name: 'Rapports PDF', starter: false, pro: true, enterprise: true },
  { name: 'Accès API', starter: 'Limité', pro: 'Complet', enterprise: 'Complet' },
  { name: 'Intégrations Slack/Teams', starter: false, pro: true, enterprise: true },
  { name: 'SSO/SAML', starter: false, pro: false, enterprise: true },
  { name: 'On-premise', starter: false, pro: false, enterprise: true },
  { name: 'SLA', starter: '99%', pro: '99.5%', enterprise: '99.9%' },
  { name: 'Support', starter: 'Email', pro: 'Prioritaire', enterprise: 'Dédié 24/7' },
]

const faqs = [
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et la facturation est proratisée.' },
  { q: 'Y a-t-il un engagement minimum ?', a: 'Non, nos plans sont sans engagement. Vous pouvez annuler à tout moment. Les plans annuels sont facturés en une fois et ne sont pas remboursables.' },
  { q: "Que se passe-t-il si je dépasse mon quota d'emails ?", a: "Vous recevrez une alerte à 80% et 95% de votre quota. Au-delà, les emails supplémentaires sont analysés à 0.001€/email ou vous pouvez upgrader votre plan." },
  { q: "L'essai gratuit nécessite-t-il une carte bancaire ?", a: "Non, l'essai gratuit de 14 jours ne nécessite aucune carte bancaire. Vous saisissez vos informations de paiement uniquement si vous décidez de continuer." },
  { q: 'Proposez-vous des remises pour les startups ou ONG ?', a: 'Oui, nous proposons des remises de 50% pour les startups de moins de 2 ans et les organisations à but non lucratif. Contactez notre équipe commerciale.' },
  { q: 'Comment fonctionne la facturation annuelle ?', a: "La facturation annuelle vous permet d'économiser 20% par rapport au mensuel. Vous êtes facturé en une seule fois pour 12 mois dès la souscription." },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 text-[#7dd3fc] text-xs font-medium mb-6">
              Tarifs simples et transparents
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Choisissez votre plan
            </h1>
            <p className="text-[#7a96b4] text-lg max-w-xl mx-auto mb-10">
              Commencez gratuitement, évoluez selon vos besoins. Pas de frais cachés.
            </p>
            {/* Toggle */}
            <div className="inline-flex items-center gap-4 bg-[#0c1526] border border-[#1a2740] rounded-2xl p-2">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${!annual ? 'bg-[#7dd3fc]/20 text-[#7dd3fc]' : 'text-[#7a96b4]'}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-[#7dd3fc]/20 text-[#7dd3fc]' : 'text-[#7a96b4]'}`}
              >
                Annuel
                <span className="bg-[#34d399]/20 text-[#34d399] text-xs px-2 py-0.5 rounded-full border border-[#34d399]/30">-20%</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Plans */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${plan.highlighted ? 'border-[#7dd3fc]/40 bg-[#0c1526] shadow-2xl shadow-[#7dd3fc]/10' : 'border-[#1a2740] bg-[#0c1526]/80'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] text-xs font-bold px-4 py-1.5 rounded-full">
                      Le plus populaire
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: plan.color }}>{plan.name}</h3>
                  <p className="text-sm text-[#7a96b4] mb-6">{plan.description}</p>
                  <div className="mb-8">
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-4xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Sur devis</span>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {annual ? plan.annualPrice : plan.monthlyPrice}€
                        </span>
                        <span className="text-[#7a96b4] mb-1">/mois</span>
                      </div>
                    )}
                    {annual && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-[#34d399] mt-1">Facturé {(plan.annualPrice * 12).toFixed(0)}€/an</p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#7a96b4]">
                        <Check size={15} className="text-[#34d399] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={plan.id === 'enterprise' ? '/contact' : '/register'} className="mt-auto">
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlighted
                      ? 'bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] hover:opacity-90 shadow-lg shadow-[#7dd3fc]/20'
                      : 'border border-[#1a2740] text-[#eaf2fb] hover:border-[#7dd3fc]/40 hover:bg-[#7dd3fc]/5'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-20 px-4 border-t border-[#1a2740]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#eaf2fb] text-center mb-12" style={{ fontFamily: 'Syne, sans-serif' }}>
              Comparaison détaillée
            </h2>
            <div className="rounded-2xl border border-[#1a2740] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2740]">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#7a96b4]">Fonctionnalité</th>
                    {['Starter', 'Pro', 'Enterprise'].map(p => (
                      <th key={p} className="px-6 py-4 text-sm font-semibold text-[#eaf2fb] text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, i) => (
                    <tr key={f.name} className={`border-b border-[#1a2740] ${i % 2 === 0 ? 'bg-[#0c1526]/30' : ''}`}>
                      <td className="px-6 py-3.5 text-sm text-[#7a96b4]">{f.name}</td>
                      {(['starter', 'pro', 'enterprise'] as const).map(plan => (
                        <td key={plan} className="px-6 py-3.5 text-center">
                          {typeof f[plan] === 'boolean' ? (
                            f[plan]
                              ? <Check size={16} className="text-[#34d399] mx-auto" />
                              : <Minus size={16} className="text-[#1a2740] mx-auto" />
                          ) : (
                            <span className="text-sm text-[#eaf2fb]">{f[plan]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#eaf2fb] text-center mb-12" style={{ fontFamily: 'Syne, sans-serif' }}>
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-[#1a2740] bg-[#0c1526]/80 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-[#eaf2fb]">{faq.q}</span>
                    <ChevronDown size={16} className={`text-[#7a96b4] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-[#7a96b4] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Prêt à sécuriser vos emails ?
            </h2>
            <p className="text-[#7a96b4] mb-8">14 jours d&apos;essai gratuit. Sans carte bancaire.</p>
            <Link href="/register">
              <button className="px-8 py-3.5 bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#7dd3fc]/20">
                Démarrer l&apos;essai gratuit →
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
