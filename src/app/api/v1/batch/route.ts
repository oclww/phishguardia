import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Re-use the same detection logic as /api/v1/analyze ──────────────────────
// (Same 8 signal analyzers — kept in sync manually until shared module)

function analyzeDomainSpoofing(from: string): { score: number; findings: string[] } {
  const raw = from.toLowerCase()
  const domain = raw.split('@')[1]?.split('>')[0]?.trim() || ''
  const findings: string[] = []
  let score = 0
  const typosquat: [RegExp, string][] = [
    [/micros[0o]ft|m[i1]crosoft/, 'Microsoft typosquat'],
    [/paypa[l1]|p[a4]ypal/, 'PayPal typosquat'],
    [/g[o0][o0]gle/, 'Google typosquat'],
    [/amaz[o0]n|arnazon/, 'Amazon typosquat'],
    [/app[l1]e/, 'Apple typosquat'],
    [/secure-|-secure|-login|-verify/, 'Security lure domain'],
    [/alert\.|warning\./, 'Alert domain pattern'],
    [/netfl[i1]x/, 'Netflix typosquat'],
  ]
  for (const [p, name] of typosquat) {
    if (p.test(raw) || p.test(domain)) { findings.push(name); score += 20; break }
  }
  if (domain.includes('xn--')) { findings.push('Punycode domain'); score += 15 }
  if ((domain.match(/\./g) || []).length > 4) { findings.push('Excessive subdomains'); score += 8 }
  if (['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.win','.loan','.click'].some(t => domain.endsWith(t))) { findings.push('High-risk TLD'); score += 8 }
  return { score: Math.min(score, 25), findings }
}

function analyzeDisplayNameSpoof(from: string): { score: number; findings: string[] } {
  const m = from.match(/^(.+?)\s*<(.+?)>$/)
  if (!m) return { score: 0, findings: [] }
  const name = m[1].trim().toLowerCase()
  const domain = m[2].toLowerCase().split('@')[1] || ''
  const brands = ['paypal','apple','google','microsoft','amazon','netflix','facebook','linkedin','bank','crédit','impots','caf','ameli']
  const free = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/
  const findings: string[] = []
  let score = 0
  if (brands.some(b => name.includes(b) && !domain.includes(b))) { findings.push('Brand name display spoof'); score += 20 }
  if (free.test(domain) && name.length > 5 && !free.test(name)) { findings.push('Corporate display via free email'); score += 12 }
  return { score: Math.min(score, 20), findings }
}

function analyzeUrgency(subject: string, body: string): { score: number; findings: string[] } {
  const c = `${subject} ${body}`.toLowerCase()
  const findings: string[] = []
  let score = 0
  const cats: [string[], string, number][] = [
    [['urgent','action requise','action required'], 'Urgency trigger words', 4],
    [['suspended','suspendu','compte bloqué','account blocked'], 'Account suspension threat', 6],
    [['24 hours','24 heures','expire','expires today'], 'Time pressure tactic', 5],
    [['last warning','dernier avertissement','final notice'], 'Final warning language', 6],
    [['compromised','compromis','unauthorized access'], 'Security compromise claim', 5],
    [['won','gagné','prize','récompense'], 'Prize/reward lure', 4],
  ]
  for (const [words, finding, pts] of cats) {
    if (words.some(w => c.includes(w))) { findings.push(finding); score += pts }
  }
  return { score: Math.min(score, 20), findings }
}

function analyzeSuspiciousLinks(body: string): { score: number; findings: string[] } {
  const urls = body.match(/https?:\/\/[^\s"'<>)]+/gi) || []
  const findings: string[] = []
  let score = 0
  for (const url of urls.slice(0, 10)) {
    try {
      const u = new URL(url)
      const h = u.hostname.toLowerCase()
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) { findings.push(`IP URL: ${h}`); score += 18 }
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/.test(h)) { findings.push('URL shortener'); score += 12 }
      if (/login|verify|confirm|secure|password/.test(u.pathname)) { findings.push('Credential harvesting path'); score += 7 }
      if (u.port && !['80','443'].includes(u.port)) { findings.push(`Non-standard port: ${u.port}`); score += 8 }
    } catch { }
  }
  return { score: Math.min(score, 20), findings }
}

