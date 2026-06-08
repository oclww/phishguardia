'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Provider } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company: string
  phone?: string
  companySize?: string
  plan: 'starter' | 'pro' | 'enterprise'
  avatar?: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithOAuth: (provider: Provider) => Promise<void>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: { company?: string; phone?: string; companySize?: string }) => Promise<boolean>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  company: string
  password: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        logSession(session.user.id)
        await fetchProfile(session.user.id, session.user.email!)
      } else {
        setIsLoading(false)
      }
    }
    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        logSession(session.user.id)
        await fetchProfile(session.user.id, session.user.email!)
      } else {
        setUser(null)
        setIsLoading(false)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tracked_session');
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  const logSession = async (userId: string) => {
    try {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem('tracked_session') || (window as any).isLoggingSession) return;
      (window as any).isLoggingSession = true;
      
      const ua = navigator.userAgent;
      let deviceType = "Appareil Inconnu";
      if (ua.includes("Chrome") && !ua.includes("Edg")) deviceType = "Chrome";
      else if (ua.includes("Firefox")) deviceType = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) deviceType = "Safari";
      else if (ua.includes("Edg")) deviceType = "Edge";
      
      let osType = "OS Inconnu";
      if (ua.includes("Mac")) osType = "macOS";
      else if (ua.includes("Win")) osType = "Windows";
      else if (ua.includes("Linux")) osType = "Linux";
      else if (ua.includes("iPhone") || ua.includes("iPad")) osType = "iOS";
      else if (ua.includes("Android")) osType = "Android";

      let ip = 'Inconnue'
      // IP resolution removed — do not call external services on login

      const { data } = await supabase.from('user_sessions').insert({
        user_id: userId,
        device: `${deviceType} — ${osType}`,
        ip: ip,
        location: 'Non spécifié',
        is_active: true
      }).select('id').single();

      if (data?.id) {
        localStorage.setItem('tracked_session', data.id);
      }
    } catch(e) { 
      console.error('Session logging failed', e); 
    } finally {
      if (typeof window !== 'undefined') {
        (window as any).isLoggingSession = false;
      }
    }
  }

  const fetchProfile = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (data) {
        setUser({
          id,
          email,
          firstName: data.first_name,
          lastName: data.last_name,
          company: data.company,
          phone: data.phone,
          companySize: data.company_size,
          plan: data.plan || 'starter',
          avatar: data.avatar,
        })
      } else {
        setUser({
          id,
          email,
          firstName: '',
          lastName: '',
          company: '',
          phone: '',
          companySize: '',
          plan: 'starter',
        })
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)
    if (error) throw new Error(error.message)
    return true
  }, [])

  const loginWithOAuth = useCallback(async (provider: Provider) => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
        }
      }
    })
    setIsLoading(false)
    if (error) throw new Error(error.message)
    return true
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    
    // Forcer l'annulation si le serveur Supabase ne répond pas au bout de 2s
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
    
    try {
      await Promise.race([
        supabase.auth.signOut(),
        timeout
      ])
    } catch(e) {
      console.error("Erreur de déconnexion:", e)
    } finally {
      // Remove only auth-specific keys — don't nuke other libraries' storage
      ;['tracked_session', 'sb-access-token', 'sb-refresh-token'].forEach(k => {
        try { localStorage.removeItem(k) } catch {}
        try { sessionStorage.removeItem(k) } catch {}
      })
      
      setUser(null)
      setIsLoading(false)
      window.location.href = '/login'
    }
  }, [supabase])

  const updateProfile = useCallback(async (data: { company?: string; phone?: string; companySize?: string }) => {
    if (!user) return false
    setIsLoading(true)
    try {
      const updates = {
        ...(data.company !== undefined && { company: data.company }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.companySize !== undefined && { company_size: data.companySize }),
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) {
        console.error("Supabase Error:", error)
        setIsLoading(false)
        return false
      }
      setUser(prev => prev ? { ...prev, ...data } : prev)
      setIsLoading(false)
      return true
    } catch (e) {
      console.error("Exception:", e)
      setIsLoading(false)
      return false
    }
  }, [user, supabase])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithOAuth, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
