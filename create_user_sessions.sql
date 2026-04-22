-- Script pour activer le vrai tracking des Sessions sur PhishGuard.IA
-- À exécuter dans la section "SQL Editor" de votre espace Supabase.

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device text,
  ip text,
  location text,
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Active la sécurité (seulement l'utilisateur a accès à ses sessions)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
