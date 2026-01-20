import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow Stripe webhooks (no auth)
  if (pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.next()
  }

  // Everything else (including /api/stripe/checkout) should still run updateSession
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


