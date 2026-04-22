'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Briefcase, Phone, Users, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateProfile, isLoading: authLoading } = useAuth()
  const [form, setForm] = useState({ company: '', phone: '', companySize: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.company) {
      setError("Le nom de l'entreprise est obligatoire.")
      return
    }
    setError('')
    setIsLoading(true)
    
    const success = await updateProfile({
      company: form.company,
      phone: form.phone,
      companySize: form.companySize
    })
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError("Une erreur est survenue lors de l'enregistrement.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && user.company) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#060d18] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7dd3fc] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#060d18] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorations matching the login page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-[#a78bfa]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-[#7dd3fc]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] shadow-lg shadow-[#7dd3fc]/20 mb-6">
            <Shield size={32} className="text-[#060d18]" />
          </div>
          <h1 className="text-3xl font-bold text-[#eaf2fb] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            Bienvenue, {user.firstName} !
          </h1>
          <p className="text-[#7a96b4] text-sm max-w-sm mx-auto leading-relaxed">
            Pour personnaliser votre espace et activer la protection de vos collaborateurs, parlez-nous un peu de votre structure.
          </p>
        </div>

        <div className="bg-[#0c1526]/80 backdrop-blur-xl border border-[#1a2740] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7dd3fc] via-[#a78bfa] to-[#34d399] opacity-70" />

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div className="relative">
                <Input 
                  label="Nom complet de l'entreprise *" 
                  placeholder="Ex: TechVision France" 
                  value={form.company} 
                  onChange={e => set('company', e.target.value)} 
                  className="pl-10"
                  required 
                />
                <Briefcase size={16} className="absolute left-3.5 top-[34px] text-[#4d6580]" />
              </div>

              <div className="relative">
                <Input 
                  label="Numéro de contact professionnel" 
                  type="tel"
                  placeholder="+33 6 12 34 56 78" 
                  value={form.phone} 
                  onChange={e => set('phone', e.target.value)} 
                  className="pl-10"
                />
                <Phone size={16} className="absolute left-3.5 top-[34px] text-[#4d6580]" />
              </div>

              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#c8d8e8] uppercase tracking-wider">
                  Taille de l'entreprise
                </label>
                <div className="relative">
                  <select
                    value={form.companySize}
                    onChange={e => set('companySize', e.target.value)}
                    className="w-full bg-[#060d18]/50 border border-[#1a2740] rounded-xl pl-10 pr-4 py-3 text-sm text-[#eaf2fb] outline-none hover:border-[#253347] focus:border-[#7dd3fc]/60 focus:bg-[#060d18] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-[#4d6580]">Sélectionnez la taille...</option>
                    <option value="1-10">1 à 10 employés</option>
                    <option value="11-50">11 à 50 employés</option>
                    <option value="51-200">51 à 200 employés</option>
                    <option value="201-1000">201 à 1000 employés</option>
                    <option value="1000+">Plus de 1000 employés</option>
                  </select>
                  <Users size={16} className="absolute left-3.5 top-3.5 text-[#4d6580] pointer-events-none" />
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-[#4d6580]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/20 rounded-xl px-4 py-3">
                {error}
              </motion.div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-4 h-12 text-[15px]">
              Finaliser mon compte
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
