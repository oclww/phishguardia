import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Input limits ──────────────────────────────────────────────────────────────
const MAX_FROM_LENGTH    = 320   // max email address length (RFC 5321)
const MAX_SUBJECT_LENGTH = 998   // max subject line (RFC 2822)
const MAX_BODY_LENGTH    = 50000 // 50KB body max

// ─── Heuristic Analysis Engine v2 ─────────────────────────────────────────────

interface AnalysisSignals {
  domainSpoofing:      number
  displayNameSpoof:    number
  urgencyManipulation: number
  suspiciousLinks:     number
  subjectPatterns:     number
  becIndicators:       number
  contentPatterns:     number
  structuralAnomalies: number
}

function analyzeDomainSpoofing(from: string): { score: number; findings: string[] } {
  const raw = from.toLowerCase()
  const domain = raw.split('@')[1]?.split('>')[0]?.trim() || ''
  const findings: string[] = []
  let score = 0

  const typosquatPatterns: [RegExp, string][] = [
    [/micros[0o]ft|m[i1]crosoft|m1cros0ft/,          'Microsoft typosquat'],
    [/paypa[l1]|p[a4]ypal|pay-pal/,                  'PayPal typosquat'],
    [/g[o0][o0]gle|g00gle|goog1e/,                   'Google typosquat'],
    [/amaz[o0]n|arnazon|amaz-on|amazom/,             'Amazon typosquat'],
    [/app[l1]e|app-le|appl3/,                        'Apple typosquat'],
    [/faceb[o0][o0]k|facebok|faceboook/,             'Facebook typosquat'],
    [/netfl[i1]x|netf1ix/,                           'Netflix typosquat'],
    [/[l1]inkedin|linkedln/,                         'LinkedIn typosquat'],
    [/bankofamerica|b[a4]nkofamer/,                  'Bank typosquat'],
    [/secure-|security-|-secure|-login|-verify/,      'Security lure subdomain'],
    [/alert\.|warning\.|notice\./,                    'Alert domain pattern'],
    [/support-|helpdesk-|noreply-/,                   'Support lure domain'],
  ]

  for (const [pattern, name] of typosquatPatterns) {
    if (pattern.test(raw) || pattern.test(domain)) {
      findings.push(name); score += 20; break
    }
  }

  if (domain.includes('xn--')) { findings.push('Punycode / IDN domain'); score += 15 }

  const parts = domain.split('.')
  if (parts.length > 4) { findings.push('Excessive subdomain nesting'); score += 8 }
  if (/\d{4,}/.test(domain)) { findings.push('Numeric domain (suspicious)'); score += 5 }
  if (domain.includes('-') && parts.length > 2 && /(paypal|apple|google|amazon|microsoft|bank|secure|login|verify)/.test(domain)) {
    findings.push('Brand name in hyphenated domain'); score += 10
  }

  const suspiciousTLDs = ['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.win','.loan','.click','.online','.site']
  if (suspiciousTLDs.some(t => domain.endsWith(t))) { findings.push('High-risk TLD'); score += 8 }

  return { score: Math.min(score, 25), findings }
}

function analyzeDisplayNameSpoof(from: string): { score: number; findings: string[] } {
  const m = from.match(/^(.+?)\s*<(.+?)>$/)
  if (!m) return { score: 0, findings: [] }
  const name   = m[1].trim().toLowerCase()
  const domain = m[2].toLowerCase().split('@')[1] || ''
  const brands = ['paypal','apple','google','microsoft','amazon','netflix','facebook','linkedin','bank','crédit','impots','caf','ameli']
  const freeProviders = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/
  const findings: string[] = []
  let score = 0
  if (brands.some(b => name.includes(b) && !domain.includes(b))) { findings.push('Brand name display spoof'); score += 20 }
  if (freeProviders.test(domain) && name.length > 5 && !freeProviders.test(name)) { findings.push('Corporate display via free email'); score += 12 }
  return { score: Math.min(score, 20), findings }
}

