import type { ReactNode } from "react"

import { ProtectedLayout } from "@/components/protected-layout"

export default function ProtectedGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
