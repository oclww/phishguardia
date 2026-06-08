import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI         = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/mail/callback`
const APP_URL              = process.env.NEXT_PUBLIC_APP_URL!

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') // kept for logging only

  const errorRedirect = `${APP_URL}/dashboard/settings?tab=integrations&error=connection_failed`

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=oauth_denied`)
  }

  try {
    // ── Verify the authenticated session from cookie ───────────────────────
    // We NEVER trust the state parameter for the userId — we get it from
    // the verified Supabase session cookie instead (prevents OAuth CSRF).
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${APP_URL}/login?redirect=/dashboard/settings`)
    }

    const userId = user.id

    // ── Exchange authorization code for tokens ────────────────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      return NextResponse.redirect(errorRedirect)
    }

    // ── Fetch the Gmail account email and historyId ───────────────────────
    const [profileRes, historyRes] = await Promise.all([
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
      fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
    ])

    const profile     = await profileRes.json()
    const gmailProfile = await historyRes.json()

    if (!profile.email) {
      return NextResponse.redirect(errorRedirect)
    }

    // ── Persist to mail_connections ───────────────────────────────────────
    const { error: dbError } = await supabaseAdmin
      .from('mail_connections')
      .upsert({
        user_id:          userId,
        provider:         'gmail',
        email:            profile.email,
        refresh_token:    tokens.refresh_token ?? null,
        access_token:     tokens.access_token,
        token_expires_at: new Date(Date.now() + (tokens.expires_in ?? 3599) * 1000).toISOString(),
        history_id:       gmailProfile.historyId?.toString() ?? null,
        is_active:        true,
        last_synced_at:   new Date().toISOString(),
      }, { onConflict: 'user_id,provider,email' })

    if (dbError) {
      return NextResponse.redirect(errorRedirect)
    }

    return NextResponse.redirect(`${APP_URL}/dashboard/settings?tab=integrations&success=gmail_connected`)

  } catch {
    return NextResponse.redirect(errorRedirect)
  }
}
