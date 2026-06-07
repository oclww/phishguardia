"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Shield, Zap, Brain, BarChart2, Code, ChevronDown, Check, ArrowRight, Key, Terminal, Lock, Rocket, Heart, Lightbulb, Users } from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

const C = {
  bg: '#0d1117', panel: '#161c26', panel2: '#10161e',
  line: '#1e2a3a', line2: '#253347',
  muted: '#374f67', subtle: '#4d6580', sec: '#7a96b0', pri: '#c8d8e8', bright: '#eaf2ff',
  cyan: '#41e8c4', violet: '#a78bfa', blue: '#5e9ef7',
  green: '#32d583', red: '#ff5f6d', amber: '#f5a623',
}

const team = [
  {
    name: 'Matis L.',
    role: 'Co-fondateur · Fullstack & IA',
    initials: 'ML',
    color: C.cyan,
    bio: 'Passionné de code depuis le lycée. Derrière l\'architecture de PhishGuard.IA, l\'intégration Gemini et le moteur de détection heuristique.',
  },
  {
    name: 'Sami H.',
    role: 'Co-fondateur · Produit & Design',
    initials: 'SH',
    color: C.violet,
    bio: 'Vision produit et expérience utilisateur. Convaincu que la cybersécurité peut être simple, belle et accessible à toutes les entreprises.',
  },
  {
    name: 'Lucas M.',
    role: 'Co-fondateur · Business & Croissance',
    initials: 'LM',
    color: C.blue,
    bio: 'Stratégie go-to-market et développement commercial. En charge de la relation avec les premières entreprises partenaires.',
  },
]

const values = [
  { icon: Rocket,     color: C.cyan,   title: 'Ambition sans filtre',   desc: 'On est trois jeunes qui veulent prouver qu\'on peut construire un produit de cybersécurité sérieux, sans compromis, depuis notre chambre.' },
  { icon: Heart,      color: C.red,    title: 'Honnêteté totale',       desc: 'Pas de fausses stats, pas de faux clients. Ce que vous voyez est ce qu\'on a vraiment construit. Le produit parle pour lui-même.' },
  { icon: Lightbulb,  color: C.amber,  title: 'Technologie avant tout', desc: 'L\'IA au cœur, pas en décoration. Notre moteur de détection combine analyse heuristique et Gemini 2.0 Flash pour de vrais résultats.' },
  { icon: Users,      color: C.violet, title: 'Pour les entreprises',   desc: 'On construit pour les DSI et RSSI qui gèrent des milliers d\'emails par jour et qui n\'ont pas le temps de se faire avoir.' },
]

const steps = [
  { icon: Key,      n: '01', title: 'Générez une clé API',             desc: 'Créez votre compte, récupérez votre clé API depuis le dashboard. Moins de 2 minutes.', c: C.cyan   },
  { icon: Terminal, n: '02', title: 'Intégrez en 5 lignes de code',    desc: 'Appelez /api/v1/analyze depuis votre gateway. Compatible Postfix, M365, Google Workspace.', c: C.violet },
  { icon: Lock,     n: '03', title: 'Menaces détectées automatiquement', desc: 'Chaque email reçoit un score de risque et une liste de signaux. Vous choisissez l\'action.', c: C.green  },
]

const faqs = [
  { q: 'Comment fonctionne la détection ?',    a: 'Analyse heuristique multicritère (domaine, URLs, contenu, expéditeur) combinée à Gemini 2.0 Flash. Le résultat est un score de 0 à 100 et une liste de signaux détectés.' },
  { q: 'C\'est quoi le statut du projet ?',    a: 'PhishGuard.IA est en phase beta ouverte. On cherche les premières entreprises partenaires qui veulent co-construire le produit avec nous. Les premiers accès sont gratuits.' },
  { q: 'Vous stockez mes emails ?',            a: 'Non. Seules les métadonnées sont analysées (expéditeur, sujet, URLs). Le corps de l\'email n\'est jamais conservé sur nos serveurs.' },
  { q: 'C\'est compatible avec quel système ?', a: 'Tout ce qui peut faire un appel HTTP. On a des guides pour Postfix, Exchange, Microsoft 365 et Google Workspace dans le Developer Hub.' },
  { q: 'Comment vous contacter ?',             a: 'Créez un compte et contactez-nous depuis le dashboard. On répond en général en moins de 24h.' },
]