function analyzeSubjectPatterns(subject: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0
  const patterns: [RegExp, string, number][] = [
    [/account.*(suspended|blocked|disabled)/i, 'Account suspension subject', 8],
    [/confirm.*(identity|account)/i, 'Identity confirmation', 6],
    [/\$[\d,]+|\€[\d,]+/i, 'Money amount in subject', 6],
    [/you have won|vous avez gagné/i, 'Prize claim', 10],
    [/click (here|now)/i, 'Explicit click instruction', 5],
  ]
  for (const [re, f, p] of patterns) if (re.test(subject)) { findings.push(f); score += p }
  return { score: Math.min(score, 15), findings }
}

function analyzeBEC(from: string, subject: string, body: string): { score: number; findings: string[] } {
  const c = `${subject} ${body}`.toLowerCase()
  const findings: string[] = []
  let score = 0
  const free = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/
  if (/ceo|cfo|cto|directeur|président/i.test(subject) && free.test(from)) { findings.push('Executive title via free email'); score += 15 }
  if (/wire.transfer|virement|bank.transfer|send.money|iban|swift/i.test(c)) { findings.push('Wire transfer request'); score += 12 }
  if (/gift.card|bitcoin|crypto/i.test(c)) { findings.push('Gift card/crypto request'); score += 12 }
  if (/confidential|keep.this.between/i.test(c)) { findings.push('Secrecy request'); score += 8 }
  return { score: Math.min(score, 15), findings }
}

function analyzeContentPatterns(body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0
  const patterns: [RegExp, string, number][] = [
    [/enter.*(password|username|credentials)/i, 'Password entry request', 10],
    [/update.*(payment|billing|credit.card)/i, 'Payment update request', 8],
    [/social.security|ssn/i, 'SSN request', 12],
    [/dear (customer|client|user|member)/i, 'Generic impersonal greeting', 3],
  ]
  for (const [re, f, p] of patterns) if (re.test(body)) { findings.push(f); score += p }
  return { score: Math.min(score, 15), findings }
}

