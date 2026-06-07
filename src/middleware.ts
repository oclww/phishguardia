import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAINTENANCE = process.env.MAINTENANCE === 'true'

// Pages qui restent accessibles même en maintenance
const BYPASS = ['/maintenance', '/api/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (MAINTENANCE && !BYPASS.some(p => pathname.startsWith(p))) {
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
