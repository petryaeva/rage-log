/** Общие функции для форм входа и регистрации (Supabase Auth). */

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

/** Только trim — вторая попытка входа, если в Auth email в исходном регистре. */
export function trimEmail(raw: string): string {
  return raw.trim()
}

export function supabaseProjectRefFromUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return null
  try {
    const host = new URL(raw).hostname
    const sub = host.split(".")[0]
    return sub && sub !== "localhost" ? sub : host
  } catch {
    return null
  }
}

export function authErrorCode(err: { code?: string } | null): string {
  const c = err?.code
  return typeof c === "string" ? c : ""
}

export function mapSignInError(message: string, code: string): string {
  const m = message.toLowerCase()
  if (code === "email_not_confirmed") {
    return "Подтвердите email по ссылке из письма."
  }
  if (code === "user_banned") {
    return "Аккаунт заблокирован. Обратитесь в поддержку."
  }
  if (
    code === "invalid_credentials" ||
    m.includes("invalid login credentials") ||
    m.includes("invalid_credentials")
  ) {
    return "Неверный email или пароль. Если аккаунта ещё нет — зарегистрируйтесь."
  }
  return message
}

export function mapSignUpError(message: string, code: string): string {
  const m = message.toLowerCase()
  if (
    code === "user_already_exists" ||
    m.includes("already registered") ||
    m.includes("user already") ||
    m.includes("already been registered")
  ) {
    return "Этот email уже зарегистрирован. Войдите или задайте другой адрес."
  }
  if (code === "email_not_confirmed") {
    return "Проверьте почту и перейдите по ссылке для подтверждения."
  }
  if (/rate|too many|429|email rate/i.test(m)) {
    return "Слишком много запросов. Подождите немного и попробуйте снова."
  }
  if (code === "weak_password" || m.includes("password")) {
    return message
  }
  return message
}
