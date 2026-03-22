import OpenAI from "openai"

const GROQ_OPENAI_BASE_URL = "https://api.groq.com/openai/v1"

let client: OpenAI | undefined

function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim())
}

/**
 * Server-only. Import from Route Handlers, Server Actions, or other server code only.
 * Groq exposes an OpenAI-compatible API; we use the official `openai` SDK with `baseURL`.
 * Returns `null` when `GROQ_API_KEY` is not set.
 */
export function getGroqClient(): OpenAI | null {
  if (!isGroqConfigured()) {
    return null
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: GROQ_OPENAI_BASE_URL,
    })
  }
  return client
}