function analyzeUrgency(subject: string, body: string): { score: number; findings: string[] } {
  const content = `${subject} ${body}`.toLowerCase()
  const findings: string[] = []
  let score = 0
  const categories: [string[], string, number][] = [
    [['urgent','action requise','action required'], 'Urgency trigger words', 4],
    [['suspended','suspendu','compte bloqué','account blocked'], 'Account suspension threat', 6],
    [['24 hours','24 heures','expire','expires today'], 'Time pressure tactic', 5],
    [['last warning','dernier avertissement','final notice'], 'Final warning language', 6],
    [['compromised','compromis','unauthorized access'], 'Security compromise claim', 5],
    [['won','gagné','prize','récompense'], 'Prize/reward lure', 4],
  ]
  for (const [words, finding, pts] of categories) {
    if (words.some(w => content.includes(w))) { findings.push(finding); score += pts }
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
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|tiny\.cc/.test(h)) { findings.push('URL shortener'); score += 12 }
      if (/login|verify|confirm|secure|password|signin/.test(u.pathname)) { findings.push('Credential harvesting path'); score += 7 }
      if (u.port && !['80','443'].includes(u.port)) { findings.push(`Non-standard port: ${u.port}`); score += 8 }
    } catch { /* invalid URL — skip */ }
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
  const content = `${subject} ${body}`.toLowerCase()
  const findings: string[] = []
  let score = 0
  const freeProviders = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/
  if (/ceo|cfo|cto|directeur|président/i.test(subject) && freeProviders.test(from)) { findings.push('Executive title via free email'); score += 15 }
  if (/wire.transfer|virement|bank.transfer|send.money|iban|swift/i.test(content)) { findings.push('Wire transfer request'); score += 12 }
  if (/gift.card|bitcoin|crypto/i.test(content)) { findings.push('Gift card/crypto request'); score += 12 }
  if (/confidential|keep.this.between/i.test(content)) { findings.push('Secrecy request'); score += 8 }
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

