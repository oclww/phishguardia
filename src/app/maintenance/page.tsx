'use client'
import { Shield, Clock, Wrench, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const C = {
  bg: '#0d1117', panel: '#161c26',
  line: '#1e2a3a', line2: '#253347',
  subtle: '#4d6580', sec: '#7a96b0', pri: '#c8d8e8', bright: '#eaf2ff',
  cyan: '#41e8c4', violet: '#a78bfa', amber: '#f5a623',
}

export default function MaintenancePage() {
  return (
    <div style={{
      background: C.bg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Glow bg */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(circle, rgba(65,232,196,.04), transparent)', pointerEvents: 'none' }}/>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .6 }}
        style={{ maxWidth: 480, width: '100%' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #41e8c4, #5e9ef7)', boxShadow: '0 0 24px rgba(65,232,196,.3)' }}>
            <Shield size={17} style={{ color: '#0d1117' }} strokeWidth={2.5}/>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: C.bright }}>
            PhishGuard<span style={{ color: C.cyan }}>.IA</span>
          </span>
        </div>

        {/* Card */}
        <div style={{ padding: '44px 40px', background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,.4)', position: 'relative', overflow: 'hidden' }}>
          {/* Corner glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', filter: 'blur(50px)', background: `rgba(65,232,196,.06)`, pointerEvents: 'none' }}/>

          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 16, background: `${C.amber}12`, border: `1px solid ${C.amber}25`, marginBottom: 24 }}
          >
            <Wrench size={26} style={{ color: C.amber }}/>
          </motion.div>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 6, background: `${C.amber}10`, border: `1px solid ${C.amber}20`, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${C.amber}` }}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.amber, letterSpacing: '.06em' }}>MAINTENANCE EN COURS</span>
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: C.bright, letterSpacing: '-.03em', marginBottom: 14, lineHeight: 1.1 }}>
            On améliore le site.
          </h1>

          <p style={{ fontSize: 15, color: C.sec, lineHeight: 1.8, marginBottom: 32 }}>
            Nous mettons à jour PhishGuard.IA en ce moment. Revenez dans quelques minutes — le site sera disponible très rapidement.
          </p>

          {/* Info block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: `${C.cyan}08`, border: `1px solid ${C.cyan}15`, borderRadius: 12, marginBottom: 28, textAlign: 'left' }}>
            <Clock size={16} style={{ color: C.cyan, flexShrink: 0 }}/>
            <p style={{ fontSize: 13, color: C.sec, margin: 0, lineHeight: 1.6 }}>
              Si vous avez un compte actif, vos données sont en sécurité. L&apos;accès sera rétabli sous peu.
            </p>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'API de détection', ok: true },
              { label: 'Base de données', ok: true },
              { label: 'Interface web', ok: false },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: C.subtle }}>{s.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: s.ok ? '#32d583' : C.amber, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.ok ? '#32d583' : C.amber, display: 'inline-block' }}/>
                  {s.ok ? 'Opérationnel' : 'Mise à jour'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <p style={{ marginTop: 28, fontSize: 13, color: C.subtle }}>
          Questions ?{' '}
          <a href="mailto:contact@phishguardia.fr" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Contactez-nous <ArrowRight size={12}/>
          </a>
        </p>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  )
}
