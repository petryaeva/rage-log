import type { Entry } from "@/types/entry"

function parseOptionalString(
  o: Record<string, unknown>,
  key: string
): string | null | undefined {
  if (!(key in o)) return undefined
  const v = o[key]
  if (v === null) return null
  if (typeof v === "string") return v
  return undefined
}

/** Validates one JSON object shaped like {@link Entry} (camelCase) from the client. */
export function parseEntryFromRequestBody(item: unknown): Entry | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null
  }
  const o = item as Record<string, unknown>
  if (typeof o.notes !== "string") {
    return null
  }

  const id = typeof o.id === "string" ? o.id : ""
  const userId = typeof o.userId === "string" ? o.userId : ""
  const createdAt = typeof o.createdAt === "string" ? o.createdAt : ""
  const updatedAt =
    typeof o.updatedAt === "string" ? o.updatedAt : createdAt || ""

  const episodeAt = parseOptionalString(o, "episodeAt")
  const intensity = parseOptionalNumber(o, "intensity")
  const aggression = parseOptionalNumber(o, "aggression")
  const trigger = parseOptionalString(o, "trigger")
  const triggers = parseOptionalString(o, "triggers")
  const factors = parseOptionalString(o, "factors")
  const outcome = parseOptionalString(o, "outcome")

  return {
    id,
    userId,
    notes: o.notes,
    episodeAt: episodeAt ?? null,
    intensity,
    aggression,
    trigger: trigger ?? null,
    triggers: triggers ?? null,
    factors: factors ?? null,
    outcome: outcome ?? null,
    createdAt,
    updatedAt,
  }
}

function parseOptionalNumber(
  o: Record<string, unknown>,
  key: string
): number | null | undefined {
  if (!(key in o)) return undefined
  const v = o[key]
  if (v === null) return null
  if (typeof v === "number" && Number.isFinite(v)) return v
  return undefined
}

export function parseEntriesFromRequestBody(raw: unknown): Entry[] | null {
  if (!Array.isArray(raw)) {
    return null
  }
  const out: Entry[] = []
  for (const item of raw) {
    const entry = parseEntryFromRequestBody(item)
    if (!entry) {
      return null
    }
    out.push(entry)
  }
  return out
}
