import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ─────────────────────────────────────────────────────────────────────────────
// HEURISTIC ANALYSIS ENGINE v2 — PhishGuard.IA
// Signals are deterministic and explainable. No random jitter.
// ─────────────────────────────────────────────────────────────────────────────

interface AnalysisSignals {
  domainSpoofing:    number  // 0-25: typosquatting, homograph, punycode
  displayNameSpoof:  number  // 0-20: display name ≠ actual domain
  urgencyManipulation: number // 0-20: pressure tactics in text
  suspiciousLinks:   number  // 0-20: malicious URL patterns
  subjectPatterns:   number  // 0-15: phishing subject patterns
  becIndicators:     number  // 0-15: CEO fraud / BEC patterns
  contentPatterns:   number  // 0-15: credential harvesting patterns in body
  structuralAnomalies: number // 0-10: structural red flags
}

// ── 1. Domain Spoofing: typosquatting, homographs, lookalikes ────────────────
function analyzeDomainSpoofing(from: string): { score: number; findings: string[] } {
  const raw = from.toLowerCase()
  const domain = raw.split('@')[1]?.split('>')[0]?.trim() || ''
  const findings: string[] = []
  let score = 0

  // Known brand typosquatting
  const typosquatPatterns: [RegExp, string][] = [
    [/micros[0o]ft|m[i1]crosoft|m1cros0ft/,           'Microsoft typosquat'],
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
      findings.push(name)
      score += 20
      break
    }
  }

  // Punycode (internationalized domain name)
  if (domain.includes('xn--')) {
    findings.push('Punycode / IDN domain')
    score += 15
  }

  // Excessive subdomains (deep nesting = evasion)
  const parts = domain.split('.')
  if (parts.length > 4) {
    findings.push('Excessive subdomain nesting')
    score += 8
  }

  // Digits in domain (not a legit company TLD usually)
  if (/\d{4,}/.test(domain)) {
    findings.push('Numeric domain (suspicious)')
    score += 5
  }

  // Hyphens in combination with brand names
  if (domain.includes('-') && parts.length > 2 && /(paypal|apple|google|amazon|microsoft|bank|secure|login|verify)/.test(domain)) {
    findings.push('Brand name in hyphenated domain')
    score += 10
  }

  // Lookalike TLDs (.co instead of .com, unusual TLDs)
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.win', '.loan', '.click', '.link']
  if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
    findings.push('High-risk TLD')
    score += 8
  }

  return { score: Math.min(score, 25), findings }
}

