"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Shield, Zap, Brain, Activity, BarChart2, Plug, Code, ChevronDown, Star, Check, ArrowRight, Key, Terminal, Lock } from "lucide-react"
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

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let v = 0; const step = end / (1500 / 16)
    const t = setInterval(() => { v += step; if (v >= end) { setN(end); clearInterval(t) } else setN(Math.floor(v)) }, 16)
    return () => clearInterval(t)
  }, [inView, end])
  return <span ref={ref}>{n.toLocaleString("fr-FR")}{suffix}</span>
}

const features = [
  { icon: Brain,    title: "Détection IA",          desc: "Deep learning sur 500M+ emails. 99.7% de précision en production.",          c: C.cyan   },
  { icon: Zap,      title: "Analyse <2 secondes",   desc: "Chaque email inspecté en moins de 2 secondes, avant livraison.",              c: C.blue   },
  { icon: Activity, title: "Comportemental",         desc: "Détection des anomalies et zero-day par analyse comportementale.",            c: C.green  },
  { icon: BarChart2,"title": "Rapports automatiques", desc: "Dashboard temps réel et rapports PDF hebdomadaires automatisés.",            c: C.amber  },
  { icon: Plug,     title: "6 gateways supportés",  desc: "Microsoft 365, Google Workspace, Proofpoint, Mimecast, Postfix, Sendmail.",   c: C.violet },
  { icon: Code,     title: "API REST",               desc: "SDKs Python, JavaScript, Go. Webhooks. Documentation complète.",             c: C.cyan   },
]

const testimonials = [
  { quote: "PhishGuard.IA a réduit nos incidents de phishing de 94% en 3 mois. L'intégration API a pris moins d'une heure côté technique. Exactement ce dont une DSI de PME a besoin.", name: "Sébastien Morel", role: "DSI", co: "EcoLogistique" },
  { quote: "En tant que RSSI d'une banque régionale, j'avais des exigences élevées sur la confidentialité. Zéro stockage d'emails, hébergement EU, DPA fourni en 24h. Irréprochable.", name: "Isabelle Faure",  role: "RSSI",      co: "Crédit Numérique" },
  { quote: "200 000 emails par jour, zéro faux positif bloquant un client. La précision du score IA est vraiment remarquable — et l'API répond en moins de 2 secondes à chaque fois.", name: "Marc Dubois",    role: "CTO",         co: "InnoSanté" },
]

const faqs = [
  { q: "Comment fonctionne la détection IA ?",   a: "Plus de 500 signaux analysés par email : linguistique, réputation domaine, URLs, comportement expéditeur. 99.7% de précision." },
  { q: "Combien de temps prend l'intégration ?", a: "5 à 15 minutes via API REST ou plugins natifs Gmail, Outlook, Microsoft 365." },
  { q: "Mes emails sont-ils stockés ?",          a: "Non. Seules les métadonnées sont analysées. Le contenu n'est jamais conservé." },
  { q: "Proposez-vous un essai gratuit ?",       a: "14 jours sur le plan Pro sans carte bancaire. Toutes les fonctionnalités incluses." },
  { q: "Êtes-vous conformes au RGPD ?",          a: "100% conformes RGPD. Données hébergées en Europe, DPO dédié, DPA fourni sur demande." },
]

const logos = ["TechVision", "Crédit Numérique", "InnoSanté", "EcoLogistique", "MediaPlus", "FinTech360", "DataSphere"]

const steps = [
  { icon: Key,      n: "01", title: "Générez une clé API",            desc: "Créez votre compte, récupérez votre clé API en 30 secondes depuis le dashboard. Aucune configuration réseau requise.", c: C.cyan   },
  { icon: Terminal, n: "02", title: "Intégrez en 5 lignes de code",   desc: "Appelez le endpoint /api/v1/analyze depuis votre gateway email existant. SDKs disponibles pour Python, Node.js et Go.", c: C.violet },
  { icon: Lock,     n: "03", title: "Menaces bloquées automatiquement", desc: "PhishGuard.IA analyse chaque email en <2s et retourne un score de risque. Votre gateway décide de bloquer ou délivrer.", c: C.green  },
]

