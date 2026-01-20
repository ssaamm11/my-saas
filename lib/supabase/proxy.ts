import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // make the new cookies visible to downstream handlers in this same request
            request.cookies.set(name, value)
            // persist cookies back to the browser
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: for server-side protection, Supabase recommends getClaims (not getSession)
  await supabase.auth.getClaims()

  return response
}
