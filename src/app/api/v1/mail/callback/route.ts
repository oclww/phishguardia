import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/mail/callback`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !userId) {
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=oauth_denied`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('No access token received')

    // Fetch user email
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()

    // Fetch Gmail history ID (starting point for incremental sync)
    const historyRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const gmailProfile = await historyRes.json()

    // Upsert into mail_connections
    const { error: dbError } = await supabase
      .from('mail_connections')
      .upsert({
        user_id: userId,
        provider: 'gmail',
        email: profile.email,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        history_id: gmailProfile.historyId?.toString(),
        is_active: true,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider,email' })

    if (dbError) throw new Error(dbError.message)

    return NextResponse.redirect(`${APP_URL}/dashboard/settings?tab=integrations&success=gmail_connected`)
  } catch (err: any) {
    console.error('Gmail OAuth callback error:', err)
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=connection_failed`)
  }
}
