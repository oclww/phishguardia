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

// ─── Analyze signals — v2 engine (mirrors /api/v1/analyze) ───────────────────
function analyzeDomainSpoofing(from: string): number {
  const raw = from.toLowerCase()
  const domain = raw.split('@')[1]?.split('>')[0]?.trim() || ''
  let score = 0
  const typosquat = [/micros[0o]ft|m[i1]crosoft/, /paypa[l1]|p[a4]ypal/, /g[o0][o0]gle/, /amaz[o0]n|arnazon/, /app[l1]e/, /faceb[o0][o0]k/, /secure-|-secure|-login|-verify/, /alert\.|warning\./, /netfl[i1]x/]
  if (typosquat.some(p => p.test(raw) || p.test(domain))) score += 20
  if (domain.includes('xn--')) score += 15
  if ((domain.match(/\./g) || []).length > 4) score += 8
  if (/\d{4,}/.test(domain)) score += 5
  if (['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.win','.loan','.click'].some(t => domain.endsWith(t))) score += 8
  return Math.min(score, 25)
}

function analyzeDisplayNameSpoof(from: string): number {
  const m = from.match(/^(.+?)\s*<(.+?)>$/)
  if (!m) return 0
  const name = m[1].trim().toLowerCase()
  const emailDomain = m[2].toLowerCase().split('@')[1] || ''
  const brands = ['paypal','apple','google','microsoft','amazon','netflix','facebook','linkedin','bank','crédit','impots','caf','ameli']
  const freemail = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/
  let score = 0
  if (brands.some(b => name.includes(b) && !emailDomain.includes(b))) score += 20
  if (freemail.test(emailDomain) && name.length > 5 && !freemail.test(name)) score += 10
  return Math.min(score, 20)
}

function analyzeUrgency(subject: string, body: string): number {
  const c = `${subject} ${body}`.toLowerCase()
  const words = ['urgent','action requise','action required','suspended','suspendu','compte bloqué','account blocked','24 hours','24 heures','last warning','dernier avertissement','compromised','compromis','verify now','permanently deleted']
  return Math.min(words.filter(w => c.includes(w)).length * 4, 20)
}

function analyzeSuspiciousLinks(body: string): number {
  const urls = body.match(/https?:\/\/[^\s"'<>)]+/gi) || []
  let score = 0
  for (const url of urls.slice(0, 8)) {
    try {
      const u = new URL(url)
      const h = u.hostname.toLowerCase()
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) score += 18
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/.test(h)) score += 12
      if (/login|verify|confirm|secure|password|authenticate/i.test(u.pathname)) score += 7
      if (u.port && !['80','443'].includes(u.port)) score += 8
    } catch { }
  }
  return Math.min(score, 20)
}

function analyzeSubjectPatterns(subject: string): number {
  const p: [RegExp, number][] = [
    [/account.*(suspended|blocked|disabled)/i, 8],
    [/confirm.*(identity|account)/i, 6],
    [/\$[\d,]+|\€[\d,]+/i, 6],
    [/re:|fwd:|fw:/i, 4],
    [/you have won|vous avez gagné/i, 10],
    [/click (here|now)/i, 5],
    [/invoice|facture/i, 4],
  ]
  return Math.min(p.reduce((s, [re, pts]) => re.test(subject) ? s + pts : s, 0), 15)
}

function analyzeBEC(from: string, subject: string, body: string): number {
  const c = `${subject} ${body}`.toLowerCase()
  const freemail = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/
  let score = 0
  if (/ceo|cfo|cto|directeur|président/i.test(subject) && freemail.test(from)) score += 15
  if (/wire.transfer|virement|bank.transfer|send.money|iban|swift/i.test(c)) score += 12
  if (/gift.card|bitcoin|crypto|ethereum/i.test(c)) score += 12
  if (/confidential|keep.this.between|discreet/i.test(c)) score += 8
  return Math.min(score, 15)
}

function analyzeContentPatterns(body: string): number {
  const p: [RegExp, number][] = [
    [/enter.*(password|username|credentials)/i, 10],
    [/update.*(payment|billing|credit.card)/i, 8],
    [/social.security|ssn/i, 12],
    [/dear (customer|client|user|member)/i, 3],
    [/click.the.link.below|follow.this.link/i, 5],
  ]
  return Math.min(p.reduce((s, [re, pts]) => re.test(body) ? s + pts : s, 0), 15)
}

function computeScore(from: string, subject: string, body: string) {
  const domainSpoofing     = analyzeDomainSpoofing(from)
  const displayNameSpoof   = analyzeDisplayNameSpoof(from)
  const urgencyKeywords    = analyzeUrgency(subject, body)
  const suspiciousLinks    = analyzeSuspiciousLinks(body)
  const subjectPatterns    = analyzeSubjectPatterns(subject)
  const becIndicators      = analyzeBEC(from, subject, body)
  const contentPatterns    = analyzeContentPatterns(body)

  const score = Math.min(domainSpoofing + displayNameSpoof + urgencyKeywords + suspiciousLinks + subjectPatterns + becIndicators + contentPatterns, 100)

  let status = 'safe', severity = 'low', threatType = 'none'
  if (becIndicators >= 12)                  { status = 'blocked'; severity = 'critical'; threatType = 'bec' }
  else if (displayNameSpoof >= 15 && score >= 50) { status = 'blocked'; severity = 'critical'; threatType = 'spear-phishing' }
  else if (score >= 75)  { status = 'blocked'; severity = 'critical'; threatType = domainSpoofing >= 15 ? 'spear-phishing' : 'phishing' }
  else if (score >= 50)  { status = 'quarantined'; severity = score >= 65 ? 'high' : 'medium'; threatType = 'phishing' }
  else if (score >= 25)  { status = 'quarantined'; severity = 'low'; threatType = 'spam' }

  return { score, status, severity, threatType }
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
  // Security: only allow calls from authenticated cron or internal services
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }
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
          } catch {
            // Skip this message and continue
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
      } catch {
        results.push({ email: conn.email, error: 'sync_failed' })
      }
    }

    return NextResponse.json({ success: true, processed: connections.length, results })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
