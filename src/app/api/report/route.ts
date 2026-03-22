import { NextRequest, NextResponse } from "next/server"

import { parseEntriesFromRequestBody } from "@/lib/parse-entry-body"
import { completePromptWithEntries } from "@/lib/prompt-with-entries"
import { insertReport } from "@/lib/reports"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Entry } from "@/types/entry"

function statusForResult(
  code: "validation" | "config" | "upstream"
): number {
  if (code === "config") {
    return 503
  }
  if (code === "upstream") {
    return 502
  }
  return 400
}

/**
 * GET: краткая подсказка по формату тела POST.
 * POST: `{ "prompt": string, "entries"?: Entry[] }` → ответ **текстом** (тело = ответ модели).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      'POST JSON: { "prompt": string, "entries"?: Entry[] } → ответ text/plain с текстом модели.',
  })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 })
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Ожидается объект JSON." },
      { status: 400 }
    )
  }

  const b = body as Record<string, unknown>
  if (typeof b.prompt !== "string") {
    return NextResponse.json(
      { error: "Поле prompt обязательно и должно быть строкой." },
      { status: 400 }
    )
  }

  let entries: Entry[] = []
  if (b.entries !== undefined) {
    const parsed = parseEntriesFromRequestBody(b.entries)
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Поле entries должно быть массивом объектов с обязательным notes (string).",
        },
        { status: 400 }
      )
    }
    entries = parsed
  }

  const result = await completePromptWithEntries(b.prompt, entries)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: statusForResult(result.code) }
    )
  }

  const supabase = await createSupabaseServerClient()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { error: insertError } = await insertReport(
        {
          userId: user.id,
          prompt: b.prompt,
          body: result.text,
          entriesSnapshot: entries.length > 0 ? entries : null,
        },
        supabase
      )
      if (insertError) {
        console.error("[report] insert reports:", insertError.message)
      }
    }
  }

  return new NextResponse(result.text, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
