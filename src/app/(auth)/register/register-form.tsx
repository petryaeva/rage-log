"use client"

import * as React from "react"
import Link from "next/link"
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
import {
  authErrorCode,
  mapSignUpError,
  normalizeEmail,
} from "@/lib/auth-helpers"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { ROUTE_ENTRY_FORM, ROUTE_LOGIN } from "@/lib/routes"

export function RegisterForm() {
  const router = useRouter()
  const { session, isLoading: authLoading, refreshSession } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (authLoading || !session) return
    router.replace(ROUTE_ENTRY_FORM)
  }, [authLoading, session, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
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

      const emailNorm = normalizeEmail(email)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailNorm,
        password,
      })

      if (signUpError) {
        const raw = signUpError.message
        const code = authErrorCode(signUpError)
        if (/banned|rate|429|too many|attempt/i.test(raw)) {
          setError(raw)
          return
        }
        setError(mapSignUpError(raw, code))
        return
      }

      if (data.session) {
        await refreshSession()
        window.location.assign(ROUTE_ENTRY_FORM)
        return
      }

      setInfo(
        "Аккаунт создан. Проверьте почту и перейдите по ссылке."
      )
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
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
        <CardTitle>Регистрация</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="register-email">
              Электронная почта
            </label>
            <Input
              id="register-email"
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
            <label className="text-sm font-medium" htmlFor="register-password">
              Пароль
            </label>
            <Input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
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
          {info ? (
            <p className="text-muted-foreground text-sm" role="status">
              {info}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Создание…" : "Создать аккаунт"}
          </Button>
        </form>
        <p className="text-muted-foreground text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link
            href={ROUTE_LOGIN}
            className="text-foreground font-medium underline underline-offset-4"
          >
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
