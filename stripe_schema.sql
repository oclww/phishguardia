-- Script pour activer les abonnements Stripe sur Supabase
-- À exécuter dans la section "SQL Editor" de votre espace Supabase.

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Active la sécurité
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own stripe_customers row"
ON public.stripe_customers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text PRIMARY KEY, -- Stripe Subscription ID
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  plan_id text,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fonction optionnelle d'auto-update si vous avez un trigger updated_at
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--    NEW.updated_at = now();
--    RETURN NEW;
-- END;
-- $$ language 'plpgsql';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
