# Supabase — Guardia v2

This directory contains all Supabase database migrations and related configuration for the Guardia v2 project.

---

## Running a Migration in the Supabase Dashboard

> [!IMPORTANT]
> Always run migrations **in order** (oldest timestamp first). Never skip a migration file.

1. Open your [Supabase project dashboard](https://app.supabase.com).
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Copy-paste the contents of the migration file (e.g. `migrations/20260608_mail_connections.sql`) into the editor.
5. Click **Run** (or press `Ctrl + Enter`).
6. Confirm the output panel shows no errors.

You can also use the Supabase CLI if you have it set up locally:

```bash
supabase db push
```

---

## Required Environment Variables

All variables are already present in `.env.local`. Make sure they are also added to your **Supabase project secrets** (for Edge Functions) via the dashboard under **Project Settings → Edge Functions → Secrets**, or via the CLI:

```bash
supabase secrets set KEY=value
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-side only, never expose to client** |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret from Google Cloud Console |
| `MICROSOFT_CLIENT_ID` | OAuth 2.0 client ID from Azure App Registration |
| `MICROSOFT_CLIENT_SECRET` | OAuth 2.0 client secret from Azure App Registration |
| `CRON_SECRET` | Shared secret used to authenticate scheduled sync requests (see below) |

---

## Setting Up the Auto-Sync Cron (Supabase Edge Functions)

The mail sync cron job calls a Supabase Edge Function on a schedule to refresh OAuth tokens and pull new emails for all active connections.

### 1. Deploy the Edge Function

```bash
supabase functions deploy mail-sync
```

### 2. Generate & Set `CRON_SECRET`

Generate a strong random secret:

```bash
openssl rand -hex 32
```

Add it to Supabase secrets **and** to your local `.env.local`:

```bash
supabase secrets set CRON_SECRET=<your-generated-secret>
```

```env
# .env.local
CRON_SECRET=<your-generated-secret>
```

### 3. Schedule the Cron Job via Supabase Dashboard

Supabase supports pg_cron natively. Run the following in the **SQL Editor**:

```sql
-- Run the mail-sync Edge Function every 5 minutes
SELECT cron.schedule(
  'mail-sync-cron',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url    := current_setting('app.supabase_url') || '/functions/v1/mail-sync',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb,
      body   := '{}'::jsonb
    ) AS request_id;
  $$
);
```

> [!TIP]
> You can also configure the cron interval directly in the **Database → Extensions → pg_cron** section of the Supabase dashboard UI.

### 4. Verify the Schedule

```sql
SELECT * FROM cron.job;
```

### 5. Remove the Schedule (if needed)

```sql
SELECT cron.unschedule('mail-sync-cron');
```

---

## Migrations Index

| File | Description |
|---|---|
| `20260608_mail_connections.sql` | Creates `mail_connections` table with RLS and indexes for Gmail/Outlook OAuth integration |
