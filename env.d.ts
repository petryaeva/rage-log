declare namespace NodeJS {
  interface ProcessEnv {
    /** Present in production; may be unset locally until `.env.local` is added. */
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
    OPENAI_API_KEY?: string
    /** Необязательно; по умолчанию gpt-4o-mini */
    OPENAI_MODEL?: string
  }
}
