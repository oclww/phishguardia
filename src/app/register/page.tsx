'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['bg-[#fb7185]', 'bg-[#fb7185]', 'bg-[#fbbf24]', 'bg-yellow-400', 'bg-[#34d399]']
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score - 1] : 'bg-[#1a2740]'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs text-[#7a96b4]">Force : <span className="text-[#eaf2fb]">{labels[score]}</span></p>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, loginWithOAuth } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', company: '', password: '',
  })
  const [cguAccepted, setCguAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!cguAccepted) { setError('Vous devez accepter les CGU.'); return }
    setError('')
    setIsLoading(true)
    try {
      const success = await register(form)
      if (success) router.push('/dashboard')
      else { setError('Une erreur est survenue. Réessayez.'); setIsLoading(false) }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Réessayez.')
      setIsLoading(false)
    }
  }

  async function handleOAuth(provider: any) {
    try {
      setIsLoading(true)
      await loginWithOAuth(provider)
    } catch(err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060d18] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#a78bfa]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#7dd3fc]/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-[#7dd3fc]/20">
              <Shield size={20} className="text-[#060d18]" />
            </div>
            <span className="text-xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>
              PhishGuard<span className="text-[#7dd3fc]">.IA</span>
            </span>
          </Link>
          <p className="mt-4 text-[#7a96b4] text-sm">Commencez votre essai gratuit de 14 jours</p>
        </div>

        <div className="bg-[#0c1526]/80 backdrop-blur-sm border border-[#1a2740] rounded-2xl p-8 shadow-2xl">
          <div className="space-y-3 mb-6">
            {['Google', 'Microsoft'].map(p => (
              <button
                key={p}
                onClick={() => handleOAuth(p.toLowerCase())}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#1a2740] bg-white/5 text-[#eaf2fb] text-sm font-medium hover:bg-white/10 transition-all"
              >
                {p === 'Google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <rect width="10" height="10" fill="#F25022"/>
                    <rect x="11" width="10" height="10" fill="#7FBA00"/>
                    <rect y="11" width="10" height="10" fill="#00A4EF"/>
                    <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                  </svg>
                )}
                S&apos;inscrire avec {p}
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1a2740]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0c1526] text-[#7a96b4]">ou avec email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom" placeholder="Marie" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              <Input label="Nom" placeholder="Dupont" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </div>
            <Input label="Email professionnel" type="email" placeholder="marie@entreprise.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            <Input label="Entreprise" placeholder="TechVision France" value={form.company} onChange={e => set('company', e.target.value)} required />
            <div>
              <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
              <PasswordStrength password={form.password} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${cguAccepted ? 'bg-[#7dd3fc] border-[#7dd3fc]' : 'border-[#1a2740] group-hover:border-[#7dd3fc]/50'}`}
                onClick={() => setCguAccepted(v => !v)}
              >
                {cguAccepted && <Check size={10} className="text-[#060d18]" />}
              </div>
              <span className="text-xs text-[#7a96b4]">
                J&apos;accepte les{' '}
                <Link href="/legal/terms" className="text-[#7dd3fc] hover:underline">
                  Conditions Générales d&apos;Utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/legal/privacy" className="text-[#7dd3fc] hover:underline">
                  Politique de confidentialité
                </Link>
              </span>
            </label>

            {error && (
              <div className="text-xs text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Créer mon compte gratuitement
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7a96b4]">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#7dd3fc] hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
