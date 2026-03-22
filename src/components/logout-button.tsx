"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ROUTE_LOGIN } from "@/lib/routes"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type LogoutButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "type"
>

export function LogoutButton({
  className,
  variant = "outline",
  disabled,
  children = "Выйти",
  ...props
}: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const supabase = getSupabaseClient()

  async function handleLogout() {
    if (!supabase) return
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.replace(ROUTE_LOGIN)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn(className)}
      disabled={Boolean(disabled) || loading || !supabase}
      onClick={handleLogout}
      {...props}
    >
      {loading ? "Выход…" : children}
    </Button>
  )
}
