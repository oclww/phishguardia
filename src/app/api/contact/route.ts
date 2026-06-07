import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { name, email, company, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Save to Supabase (table contact_messages)
    const { error } = await supabase.from('contact_messages').insert([{
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      subject: subject?.trim() || 'Contact depuis le site',
      message: message.trim(),
      created_at: new Date().toISOString(),
      read: false,
    }])

    // If table doesn't exist yet, still return success (message won't be lost if Supabase is set up)
    if (error && !error.message.includes('does not exist')) {
      console.error('[contact] Supabase error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
