import OpenAI from "openai"

const GROQ_OPENAI_BASE_URL = "https://api.groq.com/openai/v1"

let client: OpenAI | undefined

/** Groq key; `OPENAI_API_KEY` is accepted so existing Vercel/.env names keep working after the provider switch. */
function getGroqApiKey(): string | undefined {
  const k =
    process.env.GROQ_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim()
  return k || undefined
}

function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey())
}

/**
 * Server-only. Import from Route Handlers, Server Actions, or other server code only.
 * Groq exposes an OpenAI-compatible API; we use the official `openai` SDK with `baseURL`.
 * Returns `null` when neither `GROQ_API_KEY` nor `OPENAI_API_KEY` is set.
 */
export function getGroqClient(): OpenAI | null {
  const apiKey = getGroqApiKey()
  if (!apiKey) {
    return null
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: GROQ_OPENAI_BASE_URL,
    })
  }
  return client
}
