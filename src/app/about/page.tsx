'use client'
import Link from 'next/link'
import { ArrowRight, Rocket, Heart, Code2, Zap } from 'lucide-react'
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

const team = [
  {
    initials: 'ML',
    color: C.cyan,
    name: 'Matis L.',
    role: 'Co-fondateur — Fullstack & IA',
    bio: 'Passionné de code depuis le lycée. Il a conçu l\'architecture de PhishGuard.IA, intégré Gemini 2.0 et construit le moteur de détection heuristique.',
  },
  {
    initials: 'SH',
    color: C.violet,
    name: 'Sami H.',
    role: 'Co-fondateur — Produit & Design',
    bio: 'Il défend une vision simple : la cybersécurité doit être accessible et intuitive. En charge de l\'expérience utilisateur et de la direction produit.',
  },
  {
    initials: 'LM',
    color: C.blue,
    name: 'Lucas M.',
    role: 'Co-fondateur — Business & Croissance',
    bio: 'Stratégie go-to-market et premières relations commerciales. Il construit les ponts entre le produit et les entreprises qui en ont besoin.',
  },
]

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }

export default function AboutPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '120px 24px 80px', textAlign: 'center' }}>
        <motion.div {...fade} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 6, border: `1px solid ${C.line2}`, background: C.panel, marginBottom: 28 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.cyan, letterSpacing: '.08em' }}>QUI SOMMES-NOUS</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: C.bright, letterSpacing: '-.04em', marginBottom: 20, lineHeight: .95 }}>
            On a vu un problème.<br/>
            <span style={{ color: C.cyan }}>On a construit la solution.</span>
          </h1>
          <p style={{ fontSize: 17, color: C.sec, lineHeight: 1.8, maxWidth: 580, margin: '0 auto 0' }}>
            Des milliers d&apos;entreprises se font piéger par des emails de phishing chaque jour. Les outils qui existent sont soit hors de prix, soit impossibles à intégrer. On a décidé de faire autrement.
          </p>
        </motion.div>
      </section>

      {/* Notre histoire */}
      <section style={{ padding: '60px 24px', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.panel2 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <motion.div {...fade} transition={{ duration: 0.5 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.violet, letterSpacing: '.1em', textTransform: 'uppercase' }}>Notre histoire</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: C.bright, letterSpacing: '-.03em', margin: '10px 0 20px' }}>
              Comment tout a commencé
            </h2>
            <p style={{ fontSize: 15, color: C.sec, lineHeight: 1.85, marginBottom: 20 }}>
              On est Matis, Sami et Lucas. On a grandi avec le code, le design et l&apos;envie de construire des trucs utiles. Un jour, on a réalisé que des milliers d&apos;entreprises se faisaient piéger par des emails de phishing basiques — et que les outils existants étaient soit trop chers, soit impossibles à intégrer.
            </p>
            <p style={{ fontSize: 15, color: C.subtle, lineHeight: 1.85 }}>
              On a décidé de construire ce qu&apos;on aurait voulu avoir. Une API simple, un moteur IA réel, un dashboard clair. PhishGuard.IA c&apos;est notre réponse à ce problème — et on est encore au début.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Équipe */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div {...fade} style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.cyan, letterSpacing: '.1em', textTransform: 'uppercase' }}>L&apos;équipe</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: C.bright, letterSpacing: '-.03em', marginTop: 10 }}>
              On est trois. C&apos;est tout.
            </h2>
            <p style={{ fontSize: 14, color: C.subtle, marginTop: 8 }}>Pas d&apos;investisseurs. Pas d&apos;agence. Juste nous.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {team.map((m, i) => (
              <motion.div key={m.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
                style={{ padding: 28, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', filter: 'blur(40px)', background: `${m.color}15`, pointerEvents: 'none' }}/>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${m.color}15`, border: `2px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: m.color }}>{m.initials}</span>
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: C.bright, marginBottom: 4 }}>{m.name}</h3>
                <p style={{ fontSize: 11, fontWeight: 600, color: m.color, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 14 }}>{m.role}</p>
                <p style={{ fontSize: 13, color: C.subtle, lineHeight: 1.75 }}>{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs — court */}
      <section style={{ padding: '60px 24px 80px', background: C.panel2, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.h2 {...fade} style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: C.bright, letterSpacing: '-.03em', textAlign: 'center', marginBottom: 48 }}>
            Ce en quoi on croit
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: Heart,  color: C.red,    title: 'Honnêteté',   desc: 'Zéro fausse stat. Zéro faux client. On dit ce qu\'on est vraiment.' },
              { icon: Rocket, color: C.cyan,   title: 'Ambition',    desc: 'On veut construire quelque chose qui compte. On ne vise pas petit.' },
              { icon: Code2,  color: C.violet, title: 'Technique',   desc: 'La tech avant le marketing. Le produit doit parler pour lui-même.' },
              { icon: Zap,    color: C.amber,  title: 'Rapidité',    desc: 'On itère vite, on écoute, on améliore. Sans bureaucratie.' },
            ].map((v, i) => (
              <motion.div key={v.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}
                style={{ padding: 22, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${v.color}12`, border: `1px solid ${v.color}20`, marginBottom: 14 }}>
                  <v.icon size={17} style={{ color: v.color }}/>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.pri, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 12, color: C.subtle, lineHeight: 1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, color: C.bright, marginBottom: 12 }}>
            Vous voulez nous parler ?
          </h2>
          <p style={{ fontSize: 14, color: C.subtle, marginBottom: 28 }}>On répond à tous les messages. Sans exception.</p>
          <Link href="/register">
            <button className="inline-flex items-center gap-2 px-7 py-3 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl cursor-pointer hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              Créer un compte <ArrowRight size={14}/>
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
