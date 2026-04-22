'use client'
import Link from 'next/link'
import {
  Brain, BarChart2, Layers, FileText, Code2, Puzzle,
  LayoutDashboard, Bell, Link2, FlaskConical, Database, KeyRound,
  Check, Minus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const features = [
  {
    icon: Brain,
    color: '#7dd3fc',
    title: 'Détection IA Temps Réel',
    description:
      'Notre moteur IA analyse chaque email en moins de 50 ms grâce à des modèles de deep learning entraînés sur des milliards de menaces. La détection s\'améliore en continu via l\'apprentissage fédéré, sans jamais exposer vos données.',
  },
  {
    icon: BarChart2,
    color: '#a78bfa',
    title: 'Analyse Comportementale',
    description:
      'PhishGuard établit un profil comportemental pour chaque expéditeur et domaine. Les anomalies — changements soudains de style d\'écriture, d\'heure d\'envoi ou de liens inclus — déclenchent immédiatement une alerte.',
  },
  {
    icon: Layers,
    color: '#34d399',
    title: 'Protection Multi-Canaux',
    description:
      'Au-delà de l\'email, notre plateforme sécurise Slack, Teams, SharePoint et les formulaires web. Une seule console unifiée pour surveiller l\'ensemble de vos vecteurs d\'attaque.',
  },
  {
    icon: FileText,
    color: '#fbbf24',
    title: 'Rapports & Analytics',
    description:
      'Générez des rapports exécutifs PDF en un clic avec graphiques, tendances mensuelles et recommandations prioritaires. Les tableaux de bord temps réel donnent à votre équipe SOC une visibilité instantanée.',
  },
  {
    icon: Code2,
    color: '#7dd3fc',
    title: 'API REST Complète',
    description:
      'Une API RESTful documentée avec OpenAPI 3.0, SDK disponibles en Python, Node.js et Go. Intégrez la détection PhishGuard directement dans votre pipeline CI/CD ou votre propre SOAR.',
  },
  {
    icon: Puzzle,
    color: '#a78bfa',
    title: 'Intégrations Natives',
    description:
      'Connecteurs prêts à l\'emploi pour Microsoft 365, Google Workspace, Okta, Splunk et PagerDuty. L\'installation se fait en moins de 10 minutes sans modifier votre infrastructure existante.',
  },
  {
    icon: LayoutDashboard,
    color: '#34d399',
    title: 'Dashboard Unifié',
    description:
      'Vue 360° de votre posture de sécurité email : score de risque global, carte des menaces géolocalisées, top des campagnes actives et suivi des indicateurs clés en temps réel.',
  },
  {
    icon: Bell,
    color: '#fb7185',
    title: 'Alertes Intelligentes',
    description:
      'Système d\'alertes contextuel qui réduit les faux positifs de 90% grâce à la corrélation multi-signaux. Les notifications sont enrichies avec des playbooks de remédiation prêts à exécuter.',
  },
  {
    icon: Link2,
    color: '#fbbf24',
    title: 'Protection URL',
    description:
      'Chaque lien contenu dans les emails est analysé à la volée : réputation de domaine, certificat SSL, contenu de la page et redirections suspectes. Les URL malveillantes sont neutralisées avant le clic.',
  },
  {
    icon: FlaskConical,
    color: '#7dd3fc',
    title: 'Sandbox Email',
    description:
      'Les pièces jointes suspectes sont exécutées dans un environnement isolé pour observer leur comportement réel. Le rapport de détonation inclut captures d\'écran, flux réseau et indicateurs de compromission.',
  },
  {
    icon: Database,
    color: '#a78bfa',
    title: 'SIEM Integration',
    description:
      'Export natif au format CEF/LEEF vers Splunk, QRadar, Microsoft Sentinel et Elastic. Les événements PhishGuard enrichissent votre corrélation SIEM sans configuration manuelle.',
  },
  {
    icon: KeyRound,
    color: '#34d399',
    title: 'SSO/SAML',
    description:
      'Authentification unique via SAML 2.0 et OIDC, compatible avec tous les fournisseurs d\'identité majeurs. Le provisionnement SCIM automatise la gestion des accès à grande échelle.',
  },
]

const competitors = [
  {
    name: 'PhishGuard.IA',
    isUs: true,
    aiScore: '98%',
    price: 'Depuis 29€/mois',
    easeOfUse: '9.4/10',
    responseTime: '< 50 ms',
  },
  {
    name: 'Proofpoint',
    isUs: false,
    aiScore: '84%',
    price: 'Depuis 450€/mois',
    easeOfUse: '6.8/10',
    responseTime: '~800 ms',
  },
  {
    name: 'Mimecast',
    isUs: false,
    aiScore: '79%',
    price: 'Depuis 380€/mois',
    easeOfUse: '6.2/10',
    responseTime: '~1 200 ms',
  },
  {
    name: 'Barracuda',
    isUs: false,
    aiScore: '76%',
    price: 'Depuis 290€/mois',
    easeOfUse: '7.1/10',
    responseTime: '~950 ms',
  },
]

const comparisonFields = [
  { label: 'Score IA', key: 'aiScore' as const },
  { label: 'Tarif d\'entrée', key: 'price' as const },
  { label: 'Facilité d\'utilisation', key: 'easeOfUse' as const },
  { label: 'Temps de réponse', key: 'responseTime' as const },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa] text-xs font-medium mb-6">
              Fonctionnalités
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#eaf2fb] mb-6 max-w-3xl mx-auto leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Des fonctionnalités de pointe pour une protection maximale
            </h1>
            <p className="text-[#7a96b4] text-lg max-w-2xl mx-auto">
              PhishGuard.IA combine intelligence artificielle de dernière génération et expérience
              utilisateur soignée pour offrir la meilleure défense contre le phishing.
            </p>
          </motion.div>
        </section>

        {/* Feature cards */}
        <section className="pb-24 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-[#1a2740] bg-[#0c1526] p-6 hover:border-[#1a2740]/80 hover:bg-[#0c1526]/90 transition-all group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${feat.color}15`, border: `1px solid ${feat.color}30` }}
                  >
                    <Icon size={20} style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-[#eaf2fb] mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#7a96b4] leading-relaxed">{feat.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Comparison vs competitors */}
        <section className="py-24 px-4 border-t border-[#1a2740]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                Pourquoi choisir PhishGuard.IA ?
              </h2>
              <p className="text-[#7a96b4] max-w-xl mx-auto">
                Comparez nos performances face aux solutions historiques du marché.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-[#1a2740] overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2740]">
                    <th className="text-left px-6 py-5 text-sm font-semibold text-[#7a96b4] w-1/4">Critère</th>
                    {competitors.map(c => (
                      <th
                        key={c.name}
                        className={`px-6 py-5 text-sm font-semibold text-center ${c.isUs ? 'text-[#7dd3fc]' : 'text-[#eaf2fb]'}`}
                      >
                        {c.isUs ? (
                          <span className="inline-flex flex-col items-center gap-1">
                            {c.name}
                            <span className="bg-[#34d399]/20 text-[#34d399] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#34d399]/30">
                              Meilleur choix
                            </span>
                          </span>
                        ) : c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFields.map((field, i) => (
                    <tr key={field.key} className={`border-b border-[#1a2740] ${i % 2 === 0 ? 'bg-[#0c1526]/30' : ''}`}>
                      <td className="px-6 py-4 text-sm text-[#7a96b4] font-medium">{field.label}</td>
                      {competitors.map(c => (
                        <td
                          key={c.name}
                          className={`px-6 py-4 text-sm text-center font-medium ${c.isUs ? 'text-[#7dd3fc]' : 'text-[#eaf2fb]'}`}
                        >
                          {c[field.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 grid md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Score IA', value: '+14 pts', desc: 'vs. Proofpoint' },
                { label: 'Prix d\'entrée', value: '15× moins cher', desc: 'vs. Proofpoint' },
                { label: 'Facilité', value: '+2.6 pts', desc: 'vs. Mimecast' },
                { label: 'Latence', value: '16× plus rapide', desc: 'vs. Mimecast' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-[#1a2740] bg-[#0c1526] p-4 text-center">
                  <div className="text-xl font-bold text-[#34d399] mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#eaf2fb] font-medium">{stat.label}</div>
                  <div className="text-xs text-[#7a96b4]">{stat.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div
              className="rounded-3xl border border-[#1a2740] bg-[#0c1526] p-12"
              style={{ boxShadow: '0 0 80px rgba(125, 211, 252, 0.05)' }}
            >
              <h2 className="text-3xl font-bold text-[#eaf2fb] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                Prêt à voir PhishGuard en action ?
              </h2>
              <p className="text-[#7a96b4] mb-8 leading-relaxed">
                Démarrez votre essai gratuit de 14 jours. Sans carte bancaire, sans engagement.
                Configurez votre première protection en moins de 10 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <button className="px-8 py-3.5 bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#7dd3fc]/20">
                    Démarrer gratuitement →
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="px-8 py-3.5 border border-[#1a2740] text-[#eaf2fb] font-semibold rounded-xl hover:border-[#7dd3fc]/40 hover:bg-[#7dd3fc]/5 transition-all">
                    Demander une démo
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
