import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, provider, email } = await request.json()
    if (!userId || !provider || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Revoke Gmail token
    const { data: conn } = await supabase
      .from('mail_connections')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('email', email)
      .single()

    if (conn?.refresh_token) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${conn.refresh_token}`, { method: 'POST' }).catch(() => {})
    }

    // Mark as inactive
    await supabase.from('mail_connections')
      .update({ is_active: false, access_token: null, refresh_token: null })
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('email', email)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
