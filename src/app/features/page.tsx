'use client'
import Link from 'next/link'
import { Brain, Code2, BarChart2, Bell, Shield, Zap, ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const C = {
  bg: '#0d1117', panel: '#161c26', panel2: '#10161e',
  line: '#1e2a3a', line2: '#253347',
  muted: '#374f67', subtle: '#4d6580', sec: '#7a96b0', pri: '#c8d8e8', bright: '#eaf2ff',
  cyan: '#41e8c4', violet: '#a78bfa', blue: '#5e9ef7',
  green: '#32d583', red: '#ff5f6d', amber: '#f5a623',
}

// Ce qu'on a vraiment construit
const features = [
  {
    icon: Brain,
    color: C.cyan,
    title: 'Moteur de détection IA',
    what: 'Ce qu\'on a construit',
    desc: 'Analyse heuristique multicritère (domaine, URLs, contenu, expéditeur) combinée à Gemini 2.0 Flash. Le résultat : un score de 0 à 100 et une liste de signaux détectés, lisibles par un humain.',
    bullets: ['Score de risque structuré', 'Signaux explicables', 'Gemini 2.0 Flash intégré', 'Analyse < 2 secondes'],
  },
  {
    icon: Code2,
    color: C.violet,
    title: 'API REST',
    what: 'Ce qu\'on a construit',
    desc: 'Un endpoint clair : POST /api/v1/analyze. Vous envoyez les métadonnées de l\'email, on retourne le score. Compatible avec tout ce qui peut faire une requête HTTP.',
    bullets: ['Réponse JSON structurée', 'Auth Bearer token', 'Documentation complète', 'Compatible tous langages'],
  },
  {
    icon: BarChart2,
    color: C.amber,
    title: 'Dashboard & Rapports',
    what: 'Ce qu\'on a construit',
    desc: 'Un dashboard temps réel connecté à Supabase. Emails analysés, menaces détectées, score moyen, export CSV. Mise à jour automatique sans rafraîchir la page.',
    bullets: ['Stats temps réel', 'Historique des emails', 'Export CSV', 'Breakdown par type de menace'],
  },
  {
    icon: Bell,
    color: C.red,
    title: 'Alertes',
    what: 'Ce qu\'on a construit',
    desc: 'Centre d\'alertes pour les menaces détectées. Chaque alerte affiche le score IA, la sévérité, le type de menace et l\'expéditeur.',
    bullets: ['Classement par sévérité', 'Score IA visible', 'Flux en temps réel', 'Filtres et recherche'],
  },
  {
    icon: Shield,
    color: C.green,
    title: 'Gateways supportés',
    what: 'Documentation disponible',
    desc: 'Guides d\'intégration écrits pour les principaux gateways email. L\'API fonctionne avec n\'importe quel système capable de faire une requête HTTP.',
    bullets: ['Postfix', 'Microsoft 365', 'Google Workspace', 'Exchange + n8n'],
  },
  {
    icon: Zap,
    color: C.blue,
    title: 'Authentification & Facturation',
    what: 'Ce qu\'on a construit',
    desc: 'Login email/mot de passe et Google OAuth. Facturation via Stripe avec 3 plans. Gestion des abonnements directement depuis le dashboard.',
    bullets: ['Google OAuth', 'Reset mot de passe', 'Stripe intégré', '3 plans tarifaires'],
  },
]

const notBuiltYet = [
  'Sandbox pièces jointes',
  'Intégration SIEM native',
  'SSO / SAML',
  'SDK Python / Go (docs uniquement)',
  'Application mobile',
  'Analyse Slack / Teams',
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function FeaturesPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '120px 24px 70px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 6, border: `1px solid ${C.line2}`, background: C.panel, marginBottom: 28 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.violet, letterSpacing: '.08em' }}>CE QU&apos;ON A VRAIMENT CONSTRUIT</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 900, color: C.bright, letterSpacing: '-.04em', marginBottom: 18, lineHeight: .95 }}>
            Fonctionnalités<br/>
            <span style={{ color: C.violet }}>sans bullshit.</span>
          </h1>
          <p style={{ fontSize: 16, color: C.sec, lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            On liste exactement ce qu&apos;on a construit. Pas de feature roadmap vendue comme existante. Ce qui est là, c&apos;est là. Ce qui manque, on le dit aussi.
          </p>
        </motion.div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '20px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {features.map((feat, i) => (
            <motion.div key={feat.title} {...fade(i * .07)}
              style={{ padding: 28, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Icon + what */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${feat.color}12`, border: `1px solid ${feat.color}20` }}>
                  <feat.icon size={20} style={{ color: feat.color }}/>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '.06em', padding: '3px 8px', borderRadius: 4, background: `${C.green}10`, border: `1px solid ${C.green}20` }}>
                  {feat.what}
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.bright, marginBottom: 10, fontFamily: 'Syne, sans-serif' }}>{feat.title}</h3>
              <p style={{ fontSize: 13, color: C.subtle, lineHeight: 1.75, marginBottom: 18, flex: 1 }}>{feat.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
                {feat.bullets.map(b => (
                  <span key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.sec }}>
                    <Check size={12} style={{ color: feat.color, flexShrink: 0 }}/>{b}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ce qu'on n'a PAS encore */}
      <section style={{ padding: '60px 24px 80px', background: C.panel2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div {...fade()} style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: C.bright, letterSpacing: '-.03em', marginBottom: 12 }}>
              Ce qu&apos;on n&apos;a <span style={{ color: C.amber }}>pas encore</span>
            </h2>
            <p style={{ fontSize: 14, color: C.subtle, lineHeight: 1.8 }}>
              On préfère être honnêtes plutôt que de mentir sur nos capacités. Ces features sont sur la roadmap, pas en production.
            </p>
          </motion.div>
          <motion.div {...fade(.1)}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {notBuiltYet.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.muted, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: C.subtle }}>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: C.bright, letterSpacing: '-.03em', marginBottom: 12 }}>
            Ça vous convient ?
          </h2>
          <p style={{ fontSize: 14, color: C.subtle, marginBottom: 28 }}>Créez un compte, testez l&apos;API, dites-nous ce qu&apos;il manque.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link href="/register">
              <button className="inline-flex items-center gap-2 px-7 py-3 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl cursor-pointer hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                Essayer gratuitement <ArrowRight size={14}/>
              </button>
            </Link>
            <Link href="/dashboard/api">
              <button style={{ padding: '12px 28px', background: 'transparent', color: C.pri, fontWeight: 500, fontSize: 14, borderRadius: 10, border: `1px solid ${C.line2}`, cursor: 'pointer' }}>
                Voir la doc API
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
