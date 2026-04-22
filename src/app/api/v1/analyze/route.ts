import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the admin client to bypass RLS in the API route, 
// because the API route acts as a trusted server processing inbound requests.
// Ensure you add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your env.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Verify the API Key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, status, permissions')
      .eq('key', token)
      .single()

    if (keyError || !keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 403 })
    }

    // Parse the payload
    const payload = await request.json()
    const { from, subject, body } = payload

    // ---- IA PROCESSING SIMULATION (Waiting for real code) ----
    // For now, we just simulate a random score
    const aiScore = Math.floor(Math.random() * 100)
    let threatType = 'phishing'
    let status = 'safe'
    let severity = 'low'

    if (aiScore > 75) {
      status = 'blocked'
      severity = 'critical'
      threatType = Math.random() > 0.5 ? 'malware' : 'spear-phishing'
    } else if (aiScore > 50) {
      status = 'quarantined'
      severity = 'medium'
      threatType = 'phishing'
    }

    // Insert into emails table
    const { data: emailData, error: emailError } = await supabase
      .from('emails')
      .insert([{
        user_id: keyData.user_id,
        from_email: from || 'unknown',
        subject: subject || '(No Subject)',
        status: status === 'safe' ? 'safe' : 'malicious',
        ai_score: aiScore,
        threat_type: status !== 'safe' ? threatType : null
      }])
      .select()
      .single()

    if (emailError) throw new Error(emailError.message)

    // If it's a threat, insert into threats table
    if (status !== 'safe') {
      await supabase
        .from('threats')
        .insert([{
          user_id: keyData.user_id,
          email_id: emailData.id,
          type: threatType,
          severity: severity,
          sender_email: from || 'unknown',
          subject: subject || '(No Subject)',
          status: status,
          ai_score: aiScore,
        }])
    }
    
    // Update api key last used
    await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('key', token)

    return NextResponse.json({
      success: true,
      message: 'Email analyzed successfully',
      ai_score: aiScore,
      threat_type: status !== 'safe' ? threatType : 'none',
      status,
      email_id: emailData.id
    })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
