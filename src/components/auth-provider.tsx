"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import type { Session } from "@supabase/supabase-js"

import { getSupabaseClient } from "@/lib/supabaseClient"

type AuthContextValue = {
  session: Session | null
  isLoading: boolean
  /** Call after sign-in/sign-up so protected routes see the session before navigating. */
  refreshSession: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const refreshSession = React.useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      flushSync(() => setSession(null))
      return
    }
    const {
      data: { session: next },
    } = await supabase.auth.getSession()
    flushSync(() => setSession(next))
  }, [])

  React.useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setSession(null)
      setIsLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = React.useMemo(
    () => ({ session, isLoading, refreshSession }),
    [session, isLoading, refreshSession]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