const plans = [
  {
    name: 'Starter',
    price: '49',
    period: '/mois',
    highlight: false,
    badge: null,
    quota: '10 000 emails/mois',
    features: ['API REST complète', 'Score de risque IA', 'Dashboard', 'Support email', 'Historique 30 jours', '1 gateway supporté'],
    cta: 'Commencer',
    href: '/register?plan=starter',
  },
  {
    name: 'Pro',
    price: '149',
    period: '/mois',
    highlight: true,
    badge: 'Recommandé',
    quota: '100 000 emails/mois',
    features: ['Tout Starter inclus', 'Webhooks temps réel', 'Rapports automatiques', 'Support prioritaire', 'Historique 1 an', '6 gateways', 'Accès beta features'],
    cta: 'Démarrer l\'essai',
    href: '/register?plan=pro',
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    highlight: false,
    badge: null,
    quota: 'Volume personnalisé',
    features: ['Tout Pro inclus', 'Déploiement dédié', 'Onboarding technique', 'Contrat sur mesure', 'SLA négociable'],
    cta: 'Nous contacter',
    href: '/contact?plan=enterprise',
  },
]

const curlSnippet = `curl -X POST https://phishguardia.vercel.app/api/v1/analyze \\
  -H "Authorization: Bearer pg_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "security@micros0ft-alert.com",
    "subject": "Action immédiate requise",
    "body": "Votre compte sera suspendu dans 24h..."
  }'`

const curlResponse = `{
  "success": true,
  "ai_score": 91,
  "status": "blocked",
  "severity": "critical",
  "threat_type": "spear-phishing",
  "explanation": "Domaine imitant Microsoft avec typosquat. Lien vers page de collecte d'identifiants.",
  "findings": [
    "Microsoft typosquat",
    "Urgency trigger words",
    "Credential harvesting path"
  ]
}`

