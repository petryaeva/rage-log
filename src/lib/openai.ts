import OpenAI from "openai"

let client: OpenAI | undefined

function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

/**
 * Server-only. Import from Route Handlers, Server Actions, or other server code only.
 * Returns `null` when `OPENAI_API_KEY` is not set.
 */
export function getOpenAIClient(): OpenAI | null {
  if (!isOpenAIConfigured()) {
    return null
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return client
}
