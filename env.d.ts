declare namespace NodeJS {
  interface ProcessEnv {
    /** Present in production; may be unset locally until `.env.local` is added. */
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
    /** Groq API key (https://console.groq.com). Set in Vercel → Project → Settings → Environment Variables. */
    GROQ_API_KEY?: string
    /** Необязательно; по умолчанию llama-3.3-70b-versatile */
    GROQ_MODEL?: string
  }
}
