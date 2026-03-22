"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth-provider"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace("/login")
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
