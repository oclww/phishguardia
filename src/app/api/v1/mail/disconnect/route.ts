import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // ── Auth check — user must be logged in ───────────────────────────────
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: any
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { provider, email } = payload
    if (!provider || !email) {
      return NextResponse.json({ error: 'Missing fields: provider, email' }, { status: 400 })
    }

    // Always use the session userId — never trust userId from the request body
    const userId = user.id

    // ── Fetch and revoke the refresh token ────────────────────────────────
    const { data: conn } = await supabaseAdmin
      .from('mail_connections')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('email', email)
      .single()

    if (conn?.refresh_token) {
      // Best effort revoke — don't fail if this doesn't work
      fetch(`https://oauth2.googleapis.com/revoke?token=${conn.refresh_token}`, { method: 'POST' })
        .catch(() => {})
    }

    // ── Mark connection as inactive and clear tokens ──────────────────────
    await supabaseAdmin
      .from('mail_connections')
      .update({ is_active: false, access_token: null, refresh_token: null })
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('email', email)

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
