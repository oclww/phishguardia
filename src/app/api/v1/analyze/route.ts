import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ─── Heuristic Analysis Engine ───────────────────────────────────────────────

interface AnalysisSignals {
  domainSpoofing: number      // 0-30
  urgencyKeywords: number     // 0-20
  suspiciousLinks: number     // 0-20
  subjectPatterns: number     // 0-15
  senderAnomaly: number       // 0-15
}

function analyzeDomainSpoofing(from: string): number {
  const domain = from.split('@')[1]?.toLowerCase() || ''
  const spoofPatterns = [
    /micros0ft|m1crosoft/i,
    /paypa1|payp4l|p4ypal/i,
    /g00gle|go0gle|googl3/i,
    /amaz0n|amaz-on|arnazon/i,
    /app1e|appl3|ap-ple/i,
    /faceb00k|faceboook/i,
    /linkedln|1inkedin/i,
    /-secure\.|\.secure-/i,
    /alert\.|warning\.|security\./i,
  ]
  let score = 0
  if (spoofPatterns.some(p => p.test(domain) || p.test(from))) score += 25
  if ((domain.match(/\./g) || []).length > 3) score += 10
  if (/\d{3,}/.test(domain)) score += 8
  if (domain.includes('-') && domain.split('.').length > 2) score += 5
  return Math.min(score, 30)
}

function analyzeUrgency(subject: string, body: string): number {
  const urgencyWords = [
    'urgent', 'immédiat', 'action requise', 'action required',
    'verify now', 'suspended', 'suspendu', 'compte bloqué', 'account suspended',
    'expiring', 'last warning', 'dernier avertissement', 'final notice',
    '24 hours', '24 heures', 'click immediately', 'cliquez immédiatement',
    'compromised', 'compromis', 'verify your account', 'vérifiez votre compte',
  ]
  const combined = `${subject} ${body}`.toLowerCase()
  const matches = urgencyWords.filter(w => combined.includes(w)).length
  return Math.min(matches * 4, 20)
}

function analyzeSuspiciousLinks(body: string): number {
  const urlPattern = /https?:\/\/[^\s"'<>]+/gi
  const urls = body.match(urlPattern) || []
  let score = 0
  for (const url of urls) {
    try {
      const u = new URL(url)
      if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) score += 15
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|rb\.gy/i.test(u.hostname)) score += 10
      if (/login|verify|confirm|secure|account|update|password/i.test(u.pathname)) score += 5
      if (u.port && !['80', '443'].includes(u.port)) score += 8
    } catch { /* ignore invalid URLs */ }
  }
  return Math.min(score, 20)
}

function analyzeSubjectPatterns(subject: string): number {
  const patterns = [
    { re: /\$\d+|\€\d+/i, score: 5 },
    { re: /password|mot de passe/i, score: 8 },
    { re: /invoice|facture|payment|paiement/i, score: 4 },
    { re: /!!+|urgent!|attention!/i, score: 6 },
    { re: /you have won|vous avez gagné/i, score: 15 },
    { re: /click here|cliquez ici/i, score: 5 },
    { re: /confirm your (account|identity)/i, score: 10 },
    { re: /account.*suspended|compte.*suspendu/i, score: 12 },
  ]
  let score = 0
  for (const p of patterns) { if (p.re.test(subject)) score += p.score }
  return Math.min(score, 15)
}

function analyzeSenderAnomaly(from: string, subject: string): number {
  let score = 0
  const becNames = /ceo|cfo|cto|directeur|président|vp |vice.president/i
  const freemail = /gmail|yahoo|hotmail|outlook\.com|proton|gmx/i
  if (becNames.test(subject) && freemail.test(from)) score += 15
  if (/\s<[^>]+>/.test(from) && freemail.test(from)) score += 8
  return Math.min(score, 15)
}

