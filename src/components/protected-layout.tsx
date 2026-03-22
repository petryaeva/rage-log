"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth-provider"
import { ROUTE_LOGIN } from "@/lib/routes"
import { Skeleton } from "@/components/ui/skeleton"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace(ROUTE_LOGIN)
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div
        className="flex min-h-full flex-1 flex-col items-center p-5 sm:p-8"
        role="status"
        aria-busy="true"
        aria-label="Загрузка приложения"
      >
        <div className="flex w-full max-w-lg flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-11 w-20 rounded-lg sm:h-8 sm:w-[4.5rem]" />
          </div>
          <Skeleton className="h-44 w-full rounded-xl sm:h-52" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