export default function LandingPage() {
  const [faq, setFaq] = useState<number | null>(null)
  const [risk, setRisk] = useState(0)
  const [showResponse, setShowResponse] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRisk(87), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowResponse(true), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <Header/>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>

          <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7 }}>
            {/* Badge équipe */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:6, border:`1px solid ${C.line2}`, background:C.panel, marginBottom:32 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:C.green, display:'inline-block', animation:'pulse 2s infinite', boxShadow:`0 0 8px ${C.green}` }}/>
              <span style={{ fontSize:11, fontWeight:500, color:C.subtle, letterSpacing:'.08em' }}>BETA OUVERTE · FAIT EN FRANCE · PAR 3 ÉTUDIANTS</span>
            </div>

            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(40px, 5.5vw, 72px)', fontWeight:900, lineHeight:.95, letterSpacing:'-.04em', color:C.bright, marginBottom:28 }}>
              L&apos;IA qui détecte<br/>
              le phishing<br/>
              <span style={{ color:C.violet }}>avant vos équipes.</span>
            </h1>

            <p style={{ fontSize:16, color:C.sec, lineHeight:1.7, maxWidth:460, marginBottom:40 }}>
              PhishGuard.IA scanne vos emails en temps réel avec un moteur heuristique + Gemini 2.0. Une API, 5 lignes de code, et votre gateway devient intelligent.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:40 }}>
              <Link href="/register">
                <button className="flex items-center gap-2 px-7 py-3.5 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300">
                  Essayer gratuitement <ArrowRight size={15}/>
                </button>
              </Link>
              <Link href="/dashboard/api">
                <button style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 28px', background:'transparent', color:C.pri, fontWeight:500, fontSize:14, borderRadius:10, border:`1px solid ${C.line2}`, cursor:'pointer' }}>
                  Voir la doc API
                </button>
              </Link>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:20 }}>
              {['API-first', 'Open à la critique', 'Hébergé EU', 'Accès beta gratuit'].map(s => (
                <span key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.subtle }}>
                  <Check size={13} style={{ color:C.cyan }}/>{s}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Demo card */}
          <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7, delay:.15 }}>
            <div style={{ background:C.panel, border:`1px solid ${C.line2}`, borderRadius:16, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,.5)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div style={{ display:'flex', gap:6 }}>
                  {[C.red, C.amber, C.green].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }}/>)}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:6, background:`rgba(50,213,131,.1)`, border:`1px solid rgba(50,213,131,.2)` }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block', animation:'pulse 2s infinite' }}/>
                  <span style={{ fontSize:11, fontWeight:500, color:C.green }}>Analyse en direct</span>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
                {[{v:'< 2s',l:'ANALYSE'},{v:'2026',l:'LANCÉ EN'},{v:'Gemini',l:'MOTEUR IA'}].map(s => (
                  <div key={s.l} style={{ background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:'12px 10px', textAlign:'center' }}>
                    <p style={{ fontSize:18, fontWeight:700, color:C.cyan, fontFamily:'Syne, sans-serif' }}>{s.v}</p>
                    <p style={{ fontSize:9, color:C.muted, letterSpacing:'.08em', marginTop:2 }}>{s.l}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:C.panel2, border:`1px solid ${C.line2}`, borderRadius:10, padding:16, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:C.pri }}>Service Sécurité Microsoft</p>
                    <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>security@micros0ft-alert.com</p>
                  </div>
                  <span style={{ padding:'4px 10px', background:`rgba(245,166,35,.12)`, border:`1px solid rgba(245,166,35,.25)`, borderRadius:6, fontSize:11, fontWeight:600, color:C.amber, whiteSpace:'nowrap' }}>
                    Score {risk}/100
                  </span>
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:C.pri, marginBottom:6 }}>Action immédiate requise pour votre compte</p>
                <p style={{ fontSize:12, color:C.subtle, lineHeight:1.6, marginBottom:12 }}>Domaine usurpé, urgence artificielle, lien masqué et incohérence expéditeur détectés.</p>

                <div style={{ height:4, background:C.line, borderRadius:4, overflow:'hidden', marginBottom:14 }}>
                  <motion.div animate={{ width:`${risk}%` }} transition={{ duration:1.2, ease:'easeOut' }}
                    style={{ height:'100%', background:`linear-gradient(90deg, ${C.amber}, ${C.red})`, borderRadius:4 }}/>
                </div>

                {[{l:"Usurpation d'identité",s:'Critique',c:C.red},{l:'Lien à redirection',s:'Élevé',c:C.amber},{l:'Ton pressant inhabituel',s:'Moyen',c:C.blue}].map(ind => (
                  <div key={ind.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.line}`, fontSize:12 }}>
                    <span style={{ color:C.sec }}>{ind.l}</span>
                    <span style={{ color:ind.c, fontWeight:600 }}>{ind.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Notre histoire ── */}
      <section style={{ padding:'80px 24px', background:C.panel2, borderTop:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.violet, letterSpacing:'.1em', textTransform:'uppercase' }}>Notre histoire</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(26px,4vw,44px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:12, marginBottom:20 }}>
              Trois étudiants qui ont décidé<br/>
              <span style={{ color:C.cyan }}>de faire quelque chose d&apos;utile.</span>
            </h2>
            <p style={{ fontSize:16, color:C.sec, lineHeight:1.8, maxWidth:680, margin:'0 auto' }}>
              PhishGuard.IA est né d&apos;un constat simple : les attaques de phishing coûtent des millions aux entreprises chaque année, mais les outils disponibles sont soit trop chers, soit trop complexes à intégrer. On a décidé de construire ce qu&apos;on aurait voulu avoir.
            </p>
            <p style={{ fontSize:15, color:C.subtle, lineHeight:1.8, maxWidth:600, margin:'24px auto 0' }}>
              On est Matis, Sami et Lucas — trois jeunes qui codent, pitchent et itèrent sans relâche. Ce projet c&apos;est notre conviction que la tech peut changer la façon dont les entreprises se protègent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Équipe ── */}
      <section style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:'.1em', textTransform:'uppercase' }}>L&apos;équipe</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8, marginBottom:12 }}>
              Les créateurs
            </h2>
            <p style={{ fontSize:15, color:C.subtle }}>Pas d&apos;investisseurs, pas d&apos;agence. Juste nous trois.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:20 }}>
            {team.map((member, i) => (
              <motion.div key={member.name}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
                style={{ padding:28, background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, position:'relative', overflow:'hidden' }}>
                {/* Glow */}
                <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', filter:'blur(40px)', background:`${member.color}15`, pointerEvents:'none' }}/>
                {/* Avatar */}
                <div style={{ width:54, height:54, borderRadius:14, background:`${member.color}15`, border:`2px solid ${member.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <span style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:800, color:member.color }}>{member.initials}</span>
                </div>
                <h3 style={{ fontSize:18, fontWeight:700, color:C.bright, marginBottom:4, fontFamily:'Syne, sans-serif' }}>{member.name}</h3>
                <p style={{ fontSize:11, fontWeight:600, color:member.color, letterSpacing:'.06em', marginBottom:16, textTransform:'uppercase' }}>{member.role}</p>
                <p style={{ fontSize:13, color:C.subtle, lineHeight:1.75 }}>{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ── */}
      <section style={{ padding:'80px 24px', background:C.panel2, borderTop:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.amber, letterSpacing:'.1em', textTransform:'uppercase' }}>Ce en quoi on croit</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8 }}>
              Nos valeurs
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:16 }}>
            {values.map((v, i) => (
              <motion.div key={v.title}
                initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.08 }}
                style={{ padding:24, background:C.panel, border:`1px solid ${C.line}`, borderRadius:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:`${v.color}12`, border:`1px solid ${v.color}20`, marginBottom:16 }}>
                  <v.icon size={18} style={{ color:v.color }}/>
                </div>
                <h3 style={{ fontSize:14, fontWeight:700, color:C.pri, marginBottom:8 }}>{v.title}</h3>
                <p style={{ fontSize:12, color:C.subtle, lineHeight:1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:'.1em', textTransform:'uppercase' }}>Intégration</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8, marginBottom:12 }}>
              Comment ça marche
            </h2>
            <p style={{ fontSize:15, color:C.subtle, maxWidth:480, margin:'0 auto' }}>De zéro à une protection active de vos emails en moins de 10 minutes.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:24 }}>
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
                style={{ position:'relative', padding:28, background:C.panel, border:`1px solid ${C.line}`, borderRadius:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:s.c, letterSpacing:'.12em', marginBottom:16 }}>{s.n}</div>
                <div style={{ width:42, height:42, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:`${s.c}12`, border:`1px solid ${s.c}20`, marginBottom:16 }}>
                  <s.icon size={19} style={{ color:s.c }}/>
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.pri, marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:C.subtle, lineHeight:1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code snippet ── */}
      <section style={{ padding:'80px 24px', background:C.panel2, borderTop:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:64, alignItems:'center' }}>
          <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:.6 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:'.1em', textTransform:'uppercase' }}>API-first</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(26px,3.5vw,42px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8, marginBottom:16 }}>
              5 lignes de code.<br/>
              <span style={{ color:C.violet }}>Ça marche vraiment.</span>
            </h2>
            <p style={{ fontSize:15, color:C.subtle, lineHeight:1.75, marginBottom:32 }}>
              Un endpoint REST. Vous envoyez les métadonnées de l&apos;email, on vous retourne un score de risque et une liste de signaux. Pas de magic, juste de la technique.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {['Réponse JSON structurée', 'Score de 0 à 100', 'Liste de signaux expliqués', 'Compatible tout langage'].map(f => (
                <span key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.sec }}>
                  <Check size={14} style={{ color:C.cyan, flexShrink:0 }}/>{f}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:.6, delay:.1 }}>
            <div style={{ background:'#090d13', border:`1px solid ${C.line2}`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.5)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 16px', borderBottom:`1px solid ${C.line}`, background:C.panel }}>
                {[C.red, C.amber, C.green].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }}/>)}
                <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>phishguard-api — curl</span>
              </div>
              <div style={{ padding:'20px 20px 0' }}>
                <pre style={{ margin:0, fontSize:11.5, lineHeight:1.7, color:C.sec, fontFamily:'ui-monospace, "Cascadia Code", monospace', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
                  <span style={{ color:C.muted }}>$ </span>
                  {curlSnippet.split('\n').map((line, i) => (
                    <span key={i}>
                      {i === 0 ? <span style={{ color:C.cyan }}>{line}</span> : <span style={{ color:C.subtle }}>{line}</span>}
                      {i < curlSnippet.split('\n').length - 1 ? '\n' : ''}
                    </span>
                  ))}
                </pre>
              </div>
              <AnimatePresence>
                {showResponse && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} transition={{ duration:.5 }}
                    style={{ padding:'12px 20px 20px' }}>
                    <div style={{ marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block', boxShadow:`0 0 6px ${C.green}` }}/>
                      <span style={{ fontSize:11, color:C.green, fontWeight:600 }}>200 OK · 187ms</span>
                    </div>
                    <pre style={{ margin:0, fontSize:11.5, lineHeight:1.7, fontFamily:'ui-monospace, "Cascadia Code", monospace', whiteSpace:'pre-wrap' }}>
                      {curlResponse.split('\n').map((line, i) => {
                        if (line.includes('"score": 94') || line.includes('"status": "malicious"')) return <span key={i} style={{ color:C.red, display:'block' }}>{line}</span>
                        if (line.includes('"risk_level"')) return <span key={i} style={{ color:C.amber, display:'block' }}>{line}</span>
                        if (line.includes('"signals"') || line.includes('"analysis_ms"')) return <span key={i} style={{ color:C.violet, display:'block' }}>{line}</span>
                        return <span key={i} style={{ color:C.subtle, display:'block' }}>{line}</span>
                      })}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:'.1em', textTransform:'uppercase' }}>Tarifs</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8, marginBottom:12 }}>
              Transparent. Prévisible.
            </h2>
            <p style={{ fontSize:15, color:C.subtle }}>Pendant la beta, les premiers accès sont gratuits. Contactez-nous.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:16 }}>
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.08 }}
                style={{ position:'relative', padding:28, background: plan.highlight ? `linear-gradient(135deg, rgba(167,139,250,.06), rgba(65,232,196,.04))` : C.panel,
                  border:`1px solid ${plan.highlight ? C.violet : C.line}`, borderRadius:14,
                  boxShadow: plan.highlight ? `0 0 0 1px ${C.violet}20, 0 20px 60px rgba(167,139,250,.1)` : 'none' }}>
                {plan.badge && (
                  <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                    padding:'4px 14px', background:`linear-gradient(90deg, ${C.violet}, ${C.cyan})`, borderRadius:20,
                    fontSize:11, fontWeight:700, color:'#060d18', whiteSpace:'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <p style={{ fontSize:12, fontWeight:600, color: plan.highlight ? C.violet : C.subtle, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:16 }}>{plan.name}</p>
                <div style={{ marginBottom:6 }}>
                  {plan.period ? (
                    <p style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(36px,4vw,52px)', fontWeight:900, color:C.bright, letterSpacing:'-.03em', lineHeight:1 }}>
                      {plan.price}<span style={{ fontSize:16, fontWeight:400, color:C.subtle }}>{plan.period}</span>
                    </p>
                  ) : (
                    <p style={{ fontFamily:'Syne, sans-serif', fontSize:28, fontWeight:800, color:C.bright, lineHeight:1.2 }}>{plan.price}</p>
                  )}
                </div>
                <p style={{ fontSize:12, color:C.muted, marginBottom:24 }}>{plan.quota}</p>
                <div style={{ height:1, background:C.line, marginBottom:24 }}/>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {plan.features.map(f => (
                    <span key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.sec }}>
                      <Check size={13} style={{ color: plan.highlight ? C.cyan : C.green, flexShrink:0 }}/>{f}
                    </span>
                  ))}
                </div>
                <Link href={plan.href}>
                  {plan.highlight ? (
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                      {plan.cta} <ArrowRight size={14}/>
                    </button>
                  ) : (
                    <button style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 24px',
                      background:'transparent', color:C.pri, fontWeight:500, fontSize:14, borderRadius:10,
                      border:`1px solid ${C.line2}`, cursor:'pointer' }}>
                      {plan.cta}
                    </button>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding:'80px 24px', background:C.panel2, borderTop:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,40px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginBottom:40 }}>Questions fréquentes</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {faqs.map((f,i) => (
              <div key={i} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:10, overflow:'hidden' }}>
                <button onClick={()=>setFaq(faq===i?null:i)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
                  <span style={{ fontSize:13, fontWeight:500, color:C.pri, paddingRight:16 }}>{f.q}</span>
                  <ChevronDown size={14} style={{ color:C.subtle, flexShrink:0, transform:faq===i?'rotate(180deg)':'rotate(0)', transition:'transform .2s' }}/>
                </button>
                <AnimatePresence>
                  {faq===i&&(
                    <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden">
                      <p style={{ padding:'0 18px 16px', fontSize:13, color:C.subtle, lineHeight:1.7 }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:620, margin:'0 auto', textAlign:'center' }}>
          <div style={{ padding:'56px 40px', background:C.panel, border:`1px solid ${C.line2}`, borderRadius:16, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', filter:'blur(80px)', background:`radial-gradient(circle, rgba(65,232,196,.07), transparent)`, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', filter:'blur(80px)', background:`radial-gradient(circle, rgba(167,139,250,.07), transparent)`, pointerEvents:'none' }}/>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:6, background:`${C.cyan}10`, border:`1px solid ${C.cyan}20`, marginBottom:20 }}>
              <span style={{ fontSize:11, color:C.cyan, fontWeight:600 }}>Beta ouverte — accès gratuit</span>
            </div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(22px,4vw,36px)', fontWeight:800, color:C.bright, marginBottom:12, letterSpacing:'-.03em' }}>
              Vous voulez tester ?<br/>On est là.
            </h2>
            <p style={{ fontSize:14, color:C.subtle, marginBottom:32 }}>Créez un compte, récupérez votre clé API, et donnez-nous votre avis. On itère vite.</p>
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:12 }}>
              <Link href="/register">
                <button className="flex items-center gap-2 px-7 py-3 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300">
                  Créer mon compte <ArrowRight size={14}/>
                </button>
              </Link>
              <Link href="/contact">
                <button style={{ padding:'12px 28px', background:'transparent', color:C.pri, fontWeight:500, fontSize:14, borderRadius:10, border:`1px solid ${C.line2}`, cursor:'pointer' }}>
                  Nous écrire
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}
