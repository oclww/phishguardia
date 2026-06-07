'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Send, CheckCircle2, ArrowLeft, MessageSquare, Building2, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const C = {
  bg: '#0d1117', panel: '#161c26', panel2: '#10161e',
  line: '#1e2a3a', line2: '#253347',
  muted: '#374f67', subtle: '#4d6580', sec: '#7a96b0', pri: '#c8d8e8', bright: '#eaf2ff',
  cyan: '#41e8c4', violet: '#a78bfa', blue: '#5e9ef7',
  green: '#32d583', red: '#ff5f6d', amber: '#f5a623',
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: C.panel2,
  border: `1px solid ${C.line2}`,
  borderRadius: 10,
  color: C.bright,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'border-color .15s',
  boxSizing: 'border-box' as const,
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [focused, setFocused] = useState<string | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const getFocusBorder = (field: string) =>
    focused === field ? `1px solid ${C.cyan}` : `1px solid ${C.line2}`

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Header />

      <section style={{ padding: '100px 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'start' }}>

          {/* Left — info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 6, border: `1px solid ${C.line2}`, background: C.panel, marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.cyan, letterSpacing: '.08em' }}>CONTACTEZ-NOUS</span>
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, color: C.bright, letterSpacing: '-.03em', marginBottom: 16, lineHeight: 1 }}>
              On vous répond<br/>
              <span style={{ color: C.cyan }}>rapidement.</span>
            </h1>

            <p style={{ fontSize: 15, color: C.sec, lineHeight: 1.8, marginBottom: 40 }}>
              Une question sur l&apos;API, un problème technique, une demande de démo ou simplement envie de discuter du projet — on lit tous les messages.
            </p>

            {/* Direct email */}
            <div style={{ padding: '20px 22px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.cyan}12`, border: `1px solid ${C.cyan}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={17} style={{ color: C.cyan }}/>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>Email direct</p>
                  <a href="mailto:oclaw78@gmail.com" style={{ fontSize: 14, fontWeight: 600, color: C.bright, textDecoration: 'none' }}>
                    oclaw78@gmail.com
                  </a>
                </div>
              </div>
              <p style={{ fontSize: 12, color: C.subtle, marginLeft: 50 }}>On répond en général dans les 24h.</p>
            </div>

            {/* Who we are */}
            <div style={{ padding: '16px 20px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14 }}>
              <p style={{ fontSize: 12, color: C.subtle, lineHeight: 1.7 }}>
                💬 Vous parlerez directement à <strong style={{ color: C.pri }}>Matis, Sami ou Lucas</strong> — les créateurs du produit. Pas de support externalisé.
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .1 }}>
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '48px 32px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${C.green}12`, border: `1px solid ${C.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 size={28} style={{ color: C.green }}/>
                  </div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: C.bright, marginBottom: 10 }}>
                    Message envoyé !
                  </h2>
                  <p style={{ fontSize: 14, color: C.sec, lineHeight: 1.7, marginBottom: 28 }}>
                    On a bien reçu votre message. On vous répond dès que possible, généralement dans les 24h.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', company: '', subject: '', message: '' }) }}
                      style={{ padding: '10px 20px', background: 'transparent', color: C.sec, fontSize: 13, borderRadius: 8, border: `1px solid ${C.line2}`, cursor: 'pointer' }}>
                      Nouveau message
                    </button>
                    <Link href="/register">
                      <button className="px-5 py-2.5 bg-[#eaf2fb] text-[#060d18] font-bold text-sm rounded-lg cursor-pointer hover:bg-white transition-all">
                        Créer un compte
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit}
                  style={{ padding: '32px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Name + Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7 }}>
                        <User size={10}/> Prénom *
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={set('name')}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="Matis"
                        style={{ ...inputStyle, border: getFocusBorder('name') }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7 }}>
                        <Mail size={10}/> Email *
                      </label>
                      <input
                        required type="email"
                        value={form.email}
                        onChange={set('email')}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        placeholder="vous@entreprise.com"
                        style={{ ...inputStyle, border: getFocusBorder('email') }}
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7 }}>
                      <Building2 size={10}/> Entreprise
                    </label>
                    <input
                      value={form.company}
                      onChange={set('company')}
                      onFocus={() => setFocused('company')}
                      onBlur={() => setFocused(null)}
                      placeholder="Nom de votre entreprise (optionnel)"
                      style={{ ...inputStyle, border: getFocusBorder('company') }}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7 }}>
                      <MessageSquare size={10}/> Sujet *
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={set('subject')}
                      onFocus={() => setFocused('subject')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle, border: getFocusBorder('subject'), appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Choisir un sujet...</option>
                      <option value="demo">Demande de démo</option>
                      <option value="api">Question sur l&apos;API</option>
                      <option value="pricing">Tarifs & plans</option>
                      <option value="bug">Signaler un problème</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7 }}>
                      Message *
                    </label>
                    <textarea
                      required
                      value={form.message}
                      onChange={set('message')}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                      placeholder="Décrivez votre besoin, votre question ou votre idée..."
                      rows={5}
                      style={{ ...inputStyle, border: getFocusBorder('message'), resize: 'vertical', minHeight: 120 }}
                    />
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div style={{ padding: '10px 14px', background: `${C.red}10`, border: `1px solid ${C.red}20`, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: C.red }}>
                        Une erreur s&apos;est produite. Envoyez-nous directement un email à{' '}
                        <a href="mailto:oclaw78@gmail.com" style={{ color: C.cyan, fontWeight: 600 }}>oclaw78@gmail.com</a>
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl cursor-pointer transition-all duration-300 disabled:opacity-60"
                    style={{ background: status === 'sending' ? C.panel2 : '#eaf2fb', color: '#060d18', border: 'none' }}>
                    {status === 'sending' ? (
                      <>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${C.muted}`, borderTopColor: C.cyan, animation: 'spin 0.8s linear infinite' }}/>
                        Envoi en cours...
                      </>
                    ) : (
                      <><Send size={14}/> Envoyer le message</>
                    )}
                  </button>

                  <p style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>
                    Ou directement par email :{' '}
                    <a href="mailto:oclaw78@gmail.com" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 600 }}>oclaw78@gmail.com</a>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #374f67; }
        input:focus, textarea:focus, select:focus { outline: none; }
        select option { background: #161c26; color: #eaf2ff; }
      `}</style>
    </div>
  )
}