const plans = [
  {
    name: "Starter",
    price: "49",
    period: "/mois",
    highlight: false,
    badge: null,
    quota: "10 000 emails/mois",
    features: ["API REST complète", "Score de risque IA", "Dashboard basique", "Support email", "Historique 30 jours", "1 gateway"],
    cta: "Commencer",
    href: "/register?plan=starter",
  },
  {
    name: "Pro",
    price: "149",
    period: "/mois",
    highlight: true,
    badge: "Le plus populaire",
    quota: "100 000 emails/mois",
    features: ["Tout Starter inclus", "Webhooks temps réel", "Rapports PDF auto", "Support prioritaire", "Historique 1 an", "6 gateways", "Essai 14j gratuit"],
    cta: "Démarrer l'essai",
    href: "/register?plan=pro",
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    highlight: false,
    badge: null,
    quota: "Volume illimité",
    features: ["Tout Pro inclus", "SLA 99.99% garanti", "SSO & SAML", "DPA & RGPD dédié", "Déploiement on-premise", "CSM dédié", "Formation équipes"],
    cta: "Nous contacter",
    href: "/contact?plan=enterprise",
  },
]

const curlSnippet = `curl -X POST https://api.phishguard.ia/v1/analyze \\
  -H "Authorization: Bearer pg_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "security@micros0ft-alert.com",
    "subject": "Action immédiate requise pour votre compte",
    "body_text": "Votre compte Microsoft sera suspendu..."
  }'`

const curlResponse = `{
  "id": "pg_01HXYZ9ABC",
  "score": 94,
  "status": "blocked",
  "risk_level": "critical",
  "signals": [
    "domain_spoofing",
    "urgency_manipulation",
    "masked_redirect_url"
  ],
  "analysis_ms": 187
}`

