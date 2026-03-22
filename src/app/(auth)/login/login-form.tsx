"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { ROUTE_ENTRY_FORM } from "@/lib/routes"

function isLikelyExistingUserSignUpError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already")
  )
}

function shouldSkipSignUpAfterSignInError(message: string): boolean {
  return /confirm|verify|banned|rate|many|attempt|429/i.test(message)
}

export function LoginForm() {
  const router = useRouter()
  const { session, isLoading: authLoading } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [signupHint, setSignupHint] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (authLoading || !session) return
    router.replace(ROUTE_ENTRY_FORM)
  }, [authLoading, session, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSignupHint(null)
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError(
          "Supabase не настроен. В .env.local укажите непустые NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY из Supabase → Settings → API, сохраните файл и перезапустите сервер разработки."
        )
        return
      }

      if (password.length < 6) {
        setError("Пароль не короче 6 символов.")
        return
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (!signInError && signInData.session) {
        router.replace(ROUTE_ENTRY_FORM)
        router.refresh()
        return
      }

      if (signInError) {
        if (shouldSkipSignUpAfterSignInError(signInError.message)) {
          setError(signInError.message)
          return
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${ROUTE_ENTRY_FORM}`,
          },
        })

        if (signUpError) {
          if (isLikelyExistingUserSignUpError(signUpError.message)) {
            setError("Неверный email или пароль.")
          } else {
            setError(signUpError.message)
          }
          return
        }

        if (signUpData.session) {
          router.replace(ROUTE_ENTRY_FORM)
          router.refresh()
          return
        }

        setSignupHint(
          "Аккаунт создан."
        )
        return
      }

      if (!signInError && !signInData.session) {
        setError("Не удалось войти. Попробуйте ещё раз.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (session) {
    return null
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-email">
              Электронная почта
            </label>
            <Input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-password">
              Пароль
            </label>
            <Input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          {signupHint ? (
            <p className="text-muted-foreground text-sm" role="status">
              {signupHint}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Продолжение…" : "Продолжить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
