-- =============================================================================
-- Migration: 20260608_mail_connections.sql
-- Description: Adds Gmail/Outlook integration support via the mail_connections
--              table. This table stores OAuth tokens and sync state for each
--              connected mailbox per user. Supports multiple providers
--              (gmail, outlook) and enforces row-level security so users can
--              only access their own connection records.
--
-- NOTE: CRON_SECRET
--   A CRON_SECRET environment variable must be set in your Supabase Edge
--   Function secrets to authenticate scheduled sync requests. Generate a
--   strong random string (e.g. openssl rand -hex 32) and add it both to
--   your Supabase project secrets and to your .env.local file.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create the mail_connections table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mail_connections (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider         TEXT        NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email            TEXT        NOT NULL,
  refresh_token    TEXT,
  access_token     TEXT,
  token_expires_at TIMESTAMPTZ,
  last_synced_at   TIMESTAMPTZ,
  history_id       TEXT,
  is_active        BOOLEAN     DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider, email)
);

-- ----------------------------------------------------------------------------
-- 2. Enable Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.mail_connections ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. RLS Policies — users can only see and edit their own rows
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own mail connections"
  ON public.mail_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mail connections"
  ON public.mail_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mail connections"
  ON public.mail_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mail connections"
  ON public.mail_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. Index on user_id (fast lookups by user)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_mail_connections_user_id
  ON public.mail_connections (user_id);

-- ----------------------------------------------------------------------------
-- 5. Index on is_active (fast filtering for active connections in sync jobs)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_mail_connections_is_active
  ON public.mail_connections (is_active);
