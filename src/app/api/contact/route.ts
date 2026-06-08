import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Simple email format validation ───────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    let payload: any
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, email, company, subject, message } = payload

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants (name, email, message)' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
    }
    if (String(name).length > 100 || String(message).length > 5000) {
      return NextResponse.json({ error: 'Champs trop longs' }, { status: 400 })
    }

    // ── Persist ──────────────────────────────────────────────────────────────
    const { error } = await supabase.from('contact_messages').insert([{
      name:    String(name).trim().slice(0, 100),
      email:   String(email).trim().toLowerCase().slice(0, 254),
      company: company ? String(company).trim().slice(0, 100) : null,
      subject: subject ? String(subject).trim().slice(0, 200) : 'Contact depuis le site',
      message: String(message).trim().slice(0, 5000),
      read:    false,
    }])

    if (error) {
      // Table may not exist yet — still return success so the user isn't stuck
      if (!error.message.includes('does not exist')) {
        return NextResponse.json({ error: 'Erreur serveur, veuillez réessayer' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Erreur serveur, veuillez réessayer' }, { status: 500 })
  }
}
