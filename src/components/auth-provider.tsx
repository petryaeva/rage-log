"use client"

import * as React from "react"
import type { Session } from "@supabase/supabase-js"

import { getSupabaseClient } from "@/lib/supabaseClient"

type AuthContextValue = {
  session: Session | null
  isLoading: boolean
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

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
    () => ({ session, isLoading }),
    [session, isLoading]
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
