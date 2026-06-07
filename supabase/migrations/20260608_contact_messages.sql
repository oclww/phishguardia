-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: contact_messages table
-- Purpose: Store contact form submissions from /contact page
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  subject     TEXT NOT NULL DEFAULT 'Contact depuis le site',
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Only service role (backend) can insert and read messages
-- Public users cannot read messages (admin only via service key)
CREATE POLICY "Service role only"
  ON public.contact_messages
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages(created_at DESC);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_read
  ON public.contact_messages(read)
  WHERE read = false;
