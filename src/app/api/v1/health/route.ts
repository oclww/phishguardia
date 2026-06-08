import { NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  const geminiConfigured   = !!process.env.GEMINI_API_KEY
  const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  const gmailConfigured    = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return NextResponse.json({
    status:  'ok',
    service: 'PhishGuard.IA',
    version: '2.0',
    engine:  'heuristic-v2' + (geminiConfigured ? '+gemini-2.0-flash' : ''),
    capabilities: {
      heuristic_analysis: true,
      gemini_enrichment:  geminiConfigured,
      supabase_connected: supabaseConfigured,
      batch_endpoint:     true,
      gmail_sync:         gmailConfigured,
    },
    endpoints: {
      analyze: '/api/v1/analyze',
      batch:   '/api/v1/batch',
      health:  '/api/v1/health',
    },
    timestamp: new Date().toISOString(),
  }, { headers: { ...corsHeaders, 'Cache-Control': 'no-cache, no-store, must-revalidate' } })
}