export default function LandingPage() {
  const [faq, setFaq] = useState<number | null>(null)
  const [risk, setRisk] = useState(0)
  const [showResponse, setShowResponse] = useState(false)

  // Animate risk bar
  useEffect(() => {
    const t = setTimeout(() => setRisk(87), 600)
    return () => clearTimeout(t)
  }, [])

  // Animate code snippet response reveal
  useEffect(() => {
    const t = setTimeout(() => setShowResponse(true), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <Header/>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left — big title */}
          <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7 }}>
            {/* Tag */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:6, border:`1px solid ${C.line2}`, background:C.panel, marginBottom:32 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:C.green, display:'inline-block', animation:'pulse 2s infinite', boxShadow:`0 0 8px ${C.green}` }}/>
              <span style={{ fontSize:11, fontWeight:500, color:C.subtle, letterSpacing:'.08em' }}>API-FIRST · &lt;2 SECONDES · HÉBERGEMENT EUROPE</span>
            </div>

            {/* Main title */}
            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(42px, 5.5vw, 74px)', fontWeight:900, lineHeight:.95, letterSpacing:'-.04em', color:C.bright, marginBottom:28 }}>
              Protégez vos<br/>
              collaborateurs<br/>
              contre le phishing<br/>
              <span style={{ color:C.violet }}>en 5 minutes.</span>
            </h1>

            {/* Sub */}
            <p style={{ fontSize:16, color:C.sec, lineHeight:1.7, maxWidth:460, marginBottom:40 }}>
              PhishGuard.IA est une API de détection de phishing par IA, conçue pour s'intégrer directement dans votre gateway email. Un endpoint, 5 lignes de code, zéro compromis sur la sécurité.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:40 }}>
              <Link href="/register">
                <button className="flex items-center gap-2 px-7 py-3.5 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300">
                  Obtenir ma clé API <ArrowRight size={15}/>
                </button>
              </Link>
              <Link href="/dashboard">
                <button style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 28px', background:'transparent', color:C.pri, fontWeight:500, fontSize:14, borderRadius:10, border:`1px solid ${C.line2}`, cursor:'pointer' }}>
                  Voir la documentation
                </button>
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:20 }}>
              {["99,7% de détection", "RGPD & logs d'audit", "Aucune configuration réseau", "14j d'essai gratuit"].map(s => (
                <span key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.subtle }}>
                  <Check size={13} style={{ color:C.cyan }}/>
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — demo card */}
          <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7, delay:.15 }}>
            <div style={{ background:C.panel, border:`1px solid ${C.line2}`, borderRadius:16, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,.5)' }}>
              {/* Card header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div style={{ display:'flex', gap:6 }}>
                  {[C.red, C.amber, C.green].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }}/>)}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:6, background:`rgba(50,213,131,.1)`, border:`1px solid rgba(50,213,131,.2)` }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block', animation:'pulse 2s infinite', boxShadow:`0 0 6px ${C.green}` }}/>
                  <span style={{ fontSize:11, fontWeight:500, color:C.green }}>Surveillance en direct</span>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
                {[{v:'99.7%',l:'DÉTECTION'},{v:'<2s',l:'ANALYSE'},{v:'6',l:'GATEWAYS'}].map(s => (
                  <div key={s.l} style={{ background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:'12px 10px', textAlign:'center' }}>
                    <p style={{ fontSize:20, fontWeight:700, color:C.cyan, fontFamily:'Syne, sans-serif' }}>{s.v}</p>
                    <p style={{ fontSize:9, color:C.muted, letterSpacing:'.08em', marginTop:2 }}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Threat card */}
              <div style={{ background:C.panel2, border:`1px solid ${C.line2}`, borderRadius:10, padding:16, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:C.pri }}>Service Sécurité Microsoft</p>
                    <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>security@micros0ft-alert.com</p>
                  </div>
                  <span style={{ padding:'4px 10px', background:`rgba(245,166,35,.12)`, border:`1px solid rgba(245,166,35,.25)`, borderRadius:6, fontSize:11, fontWeight:600, color:C.amber, whiteSpace:'nowrap' }}>
                    Risque {risk}/100
                  </span>
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:C.pri, marginBottom:6 }}>Action immédiate requise pour votre compte</p>
                <p style={{ fontSize:12, color:C.subtle, lineHeight:1.6, marginBottom:12 }}>Domaine usurpé, urgence artificielle, lien masqué et incohérence expéditeur détectés par l'IA.</p>

                {/* Risk bar */}
                <div style={{ height:4, background:C.line, borderRadius:4, overflow:'hidden', marginBottom:14 }}>
                  <motion.div animate={{ width:`${risk}%` }} transition={{ duration:1.2, ease:'easeOut' }}
                    style={{ height:'100%', background:`linear-gradient(90deg, ${C.amber}, ${C.red})`, borderRadius:4 }}/>
                </div>

                {/* Indicators */}
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

      {/* ── Logos ── */}
      <section style={{ padding:'24px 0', borderTop:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:48, width:'max-content', animation:'marquee 28s linear infinite' }}>
          {[...logos,...logos].map((l,i) => (
            <span key={i} style={{ fontSize:13, fontWeight:600, color:C.line2, whiteSpace:'nowrap' }}>{l}</span>
          ))}
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
            <p style={{ fontSize:15, color:C.subtle, maxWidth:480, margin:'0 auto' }}>De zéro à une protection complète de vos emails en moins de 5 minutes.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:24 }}>
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
                style={{ position:'relative', padding:28, background:C.panel, border:`1px solid ${C.line}`, borderRadius:14 }}>
                {/* Step number */}
                <div style={{ fontSize:11, fontWeight:700, color:s.c, letterSpacing:'.12em', marginBottom:16 }}>{s.n}</div>
                {/* Icon */}
                <div style={{ width:42, height:42, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:`${s.c}12`, border:`1px solid ${s.c}20`, marginBottom:16 }}>
                  <s.icon size={19} style={{ color:s.c }}/>
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.pri, marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:C.subtle, lineHeight:1.7 }}>{s.desc}</p>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{ display:'none' }}/>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding:'72px 24px', background:C.panel2, borderTop:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:32, textAlign:'center' }}>
          {[
            { value: 99.7, suffix: '%',  label: 'de détection',         color: C.cyan   },
            { value: 2,    suffix: 's',  label: "temps d'analyse max",  color: C.violet },
            { value: 6,    suffix: '',   label: 'gateways supportés',   color: C.blue   },
            { value: 0,    suffix: '',   label: 'configuration réseau', color: C.green  },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.08 }}>
              <p style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(36px,5vw,56px)', fontWeight:900, color:s.color, lineHeight:1, letterSpacing:'-.03em', marginBottom:10 }}>
                {s.suffix === '%' || s.suffix === 's' ? (
                  <><CountUp end={s.value} />{s.suffix}</>
                ) : s.label === 'configuration réseau' ? (
                  <><CountUp end={0} />{s.suffix}</>
                ) : (
                  <><CountUp end={s.value} />{s.suffix}</>
                )}
              </p>
              <p style={{ fontSize:13, color:C.sec, letterSpacing:'.02em' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Code snippet ── */}
      <section style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          {/* Left — copy */}
          <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:.6 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:'.1em', textTransform:'uppercase' }}>API-first</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(26px,3.5vw,42px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8, marginBottom:16 }}>
              5 lignes de code.<br/>
              <span style={{ color:C.violet }}>Protection totale.</span>
            </h2>
            <p style={{ fontSize:15, color:C.subtle, lineHeight:1.75, marginBottom:32 }}>
              Appelez notre endpoint REST depuis votre gateway email. PhishGuard.IA analyse l'email en temps réel et vous retourne un score de risque en moins de 200ms.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {["Réponse JSON en <200ms", "SDKs Python, Node.js, Go", "Webhooks & callbacks", "99.99% de disponibilité SLA"].map(f => (
                <span key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.sec }}>
                  <Check size={14} style={{ color:C.cyan, flexShrink:0 }}/>{f}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — terminal */}
          <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:.6, delay:.1 }}>
            <div style={{ background:'#090d13', border:`1px solid ${C.line2}`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.5)' }}>
              {/* Terminal header */}
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 16px', borderBottom:`1px solid ${C.line}`, background:C.panel }}>
                {[C.red, C.amber, C.green].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }}/>)}
                <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>phishguard-api — curl</span>
              </div>
              {/* Request */}
              <div style={{ padding:'20px 20px 0' }}>
                <pre style={{ margin:0, fontSize:11.5, lineHeight:1.7, color:C.sec, fontFamily:'ui-monospace, "Cascadia Code", monospace', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
                  <span style={{ color:C.muted }}>$</span>{" "}
                  {curlSnippet.split('\n').map((line, i) => (
                    <span key={i}>
                      {i === 0 ? <span style={{ color:C.cyan }}>{line}</span> : <span style={{ color:C.subtle }}>{line}</span>}
                      {i < curlSnippet.split('\n').length - 1 ? '\n' : ''}
                    </span>
                  ))}
                </pre>
              </div>
              {/* Response */}
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
                        if (line.includes('"score": 94') || line.includes('"status": "blocked"')) {
                          return <span key={i} style={{ color:C.red, display:'block' }}>{line}</span>
                        }
                        if (line.includes('"risk_level"')) return <span key={i} style={{ color:C.amber, display:'block' }}>{line}</span>
                        if (line.includes('"signals"') || line.includes('"analysis_ms"')) return <span key={i} style={{ color:C.violet, display:'block' }}>{line}</span>
                        if (line.includes('"id"')) return <span key={i} style={{ color:C.cyan, display:'block' }}>{line}</span>
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

      {/* ── Features ── */}
      <section style={{ padding:'80px 24px', background:C.panel2, borderTop:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginBottom:12 }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ fontSize:15, color:C.subtle }}>Une suite complète pour protéger chaque vecteur d'attaque</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:12 }}>
            {features.map((f,i) => (
              <motion.div key={f.title} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.06}}
                style={{ padding:20, background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, cursor:'default', transition:'border-color .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=C.line2)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=C.line)}>
                <div style={{ width:38, height:38, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:`${f.c}12`, border:`1px solid ${f.c}20`, marginBottom:14 }}>
                  <f.icon size={17} style={{ color:f.c }}/>
                </div>
                <h3 style={{ fontSize:14, fontWeight:600, color:C.pri, marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:12, color:C.subtle, lineHeight:1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:'.1em', textTransform:'uppercase' }}>Tarifs</span>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginTop:8, marginBottom:12 }}>
              Transparent. Prévisible. Sans surprise.
            </h2>
            <p style={{ fontSize:15, color:C.subtle }}>14 jours d'essai gratuit sur le plan Pro. Aucune carte bancaire requise.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:16 }}>
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.08 }}
                style={{ position:'relative', padding:28, background: plan.highlight ? `linear-gradient(135deg, rgba(167,139,250,.06), rgba(65,232,196,.04))` : C.panel,
                  border:`1px solid ${plan.highlight ? C.violet : C.line}`, borderRadius:14,
                  boxShadow: plan.highlight ? `0 0 0 1px ${C.violet}20, 0 20px 60px rgba(167,139,250,.1)` : 'none' }}>
                {/* Popular badge */}
                {plan.badge && (
                  <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                    padding:'4px 14px', background:`linear-gradient(90deg, ${C.violet}, ${C.cyan})`, borderRadius:20,
                    fontSize:11, fontWeight:700, color:'#060d18', whiteSpace:'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                {/* Plan name */}
                <p style={{ fontSize:12, fontWeight:600, color: plan.highlight ? C.violet : C.subtle, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:16 }}>{plan.name}</p>
                {/* Price */}
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
                {/* Divider */}
                <div style={{ height:1, background:C.line, marginBottom:24 }}/>
                {/* Features */}
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {plan.features.map(f => (
                    <span key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.sec }}>
                      <Check size={13} style={{ color: plan.highlight ? C.cyan : C.green, flexShrink:0 }}/>{f}
                    </span>
                  ))}
                </div>
                {/* CTA */}
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

      {/* ── Testimonials ── */}
      <section style={{ padding:'80px 24px', background:C.panel2, borderTop:`1px solid ${C.line}` }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,40px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginBottom:48 }}>
            Ils nous font confiance
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:16 }}>
            {testimonials.map((t,i) => (
              <motion.div key={t.name} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}}
                style={{ padding:24, background:C.panel, border:`1px solid ${C.line}`, borderRadius:12 }}>
                <div style={{ display:'flex', gap:3, marginBottom:16 }}>
                  {[...Array(5)].map((_,j) => <Star key={j} size={12} style={{ color:C.amber, fill:C.amber }}/>)}
                </div>
                <p style={{ fontSize:13, color:C.subtle, lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>"{t.quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:`${C.cyan}14`, border:`1px solid ${C.cyan}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.cyan }}>
                    {t.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:C.pri }}>{t.name}</p>
                    <p style={{ fontSize:11, color:C.muted }}>{t.role} · {t.co}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,40px)', fontWeight:800, color:C.bright, letterSpacing:'-.03em', marginBottom:40 }}>FAQ</h2>
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

      {/* ── CTA ── */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:620, margin:'0 auto', textAlign:'center' }}>
          <div style={{ padding:'56px 40px', background:C.panel, border:`1px solid ${C.line2}`, borderRadius:16, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', filter:'blur(80px)', background:`radial-gradient(circle, rgba(65,232,196,.07), transparent)`, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', filter:'blur(80px)', background:`radial-gradient(circle, rgba(167,139,250,.07), transparent)`, pointerEvents:'none' }}/>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(22px,4vw,36px)', fontWeight:800, color:C.bright, marginBottom:12, letterSpacing:'-.03em' }}>
              Prêt à protéger votre organisation ?
            </h2>
            <p style={{ fontSize:14, color:C.subtle, marginBottom:32 }}>14 jours d'essai gratuit. Sans carte bancaire. Annulation à tout moment.</p>
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:12 }}>
              <Link href="/register">
                <button className="flex items-center gap-2 px-7 py-3 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300">
                  Obtenir ma clé API <ArrowRight size={14}/>
                </button>
              </Link>
              <Link href="/contact">
                <button style={{ padding:'12px 28px', background:'transparent', color:C.pri, fontWeight:500, fontSize:14, borderRadius:10, border:`1px solid ${C.line2}`, cursor:'pointer' }}>
                  Demander une démo
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
