import type { ReactNode } from "react"

import { AppNav } from "@/components/app-nav"
import { LogoutButton } from "@/components/logout-button"
import { ProtectedLayout } from "@/components/protected-layout"

export default function ProtectedGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ProtectedLayout>
      <div className="mx-auto flex min-h-full w-full max-w-[40rem] flex-1 flex-col px-3 pb-8 pt-5 sm:px-4 sm:pb-10 sm:pt-8">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5 sm:gap-4">
          <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            RageLog
          </h1>
          <LogoutButton className="h-11 min-h-11 shrink-0 px-4 text-base sm:h-8 sm:min-h-8 sm:px-2.5 sm:text-sm" />
        </div>
        <AppNav />
        <div className="mt-5 flex flex-1 flex-col gap-5 sm:mt-6 sm:gap-6">
          {children}
        </div>
      </div>
    </ProtectedLayout>
  )
}