// ── 2. Display Name Spoofing: "PayPal Support" <random@evil.com> ─────────────
function analyzeDisplayNameSpoof(from: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0

  // Extract display name and email address
  const displayMatch = from.match(/^(.+?)\s*<(.+?)>$/)
  if (!displayMatch) return { score, findings }

  const displayName = displayMatch[1].trim().toLowerCase().replace(/['"]/g, '')
  const emailAddr = displayMatch[2].toLowerCase()
  const emailDomain = emailAddr.split('@')[1] || ''

  // Known brand names in display name but different domain
  const brands = ['paypal', 'apple', 'google', 'microsoft', 'amazon', 'netflix', 'facebook',
                  'instagram', 'linkedin', 'twitter', 'bank', 'société générale', 'bnp', 'crédit',
                  'impots', 'caf', 'ameli', 'cpam', 'urssaf', 'sécurité sociale']

  for (const brand of brands) {
    if (displayName.includes(brand) && !emailDomain.includes(brand.split(' ')[0])) {
      findings.push(`Display name "${brand}" spoofed via ${emailDomain}`)
      score += 20
      break
    }
  }

  // Free email service impersonating a company
  const freeProviders = /gmail\.com|yahoo\.|hotmail\.|outlook\.com|proton\.me|gmx\.|icloud\.com/
  if (freeProviders.test(emailDomain) && displayName.length > 5 && !freeProviders.test(displayName)) {
    findings.push('Corporate display name via free email provider')
    score += 12
  }

  // Display name contains email-like content (obfuscation)
  if (/noreply|no-reply|donotreply/.test(displayName) && freeProviders.test(emailDomain)) {
    findings.push('Fake noreply via free provider')
    score += 10
  }

  return { score: Math.min(score, 20), findings }
}

// ── 3. Urgency & Manipulation ─────────────────────────────────────────────────
function analyzeUrgency(subject: string, body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  const combined = `${subject} ${body}`.toLowerCase()
  let score = 0

  const urgencyCategories: [string[], string, number][] = [
    [['urgent', 'urgente', 'urgent!', 'action required', 'action requise', 'immediate action'], 'Urgency trigger words', 4],
    [['suspended', 'suspendu', 'account blocked', 'compte bloqué', 'désactivé', 'disabled'], 'Account suspension threat', 6],
    [['24 hours', '24 heures', '48h', 'hours remaining', 'expire', 'expires today'], 'Time pressure tactic', 5],
    [['last warning', 'dernier avertissement', 'final notice', 'final warning'], 'Final warning language', 6],
    [['verify now', 'vérifiez maintenant', 'confirm immediately', 'click immediately'], 'Immediate action demand', 5],
    [['compromised', 'compromis', 'unauthorized access', 'accès non autorisé', 'unusual activity'], 'Security compromise claim', 5],
    [['your account will be', 'votre compte sera', 'permanently deleted', 'supprimé définitivement'], 'Permanent consequence threat', 7],
    [['won', 'gagné', 'winner', 'gagnant', 'prize', 'prix', 'reward', 'récompense'], 'Prize/reward lure', 4],
  ]

  for (const [words, finding, points] of urgencyCategories) {
    if (words.some(w => combined.includes(w))) {
      findings.push(finding)
      score += points
    }
  }

  // Excessive punctuation (!!!, ???, CAPS)
  if (/!{2,}|\?{2,}/.test(subject)) {
    findings.push('Excessive punctuation in subject')
    score += 3
  }

  if (subject === subject.toUpperCase() && subject.length > 5) {
    findings.push('All-caps subject line')
    score += 3
  }

  return { score: Math.min(score, 20), findings }
}

// ── 4. Suspicious Links ───────────────────────────────────────────────────────
function analyzeSuspiciousLinks(body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  const urlPattern = /https?:\/\/[^\s"'<>)\]]+/gi
  const urls = body.match(urlPattern) || []
  let score = 0

  for (const url of urls.slice(0, 10)) {
    try {
      const u = new URL(url)
      const hostname = u.hostname.toLowerCase()

      // IP address instead of domain
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        findings.push(`IP address URL: ${hostname}`)
        score += 18
        continue
      }

      // URL shorteners
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|rb\.gy|cutt\.ly|short\.io|tiny\.cc/.test(hostname)) {
        findings.push('URL shortener detected')
        score += 12
      }

      // Suspicious path keywords
      if (/login|signin|verify|confirm|secure|account|password|update|validate|authenticate/i.test(u.pathname)) {
        findings.push('Credential harvesting path')
        score += 7
      }

      // Non-standard port
      if (u.port && !['80', '443', '8080', '8443'].includes(u.port)) {
        findings.push(`Non-standard port: ${u.port}`)
        score += 8
      }

      // Long subdomain chain (evasion)
      if ((hostname.match(/\./g) || []).length > 3) {
        findings.push('Deeply nested subdomain URL')
        score += 5
      }

      // Suspicious TLDs in URL
      if (/\.(tk|ml|ga|cf|gq|xyz|top|win|loan|click)/.test(hostname)) {
        findings.push('High-risk TLD in URL')
        score += 8
      }

      // Data URI or base64
      if (url.startsWith('data:')) {
        findings.push('Data URI link (obfuscation)')
        score += 15
      }

    } catch { /* skip malformed URLs */ }
  }

  return { score: Math.min(score, 20), findings }
}

// ── 5. Subject Line Patterns ──────────────────────────────────────────────────
function analyzeSubjectPatterns(subject: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0

  const patterns: [RegExp, string, number][] = [
    [/your (account|password|email|access)/i,                   'Account ownership trigger', 6],
    [/account.*(suspended|blocked|disabled|locked)/i,           'Account suspension', 8],
    [/confirm.*(identity|account|payment|email)/i,              'Identity confirmation request', 6],
    [/invoice|facture|payment due|paiement/i,                   'Financial document lure', 5],
    [/\$[\d,]+|\€[\d,]+|[\d,]+\s*(dollars|euros|€|\$)/i,       'Money amount in subject', 6],
    [/re:|fwd:|fw:/i,                                           'Fake reply/forward header', 4],
    [/you have (won|been selected|a pending)/i,                 'Prize selection claim', 10],
    [/click (here|now|below|this link)/i,                       'Explicit click instruction', 5],
    [/[^\w\s]{3,}/,                                             'Excessive special characters', 3],
    [/delivery|colis|package|parcel|tracking/i,                 'Delivery/parcel lure', 3],
  ]

  for (const [re, finding, points] of patterns) {
    if (re.test(subject)) {
      findings.push(finding)
      score += points
    }
  }

  return { score: Math.min(score, 15), findings }
}

// ── 6. BEC (Business Email Compromise) Indicators ────────────────────────────
function analyzeBEC(from: string, subject: string, body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0
  const combined = `${subject} ${body}`.toLowerCase()
  const fromLower = from.toLowerCase()

  // Executive impersonation
  const execTitles = /\b(ceo|cfo|cto|coo|vp |vice.president|directeur|président|pdg|dg )\b/i
  const freemail = /gmail\.com|yahoo\.|hotmail\.|outlook\.com/

  if (execTitles.test(subject) && freemail.test(fromLower)) {
    findings.push('Executive title in subject via free email')
    score += 15
  }

  if (execTitles.test(from) && freemail.test(fromLower)) {
    findings.push('Executive role claimed by free email sender')
    score += 15
  }

  // Wire transfer / payment requests
  if (/wire.transfer|virement|bank.transfer|pay.invoice|transfer.funds|send.money|iban|swift/i.test(combined)) {
    findings.push('Wire transfer / payment request')
    score += 12
  }

  // Secrecy / confidentiality requests
  if (/confidential|keep.this.between|do.not.share|ne.parle.pas|reste.entre.nous|discreet/i.test(combined)) {
    findings.push('Secrecy request (BEC tactic)')
    score += 8
  }

  // Gift card / cryptocurrency
  if (/gift.card|google.play|itunes|amazon.gift|bitcoin|crypto|ethereum|usdt/i.test(combined)) {
    findings.push('Gift card / cryptocurrency request')
    score += 12
  }

  return { score: Math.min(score, 15), findings }
}

// ── 7. Content Patterns (credential harvesting, malware lures) ─────────────
function analyzeContentPatterns(body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0
  const b = body.toLowerCase()

  const patterns: [RegExp, string, number][] = [
    [/enter.*(password|username|credentials|login)/i,         'Password entry request', 10],
    [/update.*(payment|billing|credit.card|card.number)/i,    'Payment update request', 8],
    [/social.security|numéro.de.sécurité.sociale|ssn/i,      'SSN/Social security request', 12],
    [/passport|carte.d.identité|identity.card/i,              'Identity document request', 10],
    [/click.the.link.below|follow.this.link|tap.here/i,       'Explicit link click instruction', 5],
    [/your.account.has.been|votre.compte.a.été/i,             'Account action claim', 6],
    [/attachment|pièce.jointe|download.the.file|télécharge/i, 'Attachment lure', 5],
    [/dear (customer|client|member|user|valued)/i,            'Generic impersonal greeting', 3],
  ]

  for (const [re, finding, points] of patterns) {
    if (re.test(b)) {
      findings.push(finding)
      score += points
    }
  }

  return { score: Math.min(score, 15), findings }
}

// ── 8. Structural Anomalies ───────────────────────────────────────────────────
function analyzeStructuralAnomalies(from: string, subject: string, body: string): { score: number; findings: string[] } {
  const findings: string[] = []
  let score = 0

  // Missing body
  if (!body || body.trim().length < 10) {
    findings.push('Empty or minimal body')
    score += 5
  }

  // Very short body with link (classic phishing pattern)
  if (body && body.trim().length < 150 && /https?:\/\//i.test(body)) {
    findings.push('Short body with URL only')
    score += 6
  }

  // Subject much longer than normal
  if (subject.length > 100) {
    findings.push('Abnormally long subject line')
    score += 3
  }

  // Base64-like content in body (obfuscated HTML)
  if (/[A-Za-z0-9+/]{100,}={0,2}/.test(body)) {
    findings.push('Base64-encoded content detected')
    score += 8
  }

  // Multiple exclamation/question marks
  const excessPunctuation = (body.match(/[!?]{2,}/g) || []).length
  if (excessPunctuation > 3) {
    findings.push('Excessive emotional punctuation')
    score += 3
  }

  return { score: Math.min(score, 10), findings }
}

// ── Master scoring function ───────────────────────────────────────────────────
function computeHeuristicScore(signals: AnalysisSignals): number {
  return Math.min(
    signals.domainSpoofing +
    signals.displayNameSpoof +
    signals.urgencyManipulation +
    signals.suspiciousLinks +
    signals.subjectPatterns +
    signals.becIndicators +
    signals.contentPatterns +
    signals.structuralAnomalies,
    100
  )
}

function classifyThreat(score: number, signals: AnalysisSignals): {
  status: string; severity: string; threatType: string
} {
  // BEC is highest priority
  if (signals.becIndicators >= 12) {
    return {
      status: score >= 40 ? 'blocked' : 'quarantined',
      severity: 'critical',
      threatType: 'bec',
    }
  }
  // Spear-phishing: display name spoof + high score
  if (signals.displayNameSpoof >= 15 && score >= 50) {
    return { status: 'blocked', severity: 'critical', threatType: 'spear-phishing' }
  }
  if (score >= 75) {
    return {
      status: 'blocked',
      severity: 'critical',
      threatType: signals.domainSpoofing >= 15 ? 'spear-phishing' : 'phishing',
    }
  }
  if (score >= 50) {
    return { status: 'quarantined', severity: score >= 65 ? 'high' : 'medium', threatType: 'phishing' }
  }
  if (score >= 25) {
    return { status: 'quarantined', severity: 'low', threatType: 'spam' }
  }
  return { status: 'safe', severity: 'low', threatType: 'none' }
}

// ── Gemini AI enrichment — detailed prompt ────────────────────────────────────
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

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (typeof parsed.score === 'number') {
        return {
          score: Math.min(100, Math.max(0, parsed.score)),
          explanation: parsed.explanation || '',
        }
      }
    }
  } catch { /* Gemini unavailable — fallback to heuristics */ }
  return null
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
      .select('user_id, status, permissions')
      .eq('key', token)
      .single()

    if (keyError || !keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 403 })
    }

    // ── Parse payload ──
    const payload = await request.json()
    const { from = 'unknown', subject = '(No Subject)', body = '', reply_to = '' } = payload

    // ── Run all heuristic analyzers ──
    const domainResult      = analyzeDomainSpoofing(from)
    const displayResult     = analyzeDisplayNameSpoof(from)
    const urgencyResult     = analyzeUrgency(subject, body)
    const linksResult       = analyzeSuspiciousLinks(body)
    const subjectResult     = analyzeSubjectPatterns(subject)
    const becResult         = analyzeBEC(from, subject, body)
    const contentResult     = analyzeContentPatterns(body)
    const structuralResult  = analyzeStructuralAnomalies(from, subject, body)

    const signals: AnalysisSignals = {
      domainSpoofing:       domainResult.score,
      displayNameSpoof:     displayResult.score,
      urgencyManipulation:  urgencyResult.score,
      suspiciousLinks:      linksResult.score,
      subjectPatterns:      subjectResult.score,
      becIndicators:        becResult.score,
      contentPatterns:      contentResult.score,
      structuralAnomalies:  structuralResult.score,
    }

    const allFindings = [
      ...domainResult.findings,
      ...displayResult.findings,
      ...urgencyResult.findings,
      ...linksResult.findings,
      ...subjectResult.findings,
      ...becResult.findings,
      ...contentResult.findings,
      ...structuralResult.findings,
    ]

    let heuristicScore = computeHeuristicScore(signals)

    // ── Gemini enrichment: weighted blend (55% heuristic / 45% AI) ──
    let finalScore = heuristicScore
    let explanation = ''
    let engine = 'heuristic-v2'

    const geminiResult = await enrichWithGemini(from, subject, body, heuristicScore, allFindings)
    if (geminiResult !== null) {
      finalScore = Math.round(heuristicScore * 0.55 + geminiResult.score * 0.45)
      explanation = geminiResult.explanation
      engine = 'gemini-2.0-flash+heuristic-v2'
    }

    finalScore = Math.min(100, Math.max(0, finalScore))

    const { status, severity, threatType } = classifyThreat(finalScore, signals)

    // ── Persist email record ──
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
      .select()
      .single()

    if (emailError) throw new Error(emailError.message)

    // ── Persist threat record (if malicious) ──
    if (status !== 'safe') {
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

    // ── Update API key last used ──
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('key', token)

    // ── Response ──
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
      findings:   allFindings,
      email_id:   emailData.id,
    })

  } catch (error: any) {
    console.error('[analyze] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
