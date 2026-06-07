import { NextResponse } from 'next/server'

// ─── Health check — no auth required ──────────────────────────────────────────
// Standard endpoint for monitoring, uptime checks, and enterprise integration validation

export async function GET() {
  const geminiConfigured = !!process.env.GEMINI_API_KEY
  const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

  return NextResponse.json({
    status: 'ok',
    service: 'PhishGuard.IA',
    version: '2.0',
    engine: 'heuristic-v2' + (geminiConfigured ? '+gemini-2.0-flash' : ''),
    capabilities: {
      heuristic_analysis: true,
      gemini_enrichment: geminiConfigured,
      batch_endpoint: true,
      gmail_sync: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    endpoints: {
      analyze: '/api/v1/analyze',
      batch:   '/api/v1/batch',
      health:  '/api/v1/health',
    },
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
