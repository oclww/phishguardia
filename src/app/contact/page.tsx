'use client'
import { useState, type FormEvent } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useToast } from '@/contexts/ToastContext'

const subjectOptions = [
  { value: 'demo', label: 'Demande de démo' },
  { value: 'support', label: 'Support technique' },
  { value: 'tarifs', label: 'Questions tarifaires' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'autre', label: 'Autre' },
]

const contactInfo = [
  {
    icon: MapPin,
    color: '#7dd3fc',
    label: 'Adresse',
    lines: ['25 Rue de la Paix', '75008 Paris, France'],
  },
  {
    icon: Phone,
    color: '#a78bfa',
    label: 'Téléphone',
    lines: ['+33 1 23 45 67 89'],
  },
  {
    icon: Mail,
    color: '#34d399',
    label: 'Email',
    lines: ['contact@phishguard.ia'],
  },
  {
    icon: Clock,
    color: '#fbbf24',
    label: 'Horaires',
    lines: ['Lun — Ven', '9h — 18h'],
  },
]

interface FormState {
  nom: string
  email: string
  entreprise: string
  sujet: string
  message: string
}

const emptyForm: FormState = {
  nom: '',
  email: '',
  entreprise: '',
  sujet: '',
  message: '',
}

export default function ContactPage() {
  const { addToast } = useToast()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSubmitted(true)
    addToast('success', 'Message envoyé !', 'Notre équipe vous répondra sous 24h.')
  }

  const inputClass =
    'w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-4 py-3 text-sm text-[#eaf2fb] placeholder-[#7a96b4] focus:outline-none focus:border-[#7dd3fc]/50 focus:ring-1 focus:ring-[#7dd3fc]/20 transition-all'

  return (
    <div className="min-h-screen bg-[#060d18]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 text-[#7dd3fc] text-xs font-medium mb-6">
              Nous sommes là pour vous
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#eaf2fb] mb-4"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Contactez-nous
            </h1>
            <p className="text-[#7a96b4] text-lg max-w-xl mx-auto">
              Une question, une démo ou un projet ? Notre équipe vous répond sous 24h.
            </p>
          </motion.div>
        </section>

        {/* Two-column layout */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8 items-start">
            {/* Form — wider column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-3 rounded-2xl border border-[#1a2740] bg-[#0c1526] p-8"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#34d399]/15 border border-[#34d399]/30 flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} className="text-[#34d399]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Message envoyé !
                  </h2>
                  <p className="text-[#7a96b4] max-w-xs leading-relaxed mb-8">
                    Merci de nous avoir contactés. Notre équipe reviendra vers vous dans les 24 heures ouvrées.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(emptyForm) }}
                    className="px-6 py-2.5 rounded-xl border border-[#1a2740] text-sm text-[#eaf2fb] hover:border-[#7dd3fc]/40 hover:bg-[#7dd3fc]/5 transition-all"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[#eaf2fb] mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Envoyez-nous un message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-[#7a96b4] mb-1.5">
                          Nom complet <span className="text-[#fb7185]">*</span>
                        </label>
                        <input
                          type="text"
                          name="nom"
                          required
                          value={form.nom}
                          onChange={handleChange}
                          placeholder="Jean Dupont"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#7a96b4] mb-1.5">
                          Email <span className="text-[#fb7185]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jean@entreprise.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7a96b4] mb-1.5">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        name="entreprise"
                        value={form.entreprise}
                        onChange={handleChange}
                        placeholder="Acme Corp"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7a96b4] mb-1.5">
                        Sujet <span className="text-[#fb7185]">*</span>
                      </label>
                      <select
                        name="sujet"
                        required
                        value={form.sujet}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" disabled>Sélectionnez un sujet</option>
                        {subjectOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7a96b4] mb-1.5">
                        Message <span className="text-[#fb7185]">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Décrivez votre besoin ou votre question..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#7dd3fc]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Envoi en cours…
                        </>
                      ) : (
                        'Envoyer le message →'
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Contact info — narrower column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2 space-y-4"
            >
              {contactInfo.map((info, i) => {
                const Icon = info.icon
                return (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                    className="rounded-2xl border border-[#1a2740] bg-[#0c1526] p-5 flex gap-4 items-start"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${info.color}15`, border: `1px solid ${info.color}30` }}
                    >
                      <Icon size={17} style={{ color: info.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#7a96b4] mb-1">{info.label}</p>
                      {info.lines.map(line => (
                        <p key={line} className="text-sm text-[#eaf2fb] font-medium">{line}</p>
                      ))}
                    </div>
                  </motion.div>
                )
              })}

              {/* Response SLA badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56, duration: 0.4 }}
                className="rounded-2xl border border-[#34d399]/20 bg-[#34d399]/5 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
                  <span className="text-sm font-semibold text-[#34d399]">Temps de réponse garanti</span>
                </div>
                <p className="text-xs text-[#7a96b4] leading-relaxed">
                  Notre équipe s&apos;engage à répondre à toutes les demandes dans les 24 heures ouvrées.
                  Pour les urgences, appelez directement notre ligne de support.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
