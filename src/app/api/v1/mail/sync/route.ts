import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Refresh access token ─────────────────────────────────────────────────────
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to refresh token')

  return data.access_token
}

// ─── Get new emails since last historyId ─────────────────────────────────────
async function getNewEmails(accessToken: string, historyId: string): Promise<any[]> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${historyId}&historyTypes=messageAdded&labelId=INBOX`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  const data = await res.json()

  if (!data.history) return []

  const messageIds: string[] = []
  for (const record of data.history) {
    for (const msg of record.messagesAdded || []) {
      messageIds.push(msg.message.id)
    }
  }
  return messageIds
}

// ─── Fetch full email content ─────────────────────────────────────────────────
async function fetchEmailContent(accessToken: string, messageId: string) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const msg = await res.json()

  const headers = msg.payload?.headers || []
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  const from = getHeader('From')
  const subject = getHeader('Subject')

  // Extract body text
  let body = ''
  const extractBody = (part: any): string => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return Buffer.from(part.body.data, 'base64').toString('utf-8')
    }
    if (part.parts) {
      for (const p of part.parts) {
        const text = extractBody(p)
        if (text) return text
      }
    }
    return ''
  }

  if (msg.payload) {
    body = extractBody(msg.payload).slice(0, 2000)
  }

  return { from, subject, body, gmailMessageId: messageId }
}

// ─── Analyze signals ──────────────────────────────────────────────────────────
function analyzeDomainSpoofing(from: string): number {
  const domain = from.split('@')[1]?.toLowerCase() || ''
  const spoofPatterns = [/micros0ft|m1crosoft/i, /paypa1|p4ypal/i, /g00gle|go0gle/i, /amaz0n|amaz-on/i, /-secure\.|\.secure-/i, /alert\.|warning\./i]
  let score = 0
  if (spoofPatterns.some(p => p.test(domain) || p.test(from))) score += 25
  if ((domain.match(/\./g) || []).length > 3) score += 10
  if (/\d{3,}/.test(domain)) score += 8
  return Math.min(score, 30)
}

function analyzeUrgency(subject: string, body: string): number {
  const words = ['urgent', 'immédiat', 'action requise', 'suspended', 'compte bloqué', 'account suspended', 'expiring', 'last warning', '24 hours', '24 heures', 'compromised', 'verify your account']
  const combined = `${subject} ${body}`.toLowerCase()
  return Math.min(words.filter(w => combined.includes(w)).length * 4, 20)
}

function analyzeSubjectPatterns(subject: string): number {
  const patterns = [/\$\d+|\€\d+/i, /password|mot de passe/i, /!!+|urgent!/i, /you have won|vous avez gagné/i, /confirm your account/i, /account.*suspended/i]
  return Math.min(patterns.filter(p => p.test(subject)).length * 5, 15)
}

function analyzeSenderAnomaly(from: string, subject: string): number {
  let score = 0
  if (/ceo|cfo|cto|directeur/i.test(subject) && /gmail|yahoo|hotmail/i.test(from)) score += 15
  return Math.min(score, 15)
}

function computeScore(from: string, subject: string, body: string) {
  const signals = {
    domainSpoofing: analyzeDomainSpoofing(from),
    urgencyKeywords: analyzeUrgency(subject, body),
    subjectPatterns: analyzeSubjectPatterns(subject),
    senderAnomaly: analyzeSenderAnomaly(from, subject),
  }
  const raw = Object.values(signals).reduce((a, b) => a + b, 0)
  const score = Math.max(0, Math.min(100, Math.round((raw / 80) * 100) + Math.floor(Math.random() * 5) - 2))

  let status = 'safe', severity = 'low', threatType = 'none'
  if (score >= 75) { status = 'blocked'; severity = 'critical'; threatType = signals.domainSpoofing > 15 ? 'spear-phishing' : 'phishing' }
  else if (score >= 45) { status = 'quarantined'; severity = score >= 60 ? 'high' : 'medium'; threatType = 'phishing' }
  else if (signals.senderAnomaly >= 12) { status = 'quarantined'; severity = 'high'; threatType = 'bec' }

  return { score, status, severity, threatType, signals }
}

// ─── Optional Gemini enrichment ───────────────────────────────────────────────
async function enrichWithGemini(from: string, subject: string, body: string): Promise<number | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a phishing detection expert. Analyze this email and return ONLY {"score": <0-100>}.\nFrom: ${from}\nSubject: ${subject}\nBody: ${body?.slice(0, 500)}` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 32 }
        }),
        signal: AbortSignal.timeout(4000)
      }
    )
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = text.match(/"score"\s*:\s*(\d+)/)
    if (match) return Math.min(100, parseInt(match[1]))
  } catch { }
  return null
}