function computeAiScore(signals: AnalysisSignals): number {
  const raw = signals.domainSpoofing + signals.urgencyKeywords +
              signals.suspiciousLinks + signals.subjectPatterns + signals.senderAnomaly
  const normalized = Math.min(Math.round((raw / 100) * 100), 100)
  const jitter = Math.floor(Math.random() * 7) - 3
  return Math.max(0, Math.min(100, normalized + jitter))
}

function classifyThreat(score: number, signals: AnalysisSignals) {
  if (signals.senderAnomaly >= 12) {
    return {
      status: score > 40 ? 'blocked' : 'quarantined',
      severity: score > 60 ? 'critical' : 'high',
      threatType: 'bec'
    }
  }
  if (score >= 75) {
    return {
      status: 'blocked',
      severity: 'critical',
      threatType: signals.domainSpoofing > 15 ? 'spear-phishing' : 'malware'
    }
  }
  if (score >= 45) {
    return { status: 'quarantined', severity: score >= 60 ? 'high' : 'medium', threatType: 'phishing' }
  }
  return { status: 'safe', severity: 'low', threatType: 'none' }
}

// ─── Optional: Gemini AI enrichment ──────────────────────────────────────────
async function enrichWithGemini(from: string, subject: string, body: string): Promise<number | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  try {
    const prompt = `You are a cybersecurity expert specializing in email phishing detection.
Analyze this email and return ONLY a JSON object with a "score" field (0-100 integer, 0=safe, 100=definitely phishing/malicious).

From: ${from}
Subject: ${subject}
Body: ${body?.slice(0, 1000) || '(no body)'}

Return only valid JSON: {"score": <number>}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 64 }
        }),
        signal: AbortSignal.timeout(5000)
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = text.match(/"score"\s*:\s*(\d+)/)
    if (match) return Math.min(100, Math.max(0, parseInt(match[1])))
  } catch { /* Gemini unavailable — fallback to heuristics */ }
  return null
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    const payload = await request.json()
    const { from = 'unknown', subject = '(No Subject)', body = '' } = payload

    // ─── Run heuristic analysis ───
    const signals: AnalysisSignals = {
      domainSpoofing:  analyzeDomainSpoofing(from),
      urgencyKeywords: analyzeUrgency(subject, body),
      suspiciousLinks: analyzeSuspiciousLinks(body),
      subjectPatterns: analyzeSubjectPatterns(subject),
      senderAnomaly:   analyzeSenderAnomaly(from, subject),
    }

    let aiScore = computeAiScore(signals)

    // ─── Optional Gemini enrichment (60% heuristic / 40% AI) ───
    const geminiScore = await enrichWithGemini(from, subject, body)
    if (geminiScore !== null) {
      aiScore = Math.round(aiScore * 0.6 + geminiScore * 0.4)
    }

    const { status, severity, threatType } = classifyThreat(aiScore, signals)

    // ─── Persist email ───
    const { data: emailData, error: emailError } = await supabase
      .from('emails')
      .insert([{
        user_id: keyData.user_id,
        from_email: from,
        subject,
        status: status === 'safe' ? 'safe' : 'malicious',
        ai_score: aiScore,
        threat_type: status !== 'safe' ? threatType : null
      }])
      .select()
      .single()

    if (emailError) throw new Error(emailError.message)

    // ─── Persist threat if detected ───
    if (status !== 'safe') {
      await supabase.from('threats').insert([{
        user_id: keyData.user_id,
        email_id: emailData.id,
        type: threatType,
        severity,
        sender_email: from,
        subject,
        status,
        ai_score: aiScore,
      }])
    }

    await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('key', token)

    return NextResponse.json({
      success: true,
      message: 'Email analyzed successfully',
      ai_score: aiScore,
      threat_type: status !== 'safe' ? threatType : 'none',
      status,
      severity,
      signals,
      engine: geminiScore !== null ? 'gemini+heuristic' : 'heuristic',
      email_id: emailData.id
    })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
