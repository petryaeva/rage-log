import { getOpenAIClient } from "@/lib/openai"
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
      const lines = [
        `${i + 1}. Дата: ${e.createdAt || "—"}`,
        e.intensity != null ? `Интенсивность: ${e.intensity}/10` : null,
        e.trigger ? `Триггер: ${e.trigger}` : null,
        `Заметки: ${truncate(e.notes, MAX_NOTES_CHARS)}`,
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
 * Sends `prompt` and journal `entries` to the configured OpenAI chat model.
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

  const openai = getOpenAIClient()
  if (!openai) {
    return {
      ok: false,
      code: "config",
      error: "OPENAI_API_KEY не задан.",
    }
  }

  const entriesBlock =
    entries.length > 0
      ? `Записи пользователя:\n\n${formatEntriesForPrompt(entries)}`
      : "Записей нет."

  const userContent = `${trimmed}\n\n${entriesBlock}`

  try {
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
    const completion = await openai.chat.completions.create({
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
    const message = e instanceof Error ? e.message : "Ошибка OpenAI."
    return { ok: false, code: "upstream", error: message }
  }
}
