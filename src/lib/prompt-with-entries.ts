import { getGroqClient } from "@/lib/groq"
import type { Entry } from "@/types/entry"

const MAX_PROMPT_CHARS = 16_000
const MAX_ENTRIES = 200
const MAX_NOTES_CHARS = 8_000

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}

function formatEntriesForPrompt(entries: Entry[]): string {
  return entries
    .map((e, i) => {
      const when = e.episodeAt || e.createdAt || "—"
      const lines = [
        `${i + 1}. Дата: ${when}`,
        e.intensity != null ? `Возбуждение: ${e.intensity}/10` : null,
        e.aggression != null ? `Агрессия: ${e.aggression}/10` : null,
        e.triggers?.trim()
          ? `Триггеры: ${e.triggers.trim()}`
          : e.trigger?.trim()
            ? `Триггеры: ${e.trigger.trim()}`
            : null,
        e.factors?.trim() ? `Факторы: ${truncate(e.factors, MAX_NOTES_CHARS)}` : null,
        e.outcome?.trim() ? `Итог: ${truncate(e.outcome, MAX_NOTES_CHARS)}` : null,
        `Описание: ${truncate(e.notes, MAX_NOTES_CHARS)}`,
      ].filter(Boolean)
      return lines.join("\n")
    })
    .join("\n\n---\n\n")
}

export type PromptWithEntriesResult =
  | { ok: true; text: string }
  | {
      ok: false
      code: "validation" | "config" | "upstream"
      error: string
    }

/**
 * Sends `prompt` and journal `entries` to the configured Groq chat model.
 * Returns assistant text or a short error message.
 */
export async function completePromptWithEntries(
  prompt: string,
  entries: Entry[]
): Promise<PromptWithEntriesResult> {
  const trimmed = prompt.trim()
  if (!trimmed) {
    return { ok: false, code: "validation", error: "Промпт пустой." }
  }
  if (trimmed.length > MAX_PROMPT_CHARS) {
    return {
      ok: false,
      code: "validation",
      error: "Промпт слишком длинный.",
    }
  }
  if (entries.length > MAX_ENTRIES) {
    return { ok: false, code: "validation", error: "Слишком много записей." }
  }

  const groq = getGroqClient()
  if (!groq) {
    return {
      ok: false,
      code: "config",
      error:
        "Нет ключа API: задайте GROQ_API_KEY в .env или Vercel (допустимо имя OPENAI_API_KEY). Ключ: console.groq.com.",
    }
  }

  const entriesBlock =
    entries.length > 0
      ? `Записи пользователя:\n\n${formatEntriesForPrompt(entries)}`
      : "Записей нет."

  const userContent = `${trimmed}\n\n${entriesBlock}`

  try {
    const model =
      process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile"
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Ты помощник для дневника эмоций и злости. Отвечай по существу на языке пользователя (если промпт на русском — по-русски). Не выдумывай факты вне переданных записей.",
        },
        { role: "user", content: userContent },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim()
    if (!text) {
      return {
        ok: false,
        code: "upstream",
        error: "Пустой ответ модели.",
      }
    }
    return { ok: true, text }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка Groq."
    return { ok: false, code: "upstream", error: message }
  }
}