// ─── Main sync handler ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Security: only allow internal calls (cron or manual)
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET || 'phishguard-cron-2026'
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: any[] = []

  try {
    // Fetch all active mail connections
    const { data: connections, error } = await supabase
      .from('mail_connections')
      .select('*')
      .eq('is_active', true)

    if (error) throw error
    if (!connections || connections.length === 0) {
      return NextResponse.json({ message: 'No active connections', processed: 0 })
    }

    for (const conn of connections) {
      try {
        // Refresh access token if needed
        let accessToken = conn.access_token
        const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at) : new Date(0)
        if (expiresAt <= new Date(Date.now() + 60000)) {
          accessToken = await refreshAccessToken(conn.refresh_token)
          await supabase.from('mail_connections').update({
            access_token: accessToken,
            token_expires_at: new Date(Date.now() + 3500 * 1000).toISOString(),
          }).eq('id', conn.id)
        }

        if (!conn.history_id) {
          // First sync: just get the current historyId as baseline
          const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const profile = await profileRes.json()
          await supabase.from('mail_connections').update({
            history_id: profile.historyId?.toString(),
            last_synced_at: new Date().toISOString(),
          }).eq('id', conn.id)
          results.push({ email: conn.email, status: 'initialized', newEmails: 0 })
          continue
        }

        // Get new message IDs since last historyId
        const messageIds = await getNewEmails(accessToken, conn.history_id)

        let newHistoryId = conn.history_id
        let threatsFound = 0

        for (const msgId of messageIds.slice(0, 20)) { // Max 20 per cycle
          try {
            const { from, subject, body, gmailMessageId } = await fetchEmailContent(accessToken, msgId)

            // Analyze
            let { score, status, severity, threatType } = computeScore(from, subject, body)

            // Gemini enrichment
            const geminiScore = await enrichWithGemini(from, subject, body)
            if (geminiScore !== null) score = Math.round(score * 0.6 + geminiScore * 0.4)

            // Persist email
            const { data: emailData } = await supabase.from('emails').insert([{
              user_id: conn.user_id,
              from_email: from || 'unknown',
              subject: subject || '(No Subject)',
              status: status === 'safe' ? 'safe' : 'malicious',
              ai_score: score,
              threat_type: status !== 'safe' ? threatType : null,
            }]).select().single()

            // Persist threat if needed
            if (status !== 'safe' && emailData) {
              await supabase.from('threats').insert([{
                user_id: conn.user_id,
                email_id: emailData.id,
                type: threatType,
                severity,
                sender_email: from || 'unknown',
                subject: subject || '(No Subject)',
                status,
                ai_score: score,
              }])
              threatsFound++
            }
          } catch (emailErr) {
            console.error(`Error processing message ${msgId}:`, emailErr)
          }
        }

        // Update historyId to current
        const newProfileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const newProfile = await newProfileRes.json()
        if (newProfile.historyId) newHistoryId = newProfile.historyId.toString()

        await supabase.from('mail_connections').update({
          history_id: newHistoryId,
          last_synced_at: new Date().toISOString(),
        }).eq('id', conn.id)

        results.push({ email: conn.email, newEmails: messageIds.length, threatsFound })
      } catch (connErr: any) {
        console.error(`Error syncing ${conn.email}:`, connErr)
        results.push({ email: conn.email, error: connErr.message })
      }
    }

    return NextResponse.json({ success: true, processed: connections.length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
