'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, CheckCircle2, EyeOff, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'request' | 'update'>('request')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Detect if we arrived via a password-reset magic link (contains #access_token)
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setMode('update')
    }
  }, [])

  async function handleRequest(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setIsLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setIsLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    }
  }

  const pwdStrength = (() => {
    const checks = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[a-z]/.test(newPassword),
      /\d/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ]
    return checks.filter(Boolean).length
  })()

  const strengthColor = ['#1a2740','#fb7185','#fb7185','#fbbf24','#34d399','#34d399'][pwdStrength]

  return (
    <div className="min-h-screen bg-[#060d18] flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7dd3fc]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#a78bfa]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-[#7dd3fc]/20">
              <Shield size={20} className="text-[#060d18]" />
            </div>
            <span className="text-xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>
              PhishGuard<span className="text-[#7dd3fc]">.IA</span>
            </span>
          </Link>
          <p className="mt-4 text-[#7a96b4] text-sm">
            {mode === 'request' ? 'Réinitialisation du mot de passe' : 'Choisissez un nouveau mot de passe'}
          </p>
        </div>

        <div className="bg-[#0c1526]/80 backdrop-blur-sm border border-[#1a2740] rounded-2xl p-8 shadow-2xl">

          {/* ─── SUCCESS STATE ─── */}
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: .95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-[#34d399]" />
              </div>
              {mode === 'request' ? (
                <>
                  <p className="text-[#eaf2fb] font-semibold">Email envoyé !</p>
                  <p className="text-[#7a96b4] text-sm">
                    Vérifiez votre boîte mail. Le lien de réinitialisation expirera dans 1 heure.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[#eaf2fb] font-semibold">Mot de passe mis à jour !</p>
                  <p className="text-[#7a96b4] text-sm">
                    Redirection vers la page de connexion…
                  </p>
                </>
              )}
              <Link href="/login" className="text-sm text-[#7dd3fc] hover:underline mt-2">
                Retour à la connexion
              </Link>
            </motion.div>
          ) : mode === 'request' ? (

            /* ─── REQUEST EMAIL ─── */
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Adresse email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6580]" />
                  <input
                    type="email"
                    placeholder="vous@entreprise.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2.5 pl-9 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 transition-colors placeholder:text-[#7a96b4]"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] font-bold text-sm rounded-xl transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-[#060d18] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail size={15} />
                )}
                Envoyer le lien de réinitialisation
              </button>
            </form>

          ) : (

            /* ─── UPDATE PASSWORD ─── */
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6580]" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2.5 pl-9 pr-10 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 transition-colors placeholder:text-[#7a96b4]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6580] hover:text-[#eaf2fb] transition-colors"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div className="mt-1.5 flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwdStrength ? strengthColor : '#1a2740' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#7a96b4] text-xs mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6580]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#060d18] border border-[#1a2740] rounded-xl px-3 py-2.5 pl-9 text-sm text-[#eaf2fb] outline-none focus:border-[#7dd3fc]/50 transition-colors placeholder:text-[#7a96b4]"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-[#fb7185] mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {error && (
                <div className="text-xs text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#060d18] font-bold text-sm rounded-xl transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-[#060d18] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                Mettre à jour le mot de passe
              </button>
            </form>
          )}

          {!done && (
            <p className="mt-6 text-center text-sm text-[#7a96b4]">
              <Link href="/login" className="text-[#7dd3fc] hover:underline font-medium">
                ← Retour à la connexion
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
