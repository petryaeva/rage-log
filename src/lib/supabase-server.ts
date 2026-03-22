import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"

import { isSupabaseConfigured } from "@/lib/supabaseClient"

/**
 * Supabase client bound to the current request cookies (user session).
 * Use in Route Handlers and Server Actions only.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Cookie writes can fail outside middleware; session refresh may be handled there.
          }
        },
      },
    }
  )
}

/**
 * For Route Handlers: reads session from {@link NextRequest.cookies} (same as the browser sent).
 * `cookies()` from `next/headers` often does not expose auth cookies correctly here, so `getUser()`
 * was null and inserts never ran. Pending cookie updates (refresh) are applied on the response.
 */
export function createSupabaseRouteHandlerClient(request: NextRequest): {
  supabase: SupabaseClient
  applyPendingCookies: (response: NextResponse) => void
} | null {
  if (!isSupabaseConfigured()) {
    return null
  }

  const pending: {
    name: string
    value: string
    options?: Parameters<NextResponse["cookies"]["set"]>[2]
  }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          pending.push(...cookiesToSet)
        },
      },
    }
  )

  return {
    supabase,
    applyPendingCookies(response: NextResponse) {
      pending.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
    },
  }
}
