'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Chrome } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect.')
      setIsLoading(false)
    }
  }

  async function handleOAuth(provider: any) {
    try {
      await loginWithOAuth(provider)
    } catch(err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

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
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-[#7dd3fc]/20">
              <Shield size={20} className="text-[#060d18]" />
            </div>
            <span className="text-xl font-bold text-[#eaf2fb]" style={{ fontFamily: 'Syne, sans-serif' }}>
              PhishGuard<span className="text-[#7dd3fc]">.IA</span>
            </span>
          </Link>
          <p className="mt-4 text-[#7a96b4] text-sm">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-[#0c1526]/80 backdrop-blur-sm border border-[#1a2740] rounded-2xl p-8 shadow-2xl">
          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#1a2740] bg-white/5 text-[#eaf2fb] text-sm font-medium hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1a2740]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0c1526] text-[#7a96b4]">ou continuer avec email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div>
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <div className="mt-1.5 text-right">
                <Link href="/auth/reset-password" className="text-xs text-[#7dd3fc] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7a96b4]">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-[#7dd3fc] hover:underline font-medium">
              Créer un compte
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  )
}