function analyzeStructural(body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0
  if (!body || body.trim().length < 10) { findings.push('Empty/minimal body'); score += 5 }
  if (body && body.trim().length < 150 && /https?:\/\//i.test(body)) { findings.push('Short body with URL only'); score += 6 }
  if (/[A-Za-z0-9+/]{100,}={0,2}/.test(body)) { findings.push('Base64-encoded content'); score += 8 }
  return { score: Math.min(score, 10), findings }
}

async function enrichWithGemini(from: string, subject: string, body: string, hScore: number, findings: string[]): Promise<{ score: number; explanation: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  try {
    const prompt = `You are a cybersecurity expert. Analyze this email.
Heuristic pre-analysis found: ${findings.join(', ')} (score: ${hScore}/100).
From: ${from}
Subject: ${subject}
Body: ${body?.slice(0, 600) || '(empty)'}
Return ONLY valid JSON: {"score": <0-100>, "explanation": "<one sentence in French>"}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.05, maxOutputTokens: 100 },
        }),
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (typeof parsed.score === 'number') {
        return { score: Math.min(100, Math.max(0, parsed.score)), explanation: parsed.explanation || '' }
      }
    }
  } catch { }
  return null
}

function analyzeEmail(from: string, subject: string, body: string) {
  const d = analyzeDomainSpoofing(from)
  const dn = analyzeDisplayNameSpoof(from)
  const u = analyzeUrgency(subject, body)
  const l = analyzeSuspiciousLinks(body)
  const s = analyzeSubjectPatterns(subject)
  const b = analyzeBEC(from, subject, body)
  const c = analyzeContentPatterns(body)
  const st = analyzeStructural(body)

  const hScore = Math.min(d.score + dn.score + u.score + l.score + s.score + b.score + c.score + st.score, 100)
  const allFindings = [...d.findings, ...dn.findings, ...u.findings, ...l.findings, ...s.findings, ...b.findings, ...c.findings, ...st.findings]

  return { hScore, allFindings, signals: { domain_spoofing: d.score, display_name_spoof: dn.score, urgency_manipulation: u.score, suspicious_links: l.score, subject_patterns: s.score, bec_indicators: b.score, content_patterns: c.score, structural_anomalies: st.score } }
}

function classify(score: number, signals: ReturnType<typeof analyzeEmail>['signals']) {
  if (signals.bec_indicators >= 12) return { status: 'blocked', severity: 'critical', threatType: 'bec' }
  if (signals.display_name_spoof >= 15 && score >= 50) return { status: 'blocked', severity: 'critical', threatType: 'spear-phishing' }
  if (score >= 75) return { status: 'blocked', severity: 'critical', threatType: signals.domain_spoofing >= 15 ? 'spear-phishing' : 'phishing' }
  if (score >= 50) return { status: 'quarantined', severity: score >= 65 ? 'high' : 'medium', threatType: 'phishing' }
  if (score >= 25) return { status: 'quarantined', severity: 'low', threatType: 'spam' }
  return { status: 'safe', severity: 'low', threatType: 'none' }
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // ── Auth ──
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, status')
      .eq('key', token)
      .single()

    if (keyError || !keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 403 })
    }

    // ── Parse payload ──
    const payload = await request.json()
    const emails: { from?: string; subject?: string; body?: string }[] = payload.emails

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'emails must be a non-empty array' }, { status: 400 })
    }
    if (emails.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 emails per batch request' }, { status: 400 })
    }

    // ── Process all emails in parallel ──
    const results = await Promise.all(
      emails.map(async (email, idx) => {
        const from = email.from || 'unknown'
        const subject = email.subject || '(No Subject)'
        const body = email.body || ''

        const { hScore, allFindings, signals } = analyzeEmail(from, subject, body)

        // Gemini enrichment (best effort — share quota across batch)
        let finalScore = hScore
        let explanation = ''
        let engine = 'heuristic-v2'

        const gemini = await enrichWithGemini(from, subject, body, hScore, allFindings)
        if (gemini) {
          finalScore = Math.round(hScore * 0.55 + gemini.score * 0.45)
          explanation = gemini.explanation
          engine = 'gemini-2.0-flash+heuristic-v2'
        }

        finalScore = Math.min(100, Math.max(0, finalScore))
        const { status, severity, threatType } = classify(finalScore, signals)

        // Persist email
        let emailId: string | null = null
        const { data: emailData } = await supabase.from('emails').insert([{
          user_id: keyData.user_id,
          from_email: from,
          subject,
          status: status === 'safe' ? 'safe' : 'malicious',
          ai_score: finalScore,
          threat_type: status !== 'safe' ? threatType : null,
        }]).select('id').single()

        if (emailData) {
          emailId = emailData.id
          // Persist threat if detected
          if (status !== 'safe') {
            await supabase.from('threats').insert([{
              user_id: keyData.user_id,
              email_id: emailData.id,
              type: threatType,
              severity,
              sender_email: from,
              subject,
              status,
              ai_score: finalScore,
            }])
          }
        }

        return {
          index: idx,
          ai_score: finalScore,
          status,
          severity,
          threat_type: threatType,
          engine,
          explanation: explanation || (status === 'safe' ? 'Email sûr.' : `${allFindings[0] || threatType}`),
          findings: allFindings,
          email_id: emailId,
        }
      })
    )

    // ── Update API key last used ──
    await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('key', token)

    const threatsFound = results.filter(r => r.status !== 'safe').length

    return NextResponse.json({
      success: true,
      processed: emails.length,
      threats_found: threatsFound,
      results,
    })

  } catch (error: any) {
    console.error('[batch] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