function analyzeStructuralAnomalies(from: string, subject: string, body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0
  if (!body || body.trim().length < 10) { findings.push('Empty/minimal body'); score += 5 }
  if (body && body.trim().length < 150 && /https?:\/\//i.test(body)) { findings.push('Short body with URL only'); score += 6 }
  if (/[A-Za-z0-9+/]{100,}={0,2}/.test(body)) { findings.push('Base64-encoded content'); score += 8 }
  return { score: Math.min(score, 10), findings }
}

function computeHeuristicScore(s: AnalysisSignals): number {
  const raw = s.domainSpoofing + s.displayNameSpoof + s.urgencyManipulation +
    s.suspiciousLinks + s.subjectPatterns + s.becIndicators + s.contentPatterns + s.structuralAnomalies
  return Math.min(raw, 100)
}

function classifyThreat(score: number, signals: AnalysisSignals): { status: string; severity: string; threatType: string } {
  if (signals.becIndicators >= 12) return { status: 'blocked', severity: 'critical', threatType: 'bec' }
  if (signals.displayNameSpoof >= 15 && score >= 50) return { status: 'blocked', severity: 'critical', threatType: 'spear-phishing' }
  if (score >= 75) return { status: 'blocked', severity: 'critical', threatType: signals.domainSpoofing >= 15 ? 'spear-phishing' : 'phishing' }
  if (score >= 50) return { status: 'quarantined', severity: score >= 65 ? 'high' : 'medium', threatType: 'phishing' }
  if (score >= 25) return { status: 'quarantined', severity: 'low', threatType: 'spam' }
  return { status: 'safe', severity: 'low', threatType: 'none' }
}

async function enrichWithGemini(
  from: string, subject: string, body: string, heuristicScore: number, heuristicFindings: string[]
): Promise<{ score: number; explanation: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const prompt = `You are an expert cybersecurity analyst specialized in email phishing detection.

Analyze the following email and return a JSON object with:
- "score": integer 0-100 (0 = definitely safe, 100 = definitely phishing/malicious)
- "explanation": one sentence in French explaining the main threat (if score > 30), or "Email légitime" (if safe)

The heuristic engine already flagged these signals: ${heuristicFindings.length > 0 ? heuristicFindings.join(', ') : 'none'} (heuristic score: ${heuristicScore}/100).

EMAIL TO ANALYZE:
From: ${from}
Subject: ${subject}
Body (first 800 chars): ${body?.slice(0, 800) || '(empty)'}

Respond ONLY with valid JSON on a single line: {"score": <number>, "explanation": "<string>"}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.05, maxOutputTokens: 128 },
        }),
        signal: AbortSignal.timeout(6000),
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
  } catch { /* Gemini unavailable — fallback to heuristics */ }
  return null
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401, headers: corsHeaders })
    }

    const token = authHeader.split(' ')[1]

    // Validate key format (prevent trivially invalid keys from hitting DB)
    if (!token || token.length < 10 || token.length > 256) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 401, headers: corsHeaders })
    }

    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, status')
      .eq('key', token)
      .single()

    if (keyError || !keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 403, headers: corsHeaders })
    }

    // ── Parse & validate payload ──────────────────────────────────────────────
    let payload: any
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })
    }

    // Trim and enforce size limits
    const from    = String(payload.from    || 'unknown').slice(0, MAX_FROM_LENGTH).trim()
    const subject = String(payload.subject || '(No Subject)').slice(0, MAX_SUBJECT_LENGTH).trim()
    const body    = String(payload.body    || '').slice(0, MAX_BODY_LENGTH).trim()

    if (!payload.from) {
      return NextResponse.json({ error: 'Missing required field: from' }, { status: 400, headers: corsHeaders })
    }

    // ── Run heuristic analysis ─────────────────────────────────────────────────
    const domainResult     = analyzeDomainSpoofing(from)
    const displayResult    = analyzeDisplayNameSpoof(from)
    const urgencyResult    = analyzeUrgency(subject, body)
    const linksResult      = analyzeSuspiciousLinks(body)
    const subjectResult    = analyzeSubjectPatterns(subject)
    const becResult        = analyzeBEC(from, subject, body)
    const contentResult    = analyzeContentPatterns(body)
    const structuralResult = analyzeStructuralAnomalies(from, subject, body)

    const signals: AnalysisSignals = {
      domainSpoofing:      domainResult.score,
      displayNameSpoof:    displayResult.score,
      urgencyManipulation: urgencyResult.score,
      suspiciousLinks:     linksResult.score,
      subjectPatterns:     subjectResult.score,
      becIndicators:       becResult.score,
      contentPatterns:     contentResult.score,
      structuralAnomalies: structuralResult.score,
    }

    const allFindings = [
      ...domainResult.findings,   ...displayResult.findings,
      ...urgencyResult.findings,  ...linksResult.findings,
      ...subjectResult.findings,  ...becResult.findings,
      ...contentResult.findings,  ...structuralResult.findings,
    ]

    const heuristicScore = computeHeuristicScore(signals)

    // ── Gemini enrichment ─────────────────────────────────────────────────────
    let finalScore = heuristicScore
    let explanation = ''
    let engine = 'heuristic-v2'

    const geminiResult = await enrichWithGemini(from, subject, body, heuristicScore, allFindings)
    if (geminiResult !== null) {
      finalScore  = Math.round(heuristicScore * 0.55 + geminiResult.score * 0.45)
      explanation = geminiResult.explanation
      engine      = 'gemini-2.0-flash+heuristic-v2'
    }

    finalScore = Math.min(100, Math.max(0, finalScore))
    const { status, severity, threatType } = classifyThreat(finalScore, signals)

    // ── Persist email record ──────────────────────────────────────────────────
    const { data: emailData, error: emailError } = await supabase
      .from('emails')
      .insert([{
        user_id:     keyData.user_id,
        from_email:  from,
        subject,
        status:      status === 'safe' ? 'safe' : 'malicious',
        ai_score:    finalScore,
        threat_type: status !== 'safe' ? threatType : null,
      }])
      .select('id')
      .single()

    if (emailError) {
      // DB insert failure — still return analysis result (don't block the client)
      return NextResponse.json({
        success:     true,
        ai_score:    finalScore,
        status,
        severity,
        threat_type: status !== 'safe' ? threatType : 'none',
        engine,
        explanation: explanation || (status === 'safe' ? 'Email considéré comme sûr.' : `Menace détectée : ${allFindings[0] || threatType}.`),
        signals: {
          domain_spoofing:      signals.domainSpoofing,
          display_name_spoof:   signals.displayNameSpoof,
          urgency_manipulation: signals.urgencyManipulation,
          suspicious_links:     signals.suspiciousLinks,
          subject_patterns:     signals.subjectPatterns,
          bec_indicators:       signals.becIndicators,
          content_patterns:     signals.contentPatterns,
          structural_anomalies: signals.structuralAnomalies,
        },
        findings: allFindings,
      }, { headers: corsHeaders })
    }

    // ── Persist threat record ─────────────────────────────────────────────────
    if (status !== 'safe' && emailData) {
      await supabase.from('threats').insert([{
        user_id:     keyData.user_id,
        email_id:    emailData.id,
        type:        threatType,
        severity,
        sender_email: from,
        subject,
        status,
        ai_score:    finalScore,
      }])
    }

    // ── Update API key last_used ──────────────────────────────────────────────
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('key', token)

    return NextResponse.json({
      success:     true,
      ai_score:    finalScore,
      status,
      severity,
      threat_type: status !== 'safe' ? threatType : 'none',
      engine,
      explanation: explanation || (status === 'safe' ? 'Email considéré comme sûr.' : `Menace détectée : ${allFindings[0] || threatType}.`),
      signals: {
        domain_spoofing:      signals.domainSpoofing,
        display_name_spoof:   signals.displayNameSpoof,
        urgency_manipulation: signals.urgencyManipulation,
        suspicious_links:     signals.suspiciousLinks,
        subject_patterns:     signals.subjectPatterns,
        bec_indicators:       signals.becIndicators,
        content_patterns:     signals.contentPatterns,
        structural_anomalies: signals.structuralAnomalies,
      },
      findings:  allFindings,
      email_id:  emailData?.id ?? null,
    }, { headers: corsHeaders })

  } catch {
    // Never expose internal error details to external callers
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders })
  }
}
